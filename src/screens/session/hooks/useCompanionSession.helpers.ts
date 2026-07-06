import { triggerHaptic } from '../../../utils/haptics';
import { MILESTONES, getMilestoneLabel, getMilestoneHaptic } from './milestoneHelpers';
import type { CompanionState } from '../../../features/companion/types';
import type { UseCompanionSessionInput } from './useCompanionSessionTypes';

export function createEmptySet(): Set<number> {
  return new Set();
}

export function processMilestones(
  sessionProgress: number,
  currentMode: UseCompanionSessionInput['currentMode'],
  triggeredMilestones: Set<number>,
  flashEvent: (label: string) => void,
): void {
  for (const milestone of MILESTONES) {
    if (
      sessionProgress >= milestone &&
      !triggeredMilestones.has(milestone)
    ) {
      triggeredMilestones.add(milestone);
      const label = getMilestoneLabel(milestone, currentMode);
      flashEvent(label);
      triggerHaptic(getMilestoneHaptic(milestone));
    }
  }
}

export function processDangerState(
  purityScore: number,
  isPaused: boolean,
  elapsedSeconds: number,
  dangerActive: boolean,
  pureFocusStartedAt: number | null,
  pureBurstTriggered: boolean,
): {
  dangerActive: boolean;
  pureFocusStartedAt: number | null;
  pureBurstTriggered: boolean;
  triggerDanger: boolean;
  triggerPureBurst: boolean;
} {
  let nextDanger = dangerActive;
  let nextPureStart = pureFocusStartedAt;
  let nextPureBurst = pureBurstTriggered;
  let triggerDanger = false;
  let triggerPureBurst = false;

  if (purityScore < 60 && !nextDanger) {
    nextDanger = true;
    triggerDanger = true;
  }
  if (purityScore >= 60) {
    nextDanger = false;
  }

  if (purityScore > 90 && !isPaused) {
    if (nextPureStart === null) nextPureStart = elapsedSeconds;
    const pureSeconds = elapsedSeconds - nextPureStart;
    if (pureSeconds >= 300 && !nextPureBurst) {
      nextPureBurst = true;
      triggerPureBurst = true;
    }
  } else {
    nextPureStart = null;
    nextPureBurst = false;
  }

  return {
    dangerActive: nextDanger,
    pureFocusStartedAt: nextPureStart,
    pureBurstTriggered: nextPureBurst,
    triggerDanger,
    triggerPureBurst,
  };
}

export function resetSessionState(): Pick<CompanionState, 'currentMood' | 'sessionProgress' | 'updatedAt'> {
  return {
    currentMood: 'SLEEPY' as const,
    sessionProgress: 0,
    updatedAt: Date.now(),
  };
}
