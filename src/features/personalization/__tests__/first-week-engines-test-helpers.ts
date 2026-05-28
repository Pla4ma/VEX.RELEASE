import type {
  SessionProfile,
  FirstWeekResolverInput,
} from "../first-week-schemas";

export function baseProfile(overrides: Partial<SessionProfile> = {}): SessionProfile {
  return {
    averageDurationMinutes: 35,
    completions: 3,
    abandonments: 0,
    preferredStartHour: 9,
    consistencyScore: 0.5,
    savedNextMoves: 0,
    longestStreak: 2,
    ...overrides,
  };
}

export function baseInput(
  overrides: Partial<FirstWeekResolverInput> = {},
): FirstWeekResolverInput {
  return {
    behaviorStats: { bossEngagement: "none", studyUsageRatio: 0 },
    completedSessions: 3,
    daysSinceLastSession: null,
    daysSinceOnboarding: 3,
    featureAvailability: {
      boss: true,
      premium: false,
      social: false,
      study: true,
    },
    motivationStyle: "calm",
    premiumState: "unavailable",
    primaryGoal: "focus",
    ...overrides,
  };
}
