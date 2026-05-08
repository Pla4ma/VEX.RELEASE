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
export function useMultiFeatureGate(features: FeatureKey[], options: {
  requireAll?: boolean;
  requireUnlocked?: boolean;
  requireVisible?: boolean;
} = {}) {
  const { requireAll = true, requireUnlocked = true, requireVisible = true } = options;
  const { features } = useFeatureAccess();

  const featureStates = useMemo(() => {
    return features.map((featureKey, index) => {
      const featureAccess = features[Object.keys(features)[index] as FeatureKey];
      return {
        feature: features[index],
        isAvailable: (!requireUnlocked || featureAccess.isUnlocked) &&
                   (!requireVisible || featureAccess.isVisible),
        isUnlocked: featureAccess.isUnlocked,
        isVisible: featureAccess.isVisible,
      };
    });
  }, [features, requireUnlocked, requireVisible]);

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
