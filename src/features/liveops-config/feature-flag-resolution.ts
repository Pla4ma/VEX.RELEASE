/**
 * Feature flag resolution helpers
 * Threshold/visibility resolution logic extracted from FeatureFlagService
 */

import type {
  FeatureKey,
  MotivationProfile,
  MotivationProfileType,
} from './feature-access-types';

// ── Motivation profile config (from JSON) ──

export interface MotivationProfileConfig {
  accelerate: MotivationProfileType[];
  accelerateOffset: number;
  restrict: MotivationProfileType[];
  restrictOffset: number;
  restrictVisibility?: boolean;
  restrictVisibilityMin?: number;
}

export function resolveEffectiveThreshold(
  feature: FeatureKey,
  baseThreshold: number,
  profile: MotivationProfile | undefined,
  motivationProfiles: Partial<Record<FeatureKey, MotivationProfileConfig>>,
): number {
  const accel = motivationProfiles[feature];
  if (!accel || !profile) {return baseThreshold;}

  const primaryAccelerated = accel.accelerate.includes(profile.primary);
  const primaryRestricted = accel.restrict.includes(profile.primary);

  if (primaryAccelerated) {
    return Math.max(0, baseThreshold - accel.accelerateOffset);
  }
  if (primaryRestricted) {
    return baseThreshold + accel.restrictOffset;
  }

  const secondaryAccelerated = accel.accelerate.some((p) =>
    profile.secondary.includes(p),
  );
  const secondaryRestricted = accel.restrict.some((p) =>
    profile.secondary.includes(p),
  );

  if (
    secondaryRestricted &&
    accel.restrictVisibility &&
    !accel.restrictVisibilityMin
  ) {
    return baseThreshold + accel.restrictOffset;
  }
  if (secondaryAccelerated) {
    return Math.max(0, baseThreshold - accel.accelerateOffset);
  }

  return baseThreshold;
}

export function resolveFeatureVisibility(
  feature: FeatureKey,
  baseVisible: boolean,
  profile: MotivationProfile | undefined,
  sessions: number,
  motivationProfiles: Partial<Record<FeatureKey, MotivationProfileConfig>>,
): boolean {
  if (!baseVisible) {return false;}
  const accel = motivationProfiles[feature];
  if (!accel || !profile) {return baseVisible;}

  const primaryRestricted = accel.restrict.includes(profile.primary);
  if (!primaryRestricted) {return baseVisible;}

  if (
    accel.restrictVisibility &&
    sessions < (accel.restrictVisibilityMin ?? Number.POSITIVE_INFINITY)
  ) {
    return false;
  }
  return true;
}

export function checkDependenciesSatisfied(
  feature: FeatureKey,
  unlockedFeatures: Set<FeatureKey>,
  dependencies: Partial<Record<FeatureKey, FeatureKey[]>>,
): boolean {
  const deps = dependencies[feature];
  if (!deps || deps.length === 0) {return true;}
  return deps.every((dep) => unlockedFeatures.has(dep));
}

export interface FeatureAccessInput {
  feature: FeatureKey;
  sessions: number;
  profile: MotivationProfile | undefined;
  unlockedFeatures?: Set<FeatureKey>;
}
