import type { FeatureKey } from './feature-access';
import { DISABLED_FEATURES } from './feature-access-config';

/**
 * Final-release health policy.
 *
 * Health checks protect app stability, but must not tax root-load or wake hidden systems.
 *
 * Rules (declining priority):
 * 1. Deactivated features — never checked
 * 2. Core progressive features (content_study, content_study_advanced) — check at root
 * 3. Proximity-gated features (premium, boss, ai_coach_advanced) — check only after
 *    feature would be visible/teased
 * 4. Unknown features — never checked (safety default)
 * 5. All checks must be synchronous config reads. No network, no Supabase, no feature init.
 */

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
): boolean {
  if (DISABLED_FEATURES.includes(feature)) {
    return false;
  }

  if (ROOT_ELIGIBLE.has(feature)) {
    return true;
  }

  const proximitySession = PROXIMITY_GATED.get(feature);
  if (proximitySession !== undefined) {
    return totalCompletedSessions >= proximitySession;
  }

  return false;
}

export function getDeactivatedFeatureKeys(): ReadonlySet<FeatureKey> {
  return new Set(DISABLED_FEATURES);
}
