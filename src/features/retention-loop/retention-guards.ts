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
    input.inactivityDays >= 1;

  return hasFrictionSignal;
}

export function shouldShowPremiumAfterValue(input: {
  daysSinceOnboarding: number;
  hasSeenWeeklyInsight: boolean;
}): boolean {
  return input.daysSinceOnboarding >= 7 && input.hasSeenWeeklyInsight;
}

// ── Mode-specific premium bridge copy ───────────────────────────────────

export function getPremiumCopy(lane: Lane): string {
  const map: Record<Lane, string> = {
    student:
      "Go deeper with Study Intelligence: weak topics, review planning, and exam prep.",
    game_like:
      "Unlock advanced Run Intelligence: blocker patterns, custom modifiers, and weekly run recaps.",
    deep_creative:
      "Unlock Project Memory: context restore, next moves, and flow windows.",
    minimal_normal:
      "Unlock Focus Intelligence: quiet weekly reports, best windows, and smarter planning.",
  };
  return map[lane];
}

export function getPremiumHeadline(lane: Lane): string {
  const map: Record<Lane, string> = {
    student: "Go deeper with Study Intelligence",
    game_like: "Unlock advanced Run Intelligence",
    deep_creative: "Unlock Project Memory",
    minimal_normal: "Unlock Focus Intelligence",
  };
  return map[lane];
}

// ── Mode-specific rescue copy ───────────────────────────────────────────

export function getRescueCopy(lane: Lane): {
  headline: string;
  body: string;
  sessionMinutes: number;
  actionLabel: string;
} {
  const map: Record<Lane, ReturnType<typeof getRescueCopy>> = {
    student: {
      headline: "Review one weak section for 8 minutes",
      body: "Just open your notes. One section. No quiz, no pressure.",
      sessionMinutes: 8,
      actionLabel: "Start review",
    },
    game_like: {
      headline: "Recovery run: 10 clean minutes",
      body: "No blockers. No targets. Just 10 minutes of clean focus.",
      sessionMinutes: 10,
      actionLabel: "Start recovery",
    },
    deep_creative: {
      headline: "Re-enter the project and find the next move",
      body: "Just open the project. Find one next move. That's all.",
      sessionMinutes: 7,
      actionLabel: "Re-enter",
    },
    minimal_normal: {
      headline: "Do 5 minutes. Stop cleanly.",
      body: "One action. Five minutes. That's a win.",
      sessionMinutes: 5,
      actionLabel: "Start",
    },
  };
  return map[lane];
}

// ── Mode-specific notification copy ─────────────────────────────────────

export function getNotificationCopy(lane: Lane): {
  title: string;
  body: string;
} {
  const map: Record<Lane, { title: string; body: string }> = {
    student: {
      title: "Your next review block is small",
      body: "10 minutes. One topic VEX flagged for review.",
    },
    game_like: {
      title: "Your next clean run is ready",
      body: "15 minutes. Name the target and start.",
    },
    deep_creative: {
      title: "Your project thread is waiting at the next move",
      body: "One concrete step. Ready when you are.",
    },
    minimal_normal: {
      title: "One clean block is enough today",
      body: "15 minutes. One action. Done.",
    },
  };
  return map[lane];
}

// ── Mode-specific return hooks ──────────────────────────────────────────

export function getModeReturnHook(lane: Lane): string {
  const map: Record<Lane, string> = {
    student: "Your next study block is ready.",
    game_like: "Your next clean run is ready.",
    deep_creative: "Your project is waiting at the next move.",
    minimal_normal: "One clean action is ready.",
  };
  return map[lane];
}

export function getModeReturnReason(lane: Lane): string {
  const map: Record<Lane, string> = {
    student: "VEX knows what I need to study or review next.",
    game_like: "VEX helps me build momentum and understand what blocks me.",
    deep_creative: "VEX remembers where I left off.",
    minimal_normal: "VEX gives me one useful action without noise.",
  };
  return map[lane];
}
