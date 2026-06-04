import type { FeatureFlagValue, FeatureFlag } from './featureFlagTypes';

/**
 * Evaluate whether a flag is enabled for a given user,
 * respecting overrides and rollout percentage.
 */
export function evaluateFlag(
  key: string,
  flags: Map<string, FeatureFlag>,
  overrides: Map<string, FeatureFlagValue>,
  userId: string | null,
  hashFn: (str: string) => number,
): boolean {
  if (overrides.has(key)) {
    return Boolean(overrides.get(key));
  }
  const flag = flags.get(key);
  if (!flag || !flag.enabled) {
    return false;
  }
  if (userId) {
    const userHash = hashFn(userId);
    if (userHash % 100 >= flag.rolloutPercentage) {
      return false;
    }
  } else if (flag.rolloutPercentage < 100) {
    return false;
  }
  return Boolean(flag.value);
}

/**
 * Get a typed flag value, returning defaultValue when disabled.
 */
export function getFlagValue<T extends FeatureFlagValue>(
  key: string,
  defaultValue: T,
  flags: Map<string, FeatureFlag>,
  overrides: Map<string, FeatureFlagValue>,
  userId: string | null,
  isEnabled: (key: string) => boolean,
): T {
  if (overrides.has(key)) {
    return overrides.get(key) as T;
  }
  const flag = flags.get(key);
  if (!flag || !flag.enabled || !isEnabled(key)) {
    return defaultValue;
  }
  return flag.value as T;
}
