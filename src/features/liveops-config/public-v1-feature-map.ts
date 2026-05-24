/**
 * Final Release Feature Map — single source of truth for release scope.
 *
 * Every system must check this map before registering routes, rendering cards,
 * querying, subscribing to events, or scheduling notifications.
 *
 * This map complements FeatureAvailability — hidden features here are ALWAYS hidden
 * regardless of FeatureAvailability state.
 *
 * @deprecated Filename retained as public-v1-feature-map.ts to avoid breaking imports.
 *   Internals renamed to Final Release. Rename file in a follow-up cleanup pass.
 */

import type { FeatureKey } from './feature-access';

export type PublicV1Status = 'included' | 'progressive' | 'hidden' | 'premium_gated';

/** @deprecated Use FinalReleaseFeatureEntry */
export type FinalReleaseStatus = PublicV1Status;

export interface PublicV1FeatureEntry {
  status: PublicV1Status;
  label: string;
  requiresMinimumSessions?: number;
  note?: string;
}

/** Alias for PublicV1FeatureEntry */
export type FinalReleaseFeatureEntry = PublicV1FeatureEntry;

/** @deprecated Use FINAL_RELEASE_FEATURE_MAP */
export const PUBLIC_V1_FEATURE_MAP: Record<FeatureKey, PublicV1FeatureEntry> = {

  focus_session: { status: 'included', label: 'Focus Sessions' },
  progress_view: { status: 'included', label: 'Progress View' },
  home_tab: { status: 'included', label: 'Home Tab' },
  focus_tab: { status: 'included', label: 'Focus Tab' },
  profile_tab: { status: 'included', label: 'Profile Tab' },
  ai_coach_basic: { status: 'included', label: 'Basic Coach Presence' },
  economy_basic: { status: 'included', label: 'Basic XP & Streak' },
  companion_detail: { status: 'included', label: 'Companion Visual' },
  content_study: { status: 'included', label: 'Study / Deep Work Entry' },
  advanced_settings: { status: 'included', label: 'Settings & Privacy' },

  ai_coach_advanced: {
    status: 'premium_gated',
    label: 'Deep Coach Memory',
    note: 'Premium only — remembers patterns, best times, comeback style',
  },
  content_study_advanced: {
    status: 'premium_gated',
    label: 'Advanced Study OS',
    note: 'Premium only — content generation, review loops, quizzes',
  },
  premium_paywall: {
    status: 'progressive',
    label: 'Premium Paywall',
    requiresMinimumSessions: 5,
    note: 'Hidden if RevenueCat unavailable',
  },

  boss_tab: {
    status: 'progressive',
    label: 'Boss Momentum',
    requiresMinimumSessions: 1,
    note: 'Subtle for calm/study users, visible for game-like/intense',
  },
  boss_bounties: { status: 'hidden', label: 'Boss Bounties' },
  achievements: {
    status: 'progressive',
    label: 'Achievements',
    requiresMinimumSessions: 3,
  },
  challenges: {
    status: 'progressive',
    label: 'Challenges',
    requiresMinimumSessions: 5,
  },
  seasonal_features: { status: 'hidden', label: 'Seasonal Systems' },

  quiz_review_mode: {
    status: 'premium_gated',
    label: 'Quiz & Review',
    note: 'Premium Study OS feature',
  },

  economy_advanced: { status: 'hidden', label: 'Advanced Economy' },
  social_tab: { status: 'hidden', label: 'Social Tab' },
  inventory: { status: 'hidden', label: 'Inventory' },
  shop: { status: 'hidden', label: 'Shop' },
  rankings: { status: 'hidden', label: 'Leaderboards' },
  rivals: { status: 'hidden', label: 'Rivals' },
  battle_pass: { status: 'hidden', label: 'Battle Pass' },
  squads: { status: 'hidden', label: 'Squads / Guilds' },
  wagers: { status: 'hidden', label: 'Wagers' },
  streak_insurance: { status: 'hidden', label: 'Streak Insurance' },
  gems_prominent: { status: 'hidden', label: 'Premium Currency' },
};

/** @deprecated Use FINAL_RELEASE_INCLUDED_SYSTEMS */
export const PUBLIC_V1_INCLUDED_SYSTEMS = [
  'motivation_onboarding',
  'adaptive_home',
  'start_session',
  'session_completion',
  'coach_presence',
  'progress_streak',
  'study_deep_work_layer',
  'subtle_boss_momentum',
  'basic_settings_privacy',
] as const;

/** @deprecated Use FINAL_RELEASE_HIDDEN_SYSTEMS */
export const PUBLIC_V1_HIDDEN_SYSTEMS = [
  'shop',
  'inventory',
  'battle_pass',
  'wagers',
  'rivals',
  'squads_social',
  'leaderboards',
  'premium_currency',
  'advanced_economy',
  'guild_community_boss',
] as const;

export const APP_STORE_READINESS_CHECKLIST = [
  { item: 'App name', required: true },
  { item: 'Bundle ID', required: true },
  { item: 'Support email', required: true },
  { item: 'Privacy policy URL', required: true },
  { item: 'Terms of service URL', required: true },
  { item: 'Notification copy reviewed', required: true },
  { item: 'RevenueCat real or hidden (not fake)', required: true },
  { item: 'Sentry configured', required: true },
  { item: 'No production shims', required: true },
  { item: 'No debug flags in release', required: true },
  { item: 'No fake premium claims', required: true },
  { item: 'No archived feature routes', required: true },
] as const;

/** Alias for APP_STORE_READINESS_CHECKLIST — final release naming */
export const FINAL_RELEASE_READINESS_CHECKLIST = APP_STORE_READINESS_CHECKLIST;

/** @deprecated Use isFeatureHidden */
export function isPublicV1Hidden(feature: FeatureKey): boolean {
  return PUBLIC_V1_FEATURE_MAP[feature]?.status === 'hidden';
}

export const isFeatureHidden = isPublicV1Hidden;

/** @deprecated Use isFeatureIncluded */
export function isPublicV1Included(feature: FeatureKey): boolean {
  return PUBLIC_V1_FEATURE_MAP[feature]?.status === 'included';
}

export const isFeatureIncluded = isPublicV1Included;

/** @deprecated Use getFeatureStatus */
export function getPublicV1Status(feature: FeatureKey): PublicV1Status {
  return PUBLIC_V1_FEATURE_MAP[feature]?.status ?? 'hidden';
}

export const getFeatureStatus = getPublicV1Status;
