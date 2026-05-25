import {
  FocusModeCardSchema,
  LaneSessionBriefSchema,
  SessionSetupNavigationParamsSchema,
  SessionStartHeroSchema,
  SessionStartSummarySchema,
  type FocusModeCard,
  type LaneSessionBrief,
  type SessionSetupNavigationParams,
  type SessionStartHero,
  type SessionStartSummary,
} from './schemas';
import { SessionMode } from '../../session/modes';
import type { Lane } from '../lane-engine/types';
export { buildSessionStake } from './stake-service';

export function parseSessionSetupParams(input: unknown): {
  params: SessionSetupNavigationParams;
  warningMessage: string | null;
} {
  const result = SessionSetupNavigationParamsSchema.safeParse(input ?? {});
  if (result.success) return { params: result.data, warningMessage: null };
  return {
    params: {},
    warningMessage: 'We reset an invalid session setup request so you can start cleanly.',
  };
}

export function buildSessionStartSummary(input: {
  currentThemeName: string;
  durationMinutes: number;
  hasCustomizations: boolean;
}): SessionStartSummary {
  const { currentThemeName, durationMinutes, hasCustomizations } = input;
  return SessionStartSummarySchema.parse({
    ctaLabel: `Start ${durationMinutes} Min Session`,
    customizationLabel: hasCustomizations ? 'Hide options' : 'Tune session',
    subtitle: `${durationMinutes} min focus - ${currentThemeName} theme`,
  });
}

export function getOfflineSessionStartMessage(isOffline: boolean): string | null {
  return isOffline
    ? 'You can still start a session offline. Sync-based rewards and coach data may catch up after reconnect.'
    : null;
}

export function shouldOpenCustomizationByDefault(params: SessionSetupNavigationParams): boolean {
  return params.presetId === 'custom';
}

export function shouldAutoApplySmartSuggestion(input: {
  hasSavedDraft: boolean;
  params: SessionSetupNavigationParams;
  smartSuggestionPresetId: string | null;
}): boolean {
  const { hasSavedDraft, params, smartSuggestionPresetId } = input;
  return Boolean(smartSuggestionPresetId && !hasSavedDraft && !params.presetId && !params.suggestedDurationSeconds);
}

export function createStarterSessionConfig(input: {
  durationMinutes: number;
  category?: string | null;
}): { duration: number; mode: string; category?: string | null; metadata: Record<string, unknown> } {
  return {
    category: input.category || null,
    duration: input.durationMinutes * 60,
    metadata: { isFromOnboarding: true, isStarterSession: true },
    mode: 'STARTER',
  };
}

export function buildSessionStartHero(input: {
  durationMinutes: number;
  params: SessionSetupNavigationParams;
  presetName: string;
  smartSuggestionDescription: string | null;
}): SessionStartHero {
  const { durationMinutes, params, presetName, smartSuggestionDescription } = input;
  if (params.source === 'onboarding_first_session') {
    return SessionStartHeroSchema.parse({
      body: `Start with ${presetName} and get your first clean win on the board.`,
      eyebrow: 'First Session',
      title: `${durationMinutes} minutes to prove this habit can stick`,
    });
  }
  if (params.source === 'content-study' || params.source === 'learning-execution') {
    return SessionStartHeroSchema.parse({
      body: `We set up ${durationMinutes} minutes so you can act on the material before momentum fades.`,
      eyebrow: params.learningExecutionLabel ?? 'Deep Work Sprint',
      title: 'Turn this plan into a focused block now',
    });
  }
  if (params.comebackMultiplier && params.comebackMultiplier > 1) {
    return SessionStartHeroSchema.parse({
      body: `This ${durationMinutes}-minute block is your fastest path back into rhythm.`,
      eyebrow: 'Comeback Session',
      title: params.comebackMessage ?? 'Restart with a session that counts',
    });
  }
  if (smartSuggestionDescription) {
    return SessionStartHeroSchema.parse({
      body: smartSuggestionDescription,
      eyebrow: 'Recommended For Today',
      title: `${presetName} is the cleanest start right now`,
    });
  }
  return SessionStartHeroSchema.parse({
    body: `Start a ${durationMinutes}-minute session now, or open options if you need to tune it first.`,
    eyebrow: 'Fast Start',
    title: `${presetName} ready to launch`,
  });
}

