/**
 * Feature flag health policy checks
 * Extracted from FeatureFlagService
 */

import type { FeatureKey } from './feature-access-types';

const ROOT_ELIGIBLE: ReadonlySet<FeatureKey> = new Set([
  'content_study',
  'content_study_advanced',
]);

const PROXIMITY_GATED: ReadonlyMap<FeatureKey, number> = new Map([
  ['premium_paywall', 5],
  ['boss_tab', 7],
  ['ai_coach_advanced', 8],
]);

export function shouldRunHealthCheck(
  feature: FeatureKey,
  totalCompletedSessions: number,
  disabledFeatures: FeatureKey[],
): boolean {
  if (disabledFeatures.includes(feature)) return false;
  if (ROOT_ELIGIBLE.has(feature)) return true;
  const proximitySession = PROXIMITY_GATED.get(feature);
  if (proximitySession !== undefined) {
    return totalCompletedSessions >= proximitySession;
  }
  return false;
}

export function getDeactivatedFeatureKeys(
  disabledFeatures: FeatureKey[],
): ReadonlySet<FeatureKey> {
  return new Set(disabledFeatures);
}
