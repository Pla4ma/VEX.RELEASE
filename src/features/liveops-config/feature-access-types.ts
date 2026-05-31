export type UserExperienceStage =
  | 'NEW_USER'
  | 'ACTIVATING'
  | 'ENGAGED'
  | 'POWER_USER';

export type ProductTier =
  | 'CORE_EXECUTION'
  | 'COACHING'
  | 'STUDY_OS'
  | 'RPG_DEPTH'
  | 'SOCIAL_DEPTH';
export type FeatureReleaseState =
  | 'final_release_core'
  | 'final_release_progressive'
  | 'final_release_internal'
  | 'final_release_deactivated'
  | 'archived';

export type FeatureKey =
  | 'focus_session'
  | 'progress_view'
  | 'ai_coach_basic'
  | 'ai_coach_advanced'
  | 'economy_basic'
  | 'economy_advanced'
  | 'home_tab'
  | 'focus_tab'
  | 'social_tab'
  | 'profile_tab'
  | 'boss_tab'
  | 'boss_bounties'
  | 'squads'
  | 'rivals'
  | 'battle_pass'
  | 'achievements'
  | 'challenges'
  | 'rankings'
  | 'shop'
  | 'inventory'
  | 'wagers'
  | 'streak_insurance'
  | 'gems_prominent'
  | 'content_study'
  | 'content_study_advanced'
  | 'quiz_review_mode'
  | 'companion_detail'
  | 'memory_console'
  | 'seasonal_features'
  | 'premium_paywall'
  | 'advanced_settings';

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
  | 'calm'
  | 'friendly'
  | 'game_like'
  | 'coach_led'
  | 'competitive'
  | 'intense'
  | 'study_focused'
  | 'student'
  | 'creator'
  | 'worker';

export interface MotivationProfile {
  primary: MotivationProfileType;
  secondary: MotivationProfileType[];
}

export interface FeatureAccessInputs {
  totalCompletedSessions: number;
  motivationProfile?: MotivationProfile;
  degradedFeatures?: Set<FeatureKey>;
}
