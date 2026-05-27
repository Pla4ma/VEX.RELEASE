import type {
  FeatureAccess,
  FeatureKey,
  FeatureReleaseState,
} from "./feature-access";

type FeatureCopy = Pick<
  FeatureAccess,
  "lockedDescription" | "recommendedUnlockMoment" | "unlockReason"
>;

export { FEATURE_MOTIVATION_PROFILES } from "./feature-motivation-config";
export type { MotivationProfileConfig } from "./feature-motivation-config";

export const DISABLED_FEATURES: FeatureKey[] = [
  "squads",
  "social_tab",
  "rivals",
  "rankings",
  "wagers",
  "gems_prominent",
  "battle_pass",
  "boss_bounties",
  "economy_advanced",
  "economy_basic",
  "inventory",
  "seasonal_features",
  "shop",
  "streak_insurance",
];

export const FEATURE_RELEASE_STATES: Record<FeatureKey, FeatureReleaseState> = {
  achievements: "final_release_progressive",
  advanced_settings: "final_release_progressive",
  ai_coach_advanced: "final_release_progressive",
  ai_coach_basic: "final_release_core",
  battle_pass: "final_release_deactivated",
  boss_bounties: "final_release_deactivated",
  boss_tab: "final_release_progressive",
  challenges: "final_release_progressive",
  companion_detail: "final_release_progressive",
  content_study: "final_release_progressive",
  content_study_advanced: "final_release_progressive",
  economy_advanced: "final_release_deactivated",
  economy_basic: "final_release_deactivated",
  focus_session: "final_release_core",
  focus_tab: "final_release_core",
  gems_prominent: "final_release_deactivated",
  home_tab: "final_release_core",
  inventory: "final_release_deactivated",
  memory_console: "final_release_progressive",
  premium_paywall: "final_release_progressive",
  profile_tab: "final_release_core",
  progress_view: "final_release_core",
  quiz_review_mode: "final_release_progressive",
  rankings: "final_release_deactivated",
  rivals: "final_release_deactivated",
  seasonal_features: "final_release_deactivated",
  shop: "final_release_deactivated",
  social_tab: "final_release_deactivated",
  squads: "final_release_deactivated",
  streak_insurance: "final_release_deactivated",
  wagers: "final_release_deactivated",
};

export const FEATURE_TEASER_STARTS: Partial<Record<FeatureKey, number>> = {
  companion_detail: 2,
  challenges: 4,
  boss_tab: 5,
  ai_coach_advanced: 6,
  content_study: 8,
  quiz_review_mode: 9,
  memory_console: 2,
};

export const FEATURE_PRIORITIES: Partial<Record<FeatureKey, number>> = {
  companion_detail: 1,
  challenges: 2,
  content_study: 3,
  boss_tab: 4,
  ai_coach_advanced: 5,
  economy_basic: 6,
  quiz_review_mode: 7,
};

export const DEFAULT_COPY: FeatureCopy = {
  lockedDescription:
    "This layer opens after your focus rhythm is strong enough.",
  recommendedUnlockMoment: "Keep completing focused sessions",
  unlockReason: "Unlocks when your consistency proves the habit is real.",
};

export const FEATURE_THRESHOLDS: Record<FeatureKey, number> = {
  achievements: 6,
  advanced_settings: 12,
  ai_coach_advanced: 8,
  ai_coach_basic: 0,
  battle_pass: Number.POSITIVE_INFINITY,
  boss_bounties: Number.POSITIVE_INFINITY,
  boss_tab: 7,
  challenges: 5,
  companion_detail: 3,
  content_study: 12,
  content_study_advanced: 18,
  economy_advanced: Number.POSITIVE_INFINITY,
  economy_basic: 8,
  focus_session: 0,
  focus_tab: 0,
  gems_prominent: Number.POSITIVE_INFINITY,
  home_tab: 0,
  inventory: Number.POSITIVE_INFINITY,
  memory_console: 3,
  premium_paywall: 40,
  profile_tab: 0,
  progress_view: 0,
  quiz_review_mode: 10,
  rankings: Number.POSITIVE_INFINITY,
  rivals: Number.POSITIVE_INFINITY,
  seasonal_features: Number.POSITIVE_INFINITY,
  shop: Number.POSITIVE_INFINITY,
  social_tab: Number.POSITIVE_INFINITY,
  squads: Number.POSITIVE_INFINITY,
  streak_insurance: Number.POSITIVE_INFINITY,
  wagers: Number.POSITIVE_INFINITY,
};

export const FEATURE_COPY: Partial<Record<FeatureKey, FeatureCopy>> = {
  battle_pass: {
    lockedDescription: "Season progress is archived until separately approved.",
    recommendedUnlockMoment: "Not part of final release",
    unlockReason: "Archived until separately approved.",
  },
  boss_tab: {
    lockedDescription:
      "Bosses stay quiet until focus is the obvious center. When they appear, damage only means minutes focused.",
    recommendedUnlockMoment:
      "After session 7, later for calm or study-focused styles",
    unlockReason:
      "Unlocks after enough sessions for boss progress to reinforce focus instead of competing with it.",
  },
  challenges: {
    lockedDescription:
      "Challenges turn the next focus or study target into one concrete action.",
    recommendedUnlockMoment: "After session 5",
    unlockReason: "Unlocks after 5 sessions when patterns are clear.",
  },
  companion_detail: {
    lockedDescription:
      "Your companion reflects your real focus journey. A few sessions give it enough history to be meaningful.",
    recommendedUnlockMoment: "After session 3",
    unlockReason:
      "Unlocks after 3 sessions so your companion has real data to work with.",
  },
  economy_basic: {
    lockedDescription:
      "Spendable rewards stay archived so XP, streaks, and progress remain the focus.",
    recommendedUnlockMoment: "Not part of final release",
    unlockReason: "Archived until separately approved.",
  },
  inventory: {
    lockedDescription:
      "Customization stays hidden so focus sessions remain the only thing that matters.",
    recommendedUnlockMoment: "Not part of final release",
    unlockReason: "Archived until separately approved.",
  },
  shop: {
    lockedDescription:
      "The shop stays closed so the app proves value before offering extras.",
    recommendedUnlockMoment: "Not part of final release",
    unlockReason: "Archived until separately approved.",
  },
  premium_paywall: {
    lockedDescription:
      "Premium becomes visible after enough sessions prove the core habit is real.",
    recommendedUnlockMoment: "After 40 completed sessions",
    unlockReason:
      "Appears when your focus rhythm is proven and RevenueCat billing is healthy.",
  },
  streak_insurance: {
    lockedDescription:
      "Streak recovery is gentle: comeback sessions, rhythm recovery, and fresh starts.",
    recommendedUnlockMoment: "Not part of final release",
    unlockReason: "Recovery tools unlock when needed, not before.",
  },
};
