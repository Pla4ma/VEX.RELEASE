/**
 * Feature Gate Hooks
 *
 * Provides hooks for feature gating throughout the app.
 * All checks go through getFeatureAvailability — never isUnlocked/isVisible alone.
 */

import { useMemo } from 'react';
import { useFeatureAccess } from '../liveops-config/hooks/useFeatureAccess';
import { getFeatureAvailability } from '../liveops-config/FeatureFlagService';
import type { FeatureAvailability } from '../liveops-config/FeatureFlagService';
import type { FeatureKey } from '../liveops-config/feature-access';

export type FeatureGateMode =
  | 'entryPoint'
  | 'navigation'
  | 'query'
  | 'route'
  | 'event'
  | 'notification';

function resolveAvailable(
  availability: FeatureAvailability,
  mode?: FeatureGateMode,
): boolean {
  if (mode === 'entryPoint') {
    return availability.canRenderEntryPoint;
  }
  if (mode === 'navigation') {
    return availability.canNavigate && availability.canRegisterRoute;
  }
  if (mode === 'query') {
    return availability.canQuery && availability.canUseBackend;
  }
  if (mode === 'route') {
    return availability.canRegisterRoute;
  }
  if (mode === 'event') {
    return availability.canSubscribeToEvents;
  }
  if (mode === 'notification') {
    return availability.canShowNotification;
  }
  return availability.state === 'unlocked' || availability.state === 'degraded';
}

export interface UseFeatureGateResult {
  isAvailable: boolean;
  availability: FeatureAvailability;
  isUnlocked: boolean;
  isVisible: boolean;
  isDegraded: boolean;
  lockedDescription: string;
  unlockReason: string;
  recommendedUnlockMoment: string;
}

/**
 * Hook for checking if a feature is available.
 *
 * When mode is provided, checks the specific FeatureAvailability gate.
 * Without mode, requires state === 'unlocked' (including degraded).
 */
export function useFeatureGate(
  feature: FeatureKey,
  mode?: FeatureGateMode,
): UseFeatureGateResult {
  const { features } = useFeatureAccess();
  const featureAccess = features[feature];
  const availability = useMemo(
    () => getFeatureAvailability(featureAccess),
    [featureAccess],
  );
  const isAvailable = useMemo(
    () => resolveAvailable(availability, mode),
    [availability, mode],
  );

  return {
    isAvailable,
    availability,
    isUnlocked: featureAccess.isUnlocked,
    isVisible: featureAccess.isVisible,
    isDegraded: availability.state === 'degraded',
    lockedDescription: featureAccess.lockedDescription,
    unlockReason: featureAccess.unlockReason,
    recommendedUnlockMoment: featureAccess.recommendedUnlockMoment,
  };
}

/**
 * Hook for checking multiple features at once.
 */
export function useMultiFeatureGate(
  featureKeys: FeatureKey[],
  options: {
    requireAll?: boolean;
    mode?: FeatureGateMode;
  } = {},
) {
  const { requireAll = true } = options;
  const { features: featureAccessMap } = useFeatureAccess();

  const featureStates = useMemo(() => {
    return featureKeys.map((featureKey) => {
      const availability = getFeatureAvailability(featureAccessMap[featureKey]);
      return {
        feature: featureKey,
        isAvailable: resolveAvailable(availability, options.mode),
        availability,
        isUnlocked: featureAccessMap[featureKey].isUnlocked,
        isVisible: featureAccessMap[featureKey].isVisible,
      };
    });
  }, [featureAccessMap, featureKeys, options.mode]);

  const isAvailable = useMemo(() => {
    if (requireAll) {
      return featureStates.every((state) => state.isAvailable);
    }
    return featureStates.some((state) => state.isAvailable);
  }, [featureStates, requireAll]);

  return {
    isAvailable,
    featureStates,
    availableFeatures: featureStates
      .filter((s) => s.isAvailable)
      .map((s) => s.feature),
    unavailableFeatures: featureStates
      .filter((s) => !s.isAvailable)
      .map((s) => s.feature),
  };
}

export const featureGateKeys = {
  all: ['feature-gate'] as const,
  feature: (feature: FeatureKey) => ['feature-gate', feature] as const,
};
