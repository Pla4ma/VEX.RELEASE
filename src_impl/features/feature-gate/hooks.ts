/**
 * Feature Gate Hooks
 *
 * Provides hooks for feature gating throughout the app.
 */

import { useMemo } from 'react';
import { useFeatureAccess } from '../liveops-config/hooks/useFeatureAccess';
import type { FeatureKey } from '../liveops-config/feature-access';

/**
 * Hook for checking if a feature is available
 */
export function useFeatureGate(feature: FeatureKey, options: {
  requireUnlocked?: boolean;
  requireVisible?: boolean;
} = {}) {
  const { requireUnlocked = true, requireVisible = true } = options;
  const { features } = useFeatureAccess();
  const featureAccess = features[feature];

  const isAvailable = useMemo(() => {
    return (
      (!requireUnlocked || featureAccess.isUnlocked) &&
      (!requireVisible || featureAccess.isVisible)
    );
  }, [featureAccess, requireUnlocked, requireVisible]);

  return {
    isAvailable,
    isUnlocked: featureAccess.isUnlocked,
    isVisible: featureAccess.isVisible,
    lockedDescription: featureAccess.lockedDescription,
    unlockReason: featureAccess.unlockReason,
    recommendedUnlockMoment: featureAccess.recommendedUnlockMoment,
  };
}

/**
 * Hook for checking multiple features at once
 */
export function useMultiFeatureGate(featureKeys: FeatureKey[], options: {
  requireAll?: boolean;
  requireUnlocked?: boolean;
  requireVisible?: boolean;
} = {}) {
  const { requireAll = true, requireUnlocked = true, requireVisible = true } = options;
  const { features: featureAccessMap } = useFeatureAccess();

  const featureStates = useMemo(() => {
    return featureKeys.map((featureKey) => {
      const featureAccess = featureAccessMap[featureKey];
      return {
        feature: featureKey,
        isAvailable: (!requireUnlocked || featureAccess.isUnlocked) &&
                   (!requireVisible || featureAccess.isVisible),
        isUnlocked: featureAccess.isUnlocked,
        isVisible: featureAccess.isVisible,
      };
    });
  }, [featureAccessMap, featureKeys, requireUnlocked, requireVisible]);

  const isAvailable = useMemo(() => {
    if (requireAll) {
      return featureStates.every(state => state.isAvailable);
    }
    return featureStates.some(state => state.isAvailable);
  }, [featureStates, requireAll]);

  return {
    isAvailable,
    featureStates,
    availableFeatures: featureStates.filter(state => state.isAvailable).map(state => state.feature),
    unavailableFeatures: featureStates.filter(state => !state.isAvailable).map(state => state.feature),
  };
}
