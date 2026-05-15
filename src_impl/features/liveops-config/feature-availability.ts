import type { FeatureAccess } from './feature-access';

export type FeatureAvailabilityState =
  | 'hidden'
  | 'teased'
  | 'locked'
  | 'unlocked'
  | 'disabled';

export interface FeatureAvailability {
  state: FeatureAvailabilityState;
  canRenderEntryPoint: boolean;
  canNavigate: boolean;
  canQuery: boolean;
  canUseBackend: boolean;
  reason: string;
}

export function getFeatureAvailability(feature: FeatureAccess): FeatureAvailability {
  if (!feature.isVisible || feature.releaseState === 'disabled_beta' || feature.releaseState === 'archived') {
    return {
      state: 'disabled',
      canRenderEntryPoint: false,
      canNavigate: false,
      canQuery: false,
      canUseBackend: false,
      reason: feature.lockedDescription,
    };
  }
  if (feature.isUnlocked) {
    return {
      state: 'unlocked',
      canRenderEntryPoint: true,
      canNavigate: true,
      canQuery: true,
      canUseBackend: true,
      reason: feature.unlockReason,
    };
  }
  if (feature.isTeased) {
    return {
      state: 'teased',
      canRenderEntryPoint: true,
      canNavigate: false,
      canQuery: false,
      canUseBackend: false,
      reason: feature.recommendedUnlockMoment,
    };
  }
  return {
    state: 'locked',
    canRenderEntryPoint: false,
    canNavigate: false,
    canQuery: false,
    canUseBackend: false,
    reason: feature.lockedDescription,
  };
}
