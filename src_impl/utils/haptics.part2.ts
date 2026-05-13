import { captureSilentFailure } from "./silent-failure";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";


export async function companionEvolution(): Promise<void> {
  await triggerHapticPattern(
    ['impactLight', 'impactMedium', 'impactHeavy', 'success', 'impactHeavy', 'success'],
    120
  );
}

export async function studyPlanGenerated(): Promise<void> {
  await triggerHapticPattern(['impactLight', 'impactMedium', 'success'], 100);
}

export async function cardSelection(): Promise<void> {
  await triggerHaptic('impactLight');
}

export async function pullToRefresh(): Promise<void> {
  await triggerHaptic('selection');
}

export async function stepCompleted(): Promise<void> {
  await triggerHaptic('impactMedium');
}

export async function aiThinkingPulse(): Promise<void> {
  await triggerHaptic('impactLight');
}

export async function tabSwitch(): Promise<void> {
  await triggerHaptic('selection');
}

export async function toggleSwitch(enabled: boolean): Promise<void> {
  if (enabled) {
    await triggerHaptic('impactMedium');
  } else {
    await triggerHaptic('impactLight');
  }
}

export async function scrollSnap(): Promise<void> {
  await triggerHaptic('selection');
}

export async function studyProgressMilestone(progressPercent: number): Promise<void> {
  if (progressPercent >= 100) {
    await triggerHapticPattern(['impactMedium', 'success'], 100);
  } else if (progressPercent >= 50) {
    await triggerHaptic('impactMedium');
  } else {
    await triggerHaptic('impactLight');
  }
}

export async function deepLinkOpened(): Promise<void> {
  await triggerHapticPattern(['impactLight', 'impactMedium'], 80);
}

export async function featureUnlocked(): Promise<void> {
  await triggerHapticPattern(
    ['impactLight', 'impactMedium', 'impactHeavy', 'success'],
    120
  );
}

export function useHaptics() {
  const light = useCallback(() => triggerHaptic('impactLight'), []);
  const medium = useCallback(() => triggerHaptic('impactMedium'), []);
  const heavy = useCallback(() => triggerHaptic('impactHeavy'), []);
  const success = useCallback(() => triggerHaptic('success'), []);
  const warning = useCallback(() => triggerHaptic('warning'), []);
  const error = useCallback(() => triggerHaptic('error'), []);
  const selection = useCallback(() => triggerHaptic('selection'), []);
  const primaryAction = useCallback(() => triggerHaptic('impactMedium'), []);
  const pullToRefresh = useCallback(() => triggerHaptic('selection'), []);
  const tabSwitch = useCallback(() => triggerHaptic('selection'), []);

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    primaryAction,
    pullToRefresh,
    tabSwitch,
    trigger: triggerHaptic,
    pattern: triggerHapticPattern,
  };
}