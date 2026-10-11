import type { FeatureAccess, FeatureKey } from './feature-access-types';

export type FeatureAvailabilityState =
  | 'hidden'
  | 'teased'
  | 'locked'
  | 'unlocked'
  | 'disabled'
  | 'degraded';

export interface FeatureAvailability {
  state: FeatureAvailabilityState;
  canRenderEntryPoint: boolean;
  canNavigate: boolean;
  canQuery: boolean;
  canUseBackend: boolean;
  canRegisterRoute: boolean;
  canSubscribeToEvents: boolean;
  canShowNotification: boolean;
  reason: string;
}

function resolveFeatureAvailability(
  feature: FeatureAccess | undefined,
): FeatureAvailability {
  const unavailable: FeatureAvailability = {
    state: 'disabled',
    canRenderEntryPoint: false,
    canNavigate: false,
    canQuery: false,
    canUseBackend: false,
    canRegisterRoute: false,
    canSubscribeToEvents: false,
    canShowNotification: false,
    reason: feature?.lockedDescription ?? 'Feature not configured.',
  };
  if (!feature) {return unavailable;}
  const disabled =
    !feature.isVisible ||
    feature.releaseState === 'final_release_deactivated' ||
    feature.releaseState === 'archived';
  if (disabled) {return { ...unavailable, reason: feature.lockedDescription };}
  if (feature.isUnlocked) {
    if (feature.isDegraded === true) {
      if (feature.disableOnDegraded) {return { ...unavailable, reason: feature.lockedDescription };}
      return { state: 'degraded', canRenderEntryPoint: true, canNavigate: true, canQuery: false, canUseBackend: false, canRegisterRoute: true, canSubscribeToEvents: false, canShowNotification: false, reason: feature.unlockReason };
    }
    return { state: 'unlocked', canRenderEntryPoint: true, canNavigate: true, canQuery: true, canUseBackend: true, canRegisterRoute: true, canSubscribeToEvents: true, canShowNotification: true, reason: feature.unlockReason };
  }
  if (feature.isTeased) {return { state: 'teased', canRenderEntryPoint: true, canNavigate: false, canQuery: false, canUseBackend: false, canRegisterRoute: false, canSubscribeToEvents: false, canShowNotification: false, reason: feature.recommendedUnlockMoment };}
  return { ...unavailable, reason: feature.lockedDescription };
}

export function getFeatureAvailability(feature: FeatureAccess): FeatureAvailability {
  return resolveFeatureAvailability(feature);
}

export function getFeatureAvailabilityFor(
  _key: FeatureKey,
  feature: FeatureAccess,
): FeatureAvailability {
  return resolveFeatureAvailability(feature);
}

export function isFeatureAvailableForNavigation(
  availability: FeatureAvailability,
): boolean {
  return availability.canNavigate && availability.canRegisterRoute;
}

export function isFeatureAvailableForQueries(
  availability: FeatureAvailability,
): boolean {
  return availability.canQuery && availability.canUseBackend;
}
