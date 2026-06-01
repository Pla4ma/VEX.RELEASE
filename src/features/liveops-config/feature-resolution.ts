import {
  FEATURE_RELEASE_STATES,
  FEATURE_TEASER_STARTS,
  FEATURE_THRESHOLDS,
} from './feature-access-config';
import { FEATURE_MOTIVATION_PROFILES } from './feature-motivation-config';
import { FEATURE_DEPENDENCIES } from './feature-dependencies';
import type {
  FeatureKey,
  FeatureReleaseState,
  MotivationProfile,
} from './feature-access';

export interface FeatureAccessInput {
  feature: FeatureKey;
  sessions: number;
  profile: MotivationProfile | undefined;
  unlockedFeatures?: Set<FeatureKey>;
}

export function resolveEffectiveThreshold(
  feature: FeatureKey,
  baseThreshold: number,
  profile: MotivationProfile | undefined,
): number {
  const accel = FEATURE_MOTIVATION_PROFILES[feature];
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
): boolean {
  if (!baseVisible) {return false;}
  const accel = FEATURE_MOTIVATION_PROFILES[feature];
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
): boolean {
  const deps = FEATURE_DEPENDENCIES[feature];
  if (!deps || deps.length === 0) {return true;}
  return deps.every((dep) => unlockedFeatures.has(dep));
}

export function computeFeatureAccess(input: FeatureAccessInput): {
  isUnlocked: boolean;
  isVisible: boolean;
  isTeased: boolean;
  releaseState: FeatureReleaseState;
} {
  const { feature, sessions, profile, unlockedFeatures } = input;
  const releaseState = FEATURE_RELEASE_STATES[feature];
  const disabled =
    releaseState === 'final_release_deactivated' ||
    releaseState === 'archived' ||
    releaseState === 'final_release_internal';

  const baseThreshold = FEATURE_THRESHOLDS[feature];
  const threshold = resolveEffectiveThreshold(feature, baseThreshold, profile);
  const thresholdMet = !disabled && sessions >= threshold;
  const depsSatisfied = unlockedFeatures
    ? checkDependenciesSatisfied(feature, unlockedFeatures)
    : true;
  const isUnlocked = thresholdMet && depsSatisfied;

  const teaserStart = FEATURE_TEASER_STARTS[feature];
  const isTeased =
    !disabled &&
    !isUnlocked &&
    typeof teaserStart === 'number' &&
    sessions >= teaserStart;
  const isVisible = resolveFeatureVisibility(
    feature,
    !disabled,
    profile,
    sessions,
  );

  return { isUnlocked, isVisible, isTeased, releaseState };
}
