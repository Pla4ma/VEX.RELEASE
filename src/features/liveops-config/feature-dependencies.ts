import type { FeatureKey } from './feature-access';

/**
 * Feature dependency graph.
 *
 * A feature that depends on another feature MUST NOT unlock until all
 * its dependencies are in a usable state (unlocked, not degraded, not disabled).
 *
 * This prevents:
 * - Boss tab unlocking without focus_session, progress_view, economy_basic
 * - Content Study unlocking without ai_backend, auth, storage
 * - Shop unlocking without economy, inventory, revenuecat
 * - Battle Pass unlocking without seasonal_features, reward_ledger
 * - AI Coach Advanced unlocking without ai_backend, coach_memory, rate_limits
 *
 * This graph is consulted by buildFeatureAccess before marking any feature
 * as isUnlocked=true.
 */
export const FEATURE_DEPENDENCIES: Partial<Record<FeatureKey, FeatureKey[]>> = {
  // Boss encounters require the session loop and progress tracking
  boss_tab: ['focus_session', 'progress_view'],
  boss_bounties: ['boss_tab', 'economy_basic', 'inventory'],

  // Content study requires AI backend, storage, and auth
  content_study: ['ai_coach_basic', 'focus_session', 'progress_view'],
  content_study_advanced: ['content_study', 'ai_coach_advanced'],

  // Shop requires economy, inventory, and RevenueCat
  shop: ['economy_basic', 'inventory', 'premium_paywall'],

  // Battle pass requires seasonal features and reward ledger
  battle_pass: ['seasonal_features', 'economy_basic'],

  // AI Coach Advanced requires backend, memory, rate limits
  ai_coach_advanced: ['ai_coach_basic', 'focus_session', 'progress_view'],

  // Economy advanced requires basic economy
  economy_advanced: ['economy_basic'],

  // Squads require social tab and focus session
  squads: ['social_tab', 'focus_session'],

  // Rivals require rankings
  rivals: ['rankings'],

  // Quiz review mode requires content study
  quiz_review_mode: ['content_study'],

  // Streak insurance requires economy
  streak_insurance: ['economy_basic'],

  // Wagers require economy and boss
  wagers: ['economy_basic', 'boss_tab'],

  // Rankings require challenges and progress
  rankings: ['challenges', 'progress_view'],

  // Gems prominent requires economy advanced
  gems_prominent: ['economy_advanced'],

  // Inventory requires economy
  inventory: ['economy_basic'],

  // Seasonal features require progress view and achievements
  seasonal_features: ['progress_view', 'achievements'],

  // Social tab requires focus session
  social_tab: ['focus_session'],

  // Companion detail requires focus session and progress
  companion_detail: ['focus_session', 'progress_view'],
};
