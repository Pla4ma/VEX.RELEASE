import type { FeatureAccess, FeatureKey } from './feature-access';
export {
  DEGRADED_SURFACE_BLOCKS,
  getDegradedBlockedSurfaces,
  getDegradedFallbackSurface,
  shouldBlockFullSurface,
  type DegradedFeatureKey,
} from './degraded-surfaces';

export type FeatureAvailabilityState =
  | 'hidden'
  | 'teased'
  | 'locked'
  | 'unlocked'
  | 'disabled'
  | 'degraded';

/**
 * Single source of truth for feature availability.
 *
 * Every system — routes, queries, buttons, cards, notifications, background jobs,
 * event listeners, backend calls, analytics — must consult this contract.
 *
 * A feature that returns `canNavigate: false` MUST NOT be navigated to.
 * A feature that returns `canQuery: false` MUST NOT fire queries.
 * A feature that returns `canRegisterRoute: false` MUST NOT register its route.
 * A feature that returns `canSubscribeToEvents: false` MUST NOT attach listeners.
 *
 * This is the hard contract. Nothing bypasses it.
 */
export interface FeatureAvailability {
  state: FeatureAvailabilityState;

  /** UI entry points (cards, banners, CTA buttons) may render */
  canRenderEntryPoint: boolean;

  /** Navigation to feature screens is permitted */
  canNavigate: boolean;

  /** TanStack Query hooks and data fetching may execute */
  canQuery: boolean;

  /** Backend calls (Supabase, Edge Functions) may be made */
  canUseBackend: boolean;

  /** Screen routes may be registered in the navigation stack */
  canRegisterRoute: boolean;

  /** EventBus subscriptions for this feature may be attached */
  canSubscribeToEvents: boolean;

  /** Notifications related to this feature may be shown */
  canShowNotification: boolean;

  /** Human-readable explanation of the current state */
  reason: string;
}

function resolveFeatureAvailability(
  feature: FeatureAccess,
  key: FeatureKey | null,
): FeatureAvailability {
  const disabled =
    !feature.isVisible ||
    feature.releaseState === 'final_release_deactivated' ||
    feature.releaseState === 'archived';

  if (disabled) {
    return {
      state: 'disabled',
      canRenderEntryPoint: false,
      canNavigate: false,
      canQuery: false,
      canUseBackend: false,
      canRegisterRoute: false,
      canSubscribeToEvents: false,
      canShowNotification: false,
      reason: feature.lockedDescription,
    };
  }

  if (feature.isUnlocked) {
    if (feature.isDegraded === true) {
      if (feature.disableOnDegraded) {
        return {
          state: 'disabled',
          canRenderEntryPoint: false,
          canNavigate: false,
          canQuery: false,
          canUseBackend: false,
          canRegisterRoute: false,
          canSubscribeToEvents: false,
          canShowNotification: false,
          reason: feature.lockedDescription,
        };
      }
      return {
        state: 'degraded',
        canRenderEntryPoint: true,
        canNavigate: false,
        canQuery: false,
        canUseBackend: false,
        canRegisterRoute: true,
        canSubscribeToEvents: false,
        canShowNotification: false,
        reason: feature.unlockReason,
      };
    }

    return {
      state: 'unlocked',
      canRenderEntryPoint: true,
      canNavigate: true,
      canQuery: true,
      canUseBackend: true,
      canRegisterRoute: true,
      canSubscribeToEvents: true,
      canShowNotification: true,
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
      canRegisterRoute: false,
      canSubscribeToEvents: false,
      canShowNotification: false,
      reason: feature.recommendedUnlockMoment,
    };
  }

  return {
    state: 'locked',
    canRenderEntryPoint: false,
    canNavigate: false,
    canQuery: false,
    canUseBackend: false,
    canRegisterRoute: false,
    canSubscribeToEvents: false,
    canShowNotification: false,
    reason: feature.lockedDescription,
  };
}

/** @deprecated Use getFeatureAvailabilityFor for feature-specific routing, premium, prefetch, and notifications. */
export function getFeatureAvailability(feature: FeatureAccess): FeatureAvailability {
  return resolveFeatureAvailability(feature, null);
}

export function getFeatureAvailabilityFor(
  key: FeatureKey,
  feature: FeatureAccess,
): FeatureAvailability {
  return resolveFeatureAvailability(feature, key);
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

