import {
  DEFAULT_COPY,
  FEATURE_COPY,
  FEATURE_PRIORITIES,
} from "./feature-access-config";
import { computeFeatureAccess } from "./feature-resolution";

export type UserExperienceStage =
  | "NEW_USER"
  | "ACTIVATING"
  | "ENGAGED"
  | "POWER_USER";

export type ProductTier =
  | "CORE_EXECUTION"
  | "COACHING"
  | "STUDY_OS"
  | "RPG_DEPTH"
  | "SOCIAL_DEPTH";
export type FeatureReleaseState =
  | "final_release_core"
  | "final_release_progressive"
  | "final_release_internal"
  | "final_release_deactivated"
  | "archived";

export type FeatureKey =
  | "focus_session"
  | "progress_view"
  | "ai_coach_basic"
  | "ai_coach_advanced"
  | "economy_basic"
  | "economy_advanced"
  | "home_tab"
  | "focus_tab"
  | "social_tab"
  | "profile_tab"
  | "boss_tab"
  | "boss_bounties"
  | "squads"
  | "rivals"
  | "battle_pass"
  | "achievements"
  | "challenges"
  | "rankings"
  | "shop"
  | "inventory"
  | "wagers"
  | "streak_insurance"
  | "gems_prominent"
  | "content_study"
  | "content_study_advanced"
  | "quiz_review_mode"
  | "companion_detail"
  | "memory_console"
  | "seasonal_features"
  | "premium_paywall"
  | "advanced_settings";

export interface FeatureAccess {
  key?: FeatureKey;
  isUnlocked: boolean;
  isVisible: boolean;
  lockedDescription: string;
  recommendedUnlockMoment: string;
  unlockReason: string;
  isTeased?: boolean;
  isDegraded?: boolean;
  disableOnDegraded?: boolean;
  priority?: number;
  releaseState: FeatureReleaseState;
  acceleratingProfiles?: MotivationProfileType[];
  restrictingProfiles?: MotivationProfileType[];
}

export type FeatureAccessMap = Record<FeatureKey, FeatureAccess>;

export type MotivationProfileType =
  | "calm"
  | "friendly"
  | "game_like"
  | "coach_led"
  | "competitive"
  | "intense"
  | "study_focused"
  | "student"
  | "creator"
  | "worker";

export interface MotivationProfile {
  primary: MotivationProfileType;
  secondary: MotivationProfileType[];
}

export interface FeatureAccessInputs {
  totalCompletedSessions: number;
  motivationProfile?: MotivationProfile;
  degradedFeatures?: Set<FeatureKey>;
}

const FEATURE_BUILD_ORDER: FeatureKey[] = [
  "focus_session",
  "home_tab",
  "focus_tab",
  "profile_tab",
  "progress_view",
  "ai_coach_basic",
  "companion_detail",
  "challenges",
  "economy_basic",
  "achievements",
  "boss_tab",
  "ai_coach_advanced",
  "content_study",
  "quiz_review_mode",
  "advanced_settings",
  "seasonal_features",
  "content_study_advanced",
  "premium_paywall",
  "social_tab",
  "inventory",
  "economy_advanced",
  "shop",
  "boss_bounties",
  "rankings",
  "rivals",
  "battle_pass",
  "squads",
  "wagers",
  "streak_insurance",
  "gems_prominent",
];

export function getStage(totalCompletedSessions: number): UserExperienceStage {
  if (totalCompletedSessions <= 0) return "NEW_USER";
  if (totalCompletedSessions < 3) return "ACTIVATING";
  if (totalCompletedSessions < 10) return "ENGAGED";
  return "POWER_USER";
}

export function getProductTier(
  stage: UserExperienceStage,
  totalCompletedSessions: number,
): ProductTier {
  if (totalCompletedSessions >= 40) return "SOCIAL_DEPTH";
  if (totalCompletedSessions >= 20) return "RPG_DEPTH";
  if (totalCompletedSessions >= 10) return "STUDY_OS";
  if (stage === "ENGAGED") return "COACHING";
  return "CORE_EXECUTION";
}

export function buildFeatureAccess(inputs: FeatureAccessInputs): {
  features: FeatureAccessMap;
  productTier: ProductTier;
  stage: UserExperienceStage;
} {
  const stage = getStage(inputs.totalCompletedSessions);
  const productTier = getProductTier(stage, inputs.totalCompletedSessions);
  const profile = inputs.motivationProfile;
  const degraded = inputs.degradedFeatures ?? new Set<FeatureKey>();

  const features = {} as FeatureAccessMap;
  const unlockedSoFar = new Set<FeatureKey>();

  for (const key of FEATURE_BUILD_ORDER) {
    const resolved = computeFeatureAccess({
      feature: key,
      sessions: inputs.totalCompletedSessions,
      profile,
      unlockedFeatures: unlockedSoFar,
    });
    const isDegraded = degraded.has(key);

    features[key] = {
      ...DEFAULT_COPY,
      ...FEATURE_COPY[key],
      key,
      isUnlocked: resolved.isUnlocked,
      isVisible: resolved.isVisible,
      isTeased: resolved.isTeased,
      isDegraded,
      disableOnDegraded: key === "premium_paywall",
      priority: FEATURE_PRIORITIES[key] ?? 99,
      releaseState: resolved.releaseState,
    };

    if (resolved.isUnlocked && !isDegraded) {
      unlockedSoFar.add(key);
    }
  }

  return { features, productTier, stage };
}

export {
  getFeatureAvailability,
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
  isFeatureAvailableForQueries,
} from "./feature-availability";
export type {
  FeatureAvailability,
  FeatureAvailabilityState,
} from "./feature-availability";
