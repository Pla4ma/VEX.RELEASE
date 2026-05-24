import type { FeatureAvailability } from '../liveops-config';
import type { CompanionState } from '../companion/types';
import { ACTION_LABELS, PROGRESS_REACTIONS, STYLE_ADAPTATION } from './copy';
import { getCoachMemoryConfidence, getCoachPresenceMessage } from './copy-service';
import {
  CoachPresenceMemorySummarySchema,
  CoachPresenceProgressInputSchema,
  CoachPresenceSchema,
  CompletionPresenceSummarySchema,
  type CoachActionIntent,
  type CoachPresence,
  type CoachPresenceMemorySummary,
  type CoachPresenceMotivationStyle,
  type CoachPresenceProgressInput,
  type CoachPresenceVisualState,
  type CompletionPresenceSummary,
} from './schemas';

interface PresenceAvailability {
  focus: FeatureAvailability;
  progress: FeatureAvailability;
  study: FeatureAvailability;
}

interface BuildPresenceInput {
  companion: Pick<CompanionState, 'currentMood' | 'element' | 'level' | 'phase'> | null;
  featureAvailability: PresenceAvailability;
  memorySummary: CoachPresenceMemorySummary;
  motivationStyle: CoachPresenceMotivationStyle;
  progress: CoachPresenceProgressInput;
  surface: 'HOME' | 'SESSION_SETUP' | 'CHAT';
}

interface CompletionPresenceInput {
  featureAvailability: PresenceAvailability;
  memorySummary: CoachPresenceMemorySummary;
  motivationStyle: CoachPresenceMotivationStyle;
  summary: CompletionPresenceSummary;
}

export function resolveCoachActionIntent(input: {
  requestedIntent: CoachActionIntent;
  featureAvailability: PresenceAvailability;
}): CoachActionIntent {
  if (input.requestedIntent === 'START_STUDY_SESSION' && input.featureAvailability.study.canNavigate) {
    return 'START_STUDY_SESSION';
  }
  if (input.requestedIntent === 'REVIEW_PROGRESS' && input.featureAvailability.progress.canNavigate) {
    return 'REVIEW_PROGRESS';
  }
  if (
    (input.requestedIntent === 'CONTINUE_PLAN' || input.requestedIntent === 'REFLECT') &&
    input.featureAvailability.study.canNavigate
  ) {
    return input.requestedIntent;
  }
  if (input.requestedIntent === 'TAKE_BREAK') {
    return 'TAKE_BREAK';
  }
  return input.featureAvailability.focus.canNavigate ? 'START_SESSION' : 'TAKE_BREAK';
}

export function buildCoachPresence(input: BuildPresenceInput): CoachPresence {
  const progress = CoachPresenceProgressInputSchema.parse(input.progress);
  const memorySummary = CoachPresenceMemorySummarySchema.parse(input.memorySummary);
  const memoryConfidence = getCoachMemoryConfidence(
    progress.totalSessions,
    memorySummary.syncAvailable,
  );
  const resolved = getCoachPresenceMessage({
    aiAvailable: memorySummary.syncAvailable,
    bossIntensity: null,
    comebackState: null,
    completionContext: null,
    firstWeekStage: progress.totalSessions === 0 ? 'day_0' : null,
    latestSession: null,
    memoryConfidence,
    motivationStyle: input.motivationStyle,
    premiumMoment: progress.totalSessions >= 5 ? 'soft_tease' : 'none',
    primaryGoal: input.motivationStyle === 'STUDY_FOCUSED' ? 'study' : 'focus',
    sessionMode: 'inactive',
    studyLayerLabel: input.motivationStyle === 'STUDY_FOCUSED' ? 'Study' : null,
  });
  const intent = resolveCoachActionIntent({
    featureAvailability: input.featureAvailability,
    requestedIntent: resolved.safeIntent,
  });

  return CoachPresenceSchema.parse({
    id: `coach-presence:${input.surface.toLowerCase()}`,
    memoryConfidence,
    memorySummary,
    message: resolved.message,
    motivationStyleAdaptation: STYLE_ADAPTATION[input.motivationStyle],
    nextAction: { intent, label: ACTION_LABELS[intent], reason: getActionReason(intent, input.motivationStyle) },
    progressReaction: PROGRESS_REACTIONS[input.motivationStyle],
    sessionReflection: resolved.message,
    tone: getTone(input.motivationStyle),
    visualCompanionState: getVisualState(input.companion, input.motivationStyle),
  });
}

