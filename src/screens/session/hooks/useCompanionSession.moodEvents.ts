import type { CompanionMood } from '../../../features/companion/types';
import type { ToastOptions } from '../../../shared/ui/components/Toast';
import { MILESTONES } from './milestoneHelpers';

export const DANGER_PURITY_THRESHOLD = 60;
export const ECSTATIC_PURITY_THRESHOLD = 90;
export const PURE_BURST_SECONDS = 300;

export const STRUGGLING_MOOD: CompanionMood = 'STRUGGLING';
export const ECSTATIC_MOOD: CompanionMood = 'ECSTATIC';

export const DANGER_TOAST: ToastOptions = {
  type: 'warning',
  title: 'Struggling',
  duration: 1400,
  priority: 'normal',
};

export const PURE_BURST_TOAST: ToastOptions = {
  type: 'success',
  title: 'On fire!',
  duration: 1400,
  priority: 'normal',
};

export interface MoodTickInput {
  sessionProgress: number;
  purityScore: number;
  isPaused: boolean;
  elapsedSeconds: number;
  triggeredMilestones: ReadonlySet<number>;
  dangerActive: boolean;
  pureFocusStartedAt: number | null;
  pureBurstTriggered: boolean;
}

export interface MoodTickResult {
  crossedMilestones: readonly number[];
  enteredDanger: boolean;
  exitedDanger: boolean;
  pureBurstTriggeredNow: boolean;
  nextPureFocusStartedAt: number | null;
  nextPureBurstTriggered: boolean;
}

// Pure derivation of this tick's companion mood/event transitions from raw
// session inputs and the hook's prior ref state — keeps the effect in
// useCompanionSession limited to applying the result as side effects.
export function evaluateMoodTick(input: MoodTickInput): MoodTickResult {
  const crossedMilestones = MILESTONES.filter(
    (milestone) => input.sessionProgress >= milestone && !input.triggeredMilestones.has(milestone),
  );

  const enteredDanger = input.purityScore < DANGER_PURITY_THRESHOLD && !input.dangerActive;
  const exitedDanger = input.purityScore >= DANGER_PURITY_THRESHOLD;

  let nextPureFocusStartedAt: number | null;
  let nextPureBurstTriggered: boolean;
  let pureBurstTriggeredNow = false;

  if (input.purityScore > ECSTATIC_PURITY_THRESHOLD && !input.isPaused) {
    nextPureFocusStartedAt = input.pureFocusStartedAt ?? input.elapsedSeconds;
    const pureFocusSeconds = input.elapsedSeconds - nextPureFocusStartedAt;
    if (pureFocusSeconds >= PURE_BURST_SECONDS && !input.pureBurstTriggered) {
      pureBurstTriggeredNow = true;
      nextPureBurstTriggered = true;
    } else {
      nextPureBurstTriggered = input.pureBurstTriggered;
    }
  } else {
    nextPureFocusStartedAt = null;
    nextPureBurstTriggered = false;
  }

  return {
    crossedMilestones,
    enteredDanger,
    exitedDanger,
    pureBurstTriggeredNow,
    nextPureFocusStartedAt,
    nextPureBurstTriggered,
  };
}
