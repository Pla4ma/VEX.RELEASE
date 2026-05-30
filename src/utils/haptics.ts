import { useCallback } from "react";
import {
  triggerHaptic,
  triggerHapticPattern,
} from "./haptics-types";

export {
  type HapticFeedbackKind,
  type HapticPattern,
  HapticPatterns,
  triggerHaptic,
  triggerHapticPattern,
} from "./haptics-types";

export {
  sessionStart,
  sessionComplete,
  sessionPause,
  sessionResume,
  gradeReveal,
  levelUp,
  bossDefeated,
  streakMilestone,
  chestOpen,
  achievementUnlocked,
  buttonTap,
  error,
  wagerWon,
  companionEvolution,
  studyPlanGenerated,
  cardSelection,
  pullToRefresh,
  stepCompleted,
  aiThinkingPulse,
  tabSwitch,
  toggleSwitch,
  scrollSnap,
  studyProgressMilestone,
  deepLinkOpened,
  featureUnlocked,
  selection,
} from "./haptics-actions";

export function useHaptics() {
  const light = useCallback(() => triggerHaptic("impactLight"), []);
  const medium = useCallback(() => triggerHaptic("impactMedium"), []);
  const heavy = useCallback(() => triggerHaptic("impactHeavy"), []);
  const success = useCallback(() => triggerHaptic("success"), []);
  const warning = useCallback(() => triggerHaptic("warning"), []);
  const err = useCallback(() => triggerHaptic("error"), []);
  const selection = useCallback(() => triggerHaptic("selection"), []);
  const primaryAction = useCallback(() => triggerHaptic("impactMedium"), []);
  const pullToRefreshHaptic = useCallback(
    () => triggerHaptic("selection"),
    [],
  );
  const tabSwitchHaptic = useCallback(() => triggerHaptic("selection"), []);
  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error: err,
    selection,
    primaryAction,
    pullToRefresh: pullToRefreshHaptic,
    tabSwitch: tabSwitchHaptic,
    trigger: triggerHaptic,
    pattern: triggerHapticPattern,
  };
}