export function buildCompletionCoachPresence(input: CompletionPresenceInput): CoachPresence {
  const summary = CompletionPresenceSummarySchema.parse(input.summary);
  const memorySummary = CoachPresenceMemorySummarySchema.parse(input.memorySummary);
  const memoryConfidence = getCoachMemoryConfidence(summary.isFirstSession ? 1 : 3, memorySummary.syncAvailable);
  const reflection = getCoachPresenceMessage({
    aiAvailable: memorySummary.syncAvailable,
    bossIntensity: null,
    comebackState: summary.isComeback ? 'missed_1_day' : null,
    completionContext: summary.isFirstSession ? 'first_session' : summary.isComeback ? 'comeback' : null,
    firstWeekStage: summary.isFirstSession ? 'after_session_1' : null,
    latestSession: {
      durationMinutes: summary.durationMinutes,
      focusPurityScore: summary.focusPurityScore,
      isComeback: summary.isComeback,
      mode: summary.sessionMode,
    },
    memoryConfidence,
    motivationStyle: input.motivationStyle,
    premiumMoment: 'none',
    primaryGoal: summary.sessionMode === 'STUDY' ? 'study' : 'focus',
    sessionMode: 'completed',
    studyLayerLabel: summary.sessionMode === 'STUDY' ? 'Study' : null,
  });
  const base = buildCoachPresence({
    companion: null,
    featureAvailability: input.featureAvailability,
    memorySummary,
    motivationStyle: input.motivationStyle,
    progress: {
      currentStreakDays: summary.streakDays,
      highFocusStreak: summary.isHighFocusStreak ? 1 : 0,
      totalSessions: summary.isFirstSession ? 1 : 3,
    },
    surface: 'SESSION_SETUP',
  });
  return CoachPresenceSchema.parse({
    ...base,
    id: 'coach-presence:session-completion',
    message: reflection.message,
    nextAction: {
      intent: resolveCoachActionIntent({
        featureAvailability: input.featureAvailability,
        requestedIntent: summary.sessionMode === 'STUDY' ? 'START_STUDY_SESSION' : 'START_SESSION',
      }),
      label: summary.sessionMode === 'STUDY' ? 'Next study block' : 'Next focus',
      reason: summary.focusPurityScore >= 90 ? 'The rhythm is warm.' : 'Keep the next move simple.',
    },
    sessionReflection: reflection.message,
  });
}

function getActionReason(intent: CoachActionIntent, style: CoachPresenceMotivationStyle): string {
  if (intent === 'START_STUDY_SESSION') return 'Your study context is ready.';
  if (intent === 'REVIEW_PROGRESS') return 'Progress is the clearest next signal.';
  return STYLE_ADAPTATION[style];
}

const toneMap: Record<
  CoachPresenceMotivationStyle,
  Pick<CoachPresence['tone'], 'intensity' | 'personality'>
> = {
  CALM: { intensity: 'low', personality: 'steady' },
  FRIENDLY: { intensity: 'medium', personality: 'warm' },
  COACH_LED: { intensity: 'medium', personality: 'directive' },
  GAME_LIKE: { intensity: 'medium', personality: 'playful' },
  INTENSE: { intensity: 'high', personality: 'sharp' },
  STUDY_FOCUSED: { intensity: 'medium', personality: 'studious' },
};

function getTone(style: CoachPresenceMotivationStyle): CoachPresence['tone'] {
  return { motivationStyle: style, ...toneMap[style] };
}

function getVisualState(
  companion: BuildPresenceInput['companion'],
  style: CoachPresenceMotivationStyle,
): CoachPresenceVisualState {
  const reaction = style === 'INTENSE' ? 'ready' : style === 'GAME_LIKE' ? 'celebrating' : style === 'FRIENDLY' ? 'focused' : 'steady';
  return {
    element: companion?.element ?? 'LUMINA',
    level: companion?.level ?? 1,
    mood: companion?.currentMood ?? 'FOCUSED',
    phase: companion?.phase ?? 'YOUNG',
    reaction,
  };
}
