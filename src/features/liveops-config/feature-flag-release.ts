/**
 * Feature flag release map/classification
 * Extracted from FeatureFlagService
 */

import type { FeatureKey } from './feature-access-types';

export type DegradedFeatureKey =
  | 'content_study'
  | 'ai_coach_advanced'
  | 'premium_paywall'
  | 'boss_tab';

export interface FinalReleaseFeatureEntry {
  status: 'included' | 'progressive' | 'hidden' | 'premium_gated';
  label: string;
  requiresMinimumSessions?: number;
  note?: string;
}

export type FinalReleaseStatus =
  | 'included'
  | 'progressive'
  | 'hidden'
  | 'premium_gated';

export function isFeatureHidden(
  feature: FeatureKey,
  releaseMap: Record<FeatureKey, FinalReleaseFeatureEntry>,
): boolean {
  return releaseMap[feature]?.status === 'hidden';
}

export function isFeatureIncluded(
  feature: FeatureKey,
  releaseMap: Record<FeatureKey, FinalReleaseFeatureEntry>,
): boolean {
  return releaseMap[feature]?.status === 'included';
}

export function getFeatureStatus(
  feature: FeatureKey,
  releaseMap: Record<FeatureKey, FinalReleaseFeatureEntry>,
): FinalReleaseStatus {
  return releaseMap[feature]?.status ?? 'hidden';
}

export const FINAL_RELEASE_INCLUDED_SYSTEMS = [
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

export const FINAL_RELEASE_HIDDEN_SYSTEMS = [
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

export const FINAL_RELEASE_READINESS_CHECKLIST = APP_STORE_READINESS_CHECKLIST;
