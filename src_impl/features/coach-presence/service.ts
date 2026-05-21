import type { FeatureAvailability } from '../liveops-config';
import type { CompanionState } from '../companion/types';
import {
  ACTION_LABELS,
  FALLBACK_HOME_MESSAGES,
  PROGRESS_REACTIONS,
  STYLE_ADAPTATION,
  getCompletionMessage,
} from './copy';
import {
  CoachPresenceMemorySummarySchema,
  CoachPresenceProgressInputSchema,
  CoachPresenceSchema,
  CoachPresenceSurfaceSchema,
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
  if (
    input.requestedIntent === 'START_STUDY_SESSION' &&
    input.featureAvailability.study.canNavigate
  ) {
    return 'START_STUDY_SESSION';
  }
  if (
    input.requestedIntent === 'REVIEW_PROGRESS' &&
    input.featureAvailability.progress.canNavigate
  ) {
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
  const surface = CoachPresenceSurfaceSchema.parse(input.surface);
  const requestedIntent = getRequestedIntent(input.motivationStyle);
  const intent = resolveCoachActionIntent({
    featureAvailability: input.featureAvailability,
    requestedIntent,
  });

  return CoachPresenceSchema.parse({
    id: `coach-presence:${surface.toLowerCase()}`,
    memorySummary,
    message: buildHomeMessage(input.motivationStyle, progress),
    motivationStyleAdaptation: STYLE_ADAPTATION[input.motivationStyle],
    nextAction: {
      intent,
      label: ACTION_LABELS[intent],
      reason: getActionReason(intent, input.motivationStyle),
    },
    progressReaction: PROGRESS_REACTIONS[input.motivationStyle],
    sessionReflection: memorySummary.latestMemory ?? 'Your last finish is saved.',
    tone: getTone(input.motivationStyle),
    visualCompanionState: getVisualState(input.companion, input.motivationStyle),
  });
}

export function buildCompletionCoachPresence(
  input: CompletionPresenceInput,
): CoachPresence {
  const summary = CompletionPresenceSummarySchema.parse(input.summary);
  const base = buildCoachPresence({
    companion: null,
    featureAvailability: input.featureAvailability,
    memorySummary: input.memorySummary,
    motivationStyle: input.motivationStyle,
    progress: {
      currentStreakDays: summary.streakDays,
      highFocusStreak: summary.isHighFocusStreak ? 1 : 0,
      totalSessions: summary.isFirstSession ? 1 : 2,
    },
    surface: 'SESSION_SETUP',
  });
  const reflection = getCompletionMessage(input.motivationStyle, summary);

  return CoachPresenceSchema.parse({
    ...base,
    id: 'coach-presence:session-completion',
    message: reflection,
    nextAction: {
      intent: resolveCoachActionIntent({
        featureAvailability: input.featureAvailability,
        requestedIntent: summary.sessionMode === 'STUDY' ? 'START_STUDY_SESSION' : 'START_SESSION',
      }),
      label: summary.sessionMode === 'STUDY' ? 'Next study block' : 'Next focus',
      reason: summary.focusPurityScore >= 90 ? 'The rhythm is warm.' : 'Keep the next move simple.',
    },
    sessionReflection: reflection,
  });
}

function getRequestedIntent(style: CoachPresenceMotivationStyle): CoachActionIntent {
  return style === 'STUDY_FOCUSED' ? 'START_STUDY_SESSION' : 'START_SESSION';
}

function buildHomeMessage(
  style: CoachPresenceMotivationStyle,
  progress: CoachPresenceProgressInput,
): string {
  if (progress.currentStreakDays > 1 && style === 'CALM') {
    return `${progress.currentStreakDays}-day rhythm is warm. One clean block next.`;
  }
  if (progress.highFocusStreak > 0) {
    return 'High-focus streak is showing. Use the next block.';
  }
  return FALLBACK_HOME_MESSAGES[style];
}

function getActionReason(intent: CoachActionIntent, style: CoachPresenceMotivationStyle): string {
  if (intent === 'START_STUDY_SESSION') {
    return 'Your study context is ready.';
  }
  if (intent === 'REVIEW_PROGRESS') {
    return 'Progress is the clearest next signal.';
  }
  return STYLE_ADAPTATION[style];
}

const toneMap: Record<
  CoachPresenceMotivationStyle,
  Pick<CoachPresence['tone'], 'intensity' | 'personality'>
> = {
  CALM: { intensity: 'low', personality: 'steady' },
  COACH_LED: { intensity: 'medium', personality: 'directive' },
  GAME_LIKE: { intensity: 'medium', personality: 'playful' },
  INTENSE: { intensity: 'high', personality: 'sharp' },
  STUDY_FOCUSED: { intensity: 'medium', personality: 'studious' },
};

function getTone(style: CoachPresenceMotivationStyle): CoachPresence['tone'] {
  const tone = toneMap[style];
  return { motivationStyle: style, ...tone };
}

function getVisualState(
  companion: BuildPresenceInput['companion'],
  style: CoachPresenceMotivationStyle,
): CoachPresenceVisualState {
  return {
    element: companion?.element ?? 'LUMINA',
    level: companion?.level ?? 1,
    mood: companion?.currentMood ?? 'FOCUSED',
    phase: companion?.phase ?? 'YOUNG',
    reaction: style === 'INTENSE' ? 'ready' : style === 'GAME_LIKE' ? 'celebrating' : 'steady',
  };
}
