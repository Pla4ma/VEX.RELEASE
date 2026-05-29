import type { Lane } from "../lane-engine/types";

export function shouldShowDay3Memory(input: {
  daysSinceOnboarding: number;
  completedSessions: number;
  hasSeenMemoryInsight: boolean;
}): boolean {
  return (
    input.daysSinceOnboarding >= 3 &&
    input.completedSessions >= 3 &&
    !input.hasSeenMemoryInsight
  );
}

export function shouldOfferRescue(input: {
  daysSinceOnboarding: number;
  completedSessions: number;
  hasCompletedToday: boolean;
  inactivityDays: number;
  abandonedSessionExists: boolean;
  openedAppNoStart: boolean;
  sessionStartedQuitEarly: boolean;
  recentDismissals: number;
  homeCtaDismissals: number;
  userTooBig: boolean;
}): boolean {
  if (input.completedSessions === 0) return false;
  if (input.hasCompletedToday) return false;

  const hasFrictionSignal =
    input.abandonedSessionExists ||
    input.sessionStartedQuitEarly ||
    input.openedAppNoStart ||
    input.recentDismissals >= 2 ||
    input.homeCtaDismissals >= 2 ||
    input.userTooBig ||
    (input.inactivityDays >= 1);

  return hasFrictionSignal;
}

export function shouldShowPremiumAfterValue(input: {
  daysSinceOnboarding: number;
  hasSeenWeeklyInsight: boolean;
}): boolean {
  return input.daysSinceOnboarding >= 7 && input.hasSeenWeeklyInsight;
}

export function getPremiumCopy(lane: Lane): string {
  const map: Record<Lane, string> = {
    student: "Go deeper with Study Intelligence.",
    game_like: "Upgrade your Focus Run intelligence.",
    deep_creative: "Keep deeper project memory.",
    minimal_normal: "Unlock quieter weekly planning.",
  };
  return map[lane];
}