function laneBriefCopy(lane: Lane): Pick<LaneSessionBrief, 'body' | 'ctaLabel' | 'sessionMode' | 'title'> {
  if (lane === 'student') return { body: 'Review the next useful target before new material piles up.', ctaLabel: 'Start study block', sessionMode: SessionMode.STUDY, title: 'Study block ready' };
  if (lane === 'game_like') return { body: 'Treat this as one clean encounter against the blocker in front of you.', ctaLabel: 'Start encounter', sessionMode: SessionMode.SPRINT, title: 'Run encounter ready' };
  if (lane === 'deep_creative') return { body: 'Resume the thread and protect the next concrete move.', ctaLabel: 'Resume project block', sessionMode: SessionMode.CREATIVE, title: 'Project block ready' };
  return { body: 'Name one task, run the block, stop when the timer ends.', ctaLabel: 'Start clean session', sessionMode: SessionMode.LIGHT_FOCUS, title: 'Clean session ready' };
}

export function buildLaneSessionBrief(input: {
  durationSeconds?: number | null;
  isOffline?: boolean;
  isRescue?: boolean;
  lane: Lane;
}): LaneSessionBrief {
  const base = laneBriefCopy(input.lane);
  const rescueDuration = Math.max(5 * 60, Math.min(input.durationSeconds ?? 10 * 60, 12 * 60));
  const normalDuration = Math.max(15 * 60, Math.min(input.durationSeconds ?? 25 * 60, 90 * 60));
  const suggestedDurationSeconds = input.isRescue ? rescueDuration : normalDuration;
  return LaneSessionBriefSchema.parse({
    ...base,
    afterCompletion: 'VEX will use the finish signal to tune the next action.',
    focusStrategyLoadout: ['Phone away', 'One tab', 'Notes open', 'Do not pause', '5-minute rescue allowed'],
    friction: input.isRescue ? { level: 'soft', reason: 'Short rescue block lowers start friction.' } : null,
    lane: input.lane,
    offlineMessage: getOfflineSessionStartMessage(Boolean(input.isOffline)),
    risk: input.isRescue ? { label: 'Avoidance is active; start smaller.', type: 'avoidance' } : null,
    successCondition: input.isRescue ? 'Complete five honest minutes.' : 'Finish the named block without adding scope.',
    suggestedDurationSeconds,
  });
}

export function buildFocusModeCards(input: { streakDays: number }): FocusModeCard[] {
  const streakCopy = input.streakDays > 0
    ? `Protect day ${input.streakDays} without opening the whole dashboard.`
    : 'Create the first real proof point before the app asks for more.';
  return [
    ['sprint-15', 'SPRINT', 'Sprint', 'Fastest path to a real completion and a tomorrow promise.', 'Start sprint', 15],
    ['light-focus-25', 'LIGHT_FOCUS', 'Light Focus', streakCopy, 'Protect streak', 25],
    ['study-25', 'STUDY', 'Study', 'Use when the work has material, notes, or review attached.', 'Start study', 25],
    ['recovery-10', 'RECOVERY', 'Recovery', 'For messy days: count something truthful instead of disappearing.', 'Recover today', 10],
  ].map(([id, mode, title, body, ctaLabel, minutes]) => FocusModeCardSchema.parse({
    accessibilityHint: `Opens setup with a ${String(title).toLowerCase()} preset`,
    accessibilityLabel: `Start ${minutes} minute ${String(title).toLowerCase()} session`,
    body,
    ctaLabel,
    durationSeconds: Number(minutes) * 60,
    id,
    mode,
    title,
  }));
}
