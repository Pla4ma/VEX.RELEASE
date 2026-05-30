/**
 * Shared helpers for Product Journey Debloat + Personalization tests.
 */
import {
  buildFeatureAccess,
  type FeatureAccessMap,
  type FeatureKey,
} from "../features/liveops-config/feature-access";
import { getFeatureAvailability } from "../features/liveops-config/feature-availability";

export { getFeatureAvailability };
import { resolveVexExperience } from "../features/personalization/service";
import { resolveFirstWeekExperience } from "../features/personalization/first-week-service";
import type {
  BehaviorStats,
  FeatureAvailabilitySnapshot,
  VexPersonalizationProfile,
} from "../features/personalization/types";
import type { FirstWeekResolverInput } from "../features/personalization/first-week-schemas";

export function profile(
  motivationStyle: VexPersonalizationProfile["motivationStyle"],
  overrides: Partial<VexPersonalizationProfile> = {},
): VexPersonalizationProfile {
  return {
    primaryGoal: motivationStyle === "study_focused" ? "study" : "work",
    motivationStyle,
    preferredTone: motivationStyle === "intense" ? "direct" : "soft",
    gamificationIntensity:
      motivationStyle === "game_like" || motivationStyle === "intense"
        ? "strong"
        : "minimal",
    coachMode:
      motivationStyle === "study_focused"
        ? "study_tutor"
        : motivationStyle === "intense"
          ? "tactical"
          : motivationStyle === "game_like"
            ? "game_guide"
            : motivationStyle === "coach_led"
              ? "mentor"
              : "reflection",
    studyLayerName:
      motivationStyle === "study_focused" ? "Study OS" : "Deep Work Plan",
    defaultSessionDuration: 25,
    defaultSessionMode: motivationStyle === "study_focused" ? "STUDY" : "FOCUS",
    userStage: "new",
    ...overrides,
  };
}

export function stats(overrides: Partial<BehaviorStats> = {}): BehaviorStats {
  return {
    abandonedSessionDurations: [],
    bossChallengeEngagement: "none",
    coachInteractions: 0,
    comebackSessions: 0,
    completedSessionDurations: [],
    completionStreak: 0,
    ignoredFeatures: [],
    mostSuccessfulTimeOfDay: null,
    preferredSessionMode: null,
    premiumFeatureAttempts: [],
    studyUsageRatio: 0,
    totalCompletedSessions: 0,
    ...overrides,
  };
}

export const avail: FeatureAvailabilitySnapshot = {
  boss: true,
  challenges: true,
  study: true,
  premium: true,
};

export function experience(
  style: VexPersonalizationProfile["motivationStyle"],
  statOverrides: Partial<BehaviorStats> = {},
  featureOverrides: Partial<FeatureAvailabilitySnapshot> = {},
) {
  return resolveVexExperience(profile(style), stats(statOverrides), {
    ...avail,
    ...featureOverrides,
  });
}

export function firstWeek(
  overrides: Partial<FirstWeekResolverInput> = {},
): ReturnType<typeof resolveFirstWeekExperience> {
  return resolveFirstWeekExperience({
    behaviorStats: { bossEngagement: "none", studyUsageRatio: 0 },
    completedSessions: 0,
    daysSinceLastSession: null,
    daysSinceOnboarding: 0,
    featureAvailability: {
      boss: false,
      premium: false,
      social: false,
      study: true,
    },
    motivationStyle: "calm",
    premiumState: "unavailable",
    primaryGoal: "work",
    ...overrides,
  });
}

export function accessFor(sessions: number) {
  return buildFeatureAccess({ totalCompletedSessions: sessions }).features;
}

export const HIDDEN_FEATURE_KEYS: FeatureKey[] = [
  "battle_pass",
  "squads",
  "shop",
  "inventory",
  "social_tab",
  "rivals",
  "rankings",
  "wagers",
  "streak_insurance",
  "gems_prominent",
  "boss_bounties",
  "economy_advanced",
];

export function assertFullyHidden(features: FeatureAccessMap, key: FeatureKey) {
  const a = getFeatureAvailability(features[key]);
  expect(a.canRenderEntryPoint).toBe(false);
  expect(a.canNavigate).toBe(false);
  expect(a.canQuery).toBe(false);
  expect(a.canUseBackend).toBe(false);
  expect(a.canRegisterRoute).toBe(false);
  expect(a.canSubscribeToEvents).toBe(false);
  expect(a.canShowNotification).toBe(false);
}

export function assertCoreAvailable(
  features: FeatureAccessMap,
  key: FeatureKey,
) {
  const a = getFeatureAvailability(features[key]);
  expect(a.canRenderEntryPoint).toBe(true);
  expect(a.canNavigate).toBe(true);
  expect(a.canQuery).toBe(true);
}
