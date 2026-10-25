/**
 * feature-access — public API for building feature access maps.
 *
 * Logic delegated to FeatureFlagService; this module re-exports the
 * public surface and adds React wiring for buildFeatureAccess.
 */

import {
  DEFAULT_COPY,
  FEATURE_COPY,
  FEATURE_PRIORITIES,
  FEATURE_BUILD_ORDER,
  computeFeatureAccess,
  getStage,
  getProductTier,
} from './FeatureFlagService';
import type {
  UserExperienceStage,
  ProductTier,
  FeatureKey,
  FeatureAccessMap,
  FeatureAccessInputs,
  FeatureReleaseState,
} from './feature-access-types';

export type {
  UserExperienceStage,
  ProductTier,
  FeatureReleaseState,
  FeatureKey,
  FeatureAccess,
  FeatureAccessMap,
  MotivationProfileType,
  MotivationProfile,
  FeatureAccessInputs,
  UnlockBehaviorEvidence,
} from './feature-access-types';

export { getStage, getProductTier };

/**
 * Day-one surfaces are intentionally shallow at first. They are discoverable
 * and usable immediately; later progression adds richer intelligence, depth,
 * and personalization instead of hiding the destination.
 */
const DAY_ONE_SURFACES = new Set<FeatureKey>([
  'companion_detail',
  'challenges',
  'achievements',
  'content_study',
  'quiz_review_mode',
  'memory_console',
]);

function isDayOneSurface(
  key: FeatureKey,
  releaseState: FeatureReleaseState,
): boolean {
  return (
    DAY_ONE_SURFACES.has(key) &&
    releaseState !== 'final_release_deactivated' &&
    releaseState !== 'archived' &&
    releaseState !== 'final_release_internal'
  );
}
function describeUnlockEvidence(
  sessions: number,
  evidence: FeatureAccessInputs['behaviorEvidence'],
): string {
  if (!evidence) {
    return `${sessions} completed sessions`;
  }
  return `${sessions} completed sessions and ${evidence.studySurfaceClicks} study, ${evidence.coachInteractions} coach, ${evidence.bossEngagement} boss usage signals`;
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
      behaviorEvidence: inputs.behaviorEvidence,
      unlockedFeatures: unlockedSoFar,
    });
    const dayOneSurface = isDayOneSurface(key, resolved.releaseState);
    const isDegraded = degraded.has(key);
    const currentEvidence = describeUnlockEvidence(
      inputs.totalCompletedSessions,
      inputs.behaviorEvidence,
    );
    const unlockReason = resolved.behaviorAdjusted
      ? `Unlocked from ${currentEvidence.toLowerCase()}.`
      : FEATURE_COPY[key]?.unlockReason ?? DEFAULT_COPY.unlockReason;

    features[key] = {
      ...DEFAULT_COPY,
      ...FEATURE_COPY[key],
      key,
      isUnlocked: dayOneSurface || resolved.isUnlocked,
      isVisible: dayOneSurface ? true : resolved.isVisible,
      isTeased: dayOneSurface ? false : resolved.isTeased,
      isDegraded,
      disableOnDegraded: key === 'premium_paywall',
      priority: FEATURE_PRIORITIES[key] ?? 99,
      releaseState: resolved.releaseState,
      unlockThreshold: resolved.effectiveThreshold,
      currentEvidence,
      nextMilestone: dayOneSurface || resolved.isUnlocked ? null : resolved.effectiveThreshold,
      unlockReason: dayOneSurface
        ? 'Available from day one. VEX adds depth as your rhythm becomes clear.'
        : unlockReason,
    };

    if ((dayOneSurface || resolved.isUnlocked) && !isDegraded) {
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
} from './FeatureFlagService';
export type {
  FeatureAvailability,
  FeatureAvailabilityState,
} from './FeatureFlagService';
