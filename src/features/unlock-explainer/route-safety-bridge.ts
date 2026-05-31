import { computeFeatureSafetyGates } from '../unlock-explainer/safety';
import type { UnlockDecision } from '../unlock-explainer/types';

/**
 * Route Safety Bridge — integrates unlock-explainer safety gates with
 * navigation route registration and access control.
 *
 * Every feature route must pass BOTH:
 * 1. FeatureAvailability checks (isUnlocked, isVisible, releaseState)
 * 2. Unlock Explainer safety gates (hidden by user, lane blocked, degraded premium)
 *
 * A route that fails EITHER check must not be registered or navigated.
 */

export interface RouteSafetyCheck {
  /** Route registration in the navigation stack is permitted */
  canRegisterRoute: boolean;
  /** Navigation to this route is permitted at this moment */
  canNavigate: boolean;
  /** Reason for denial (human-readable) */
  reason: string | null;
}

/**
 * Check whether a feature route can be registered/navigated based on
 * unlock-explainer safety gates.
 */
export function checkRouteSafety(
  decision: UnlockDecision | null,
  isHiddenByUser: boolean,
  isDegradedPremium: boolean,
): RouteSafetyCheck {
  const gates = computeFeatureSafetyGates(
    decision,
    isHiddenByUser,
    isDegradedPremium,
  );

  if (!gates.canRender) {
    return {
      canRegisterRoute: false,
      canNavigate: false,
      reason: 'Feature is hidden — no render, no route, no query.',
    };
  }

  if (gates.canRender && !gates.canNavigate) {
    return {
      canRegisterRoute: false,
      canNavigate: false,
      reason:
        'Feature is teased/blocked — no route registration, no navigation.',
    };
  }

  return {
    canRegisterRoute: true,
    canNavigate: true,
    reason: null,
  };
}

/**
 * Safety-aware route registration check.
 * Merges unlock-explainer safety gates with FeatureAvailability for
 * a complete route safety verdict.
 */
export function canRegisterFeatureRouteWithSafety(
  decision: UnlockDecision | null,
  isHiddenByUser: boolean,
  isDegradedPremium: boolean,
  featureAvailabilityCanRegister: boolean,
): boolean {
  const safety = checkRouteSafety(decision, isHiddenByUser, isDegradedPremium);
  return safety.canRegisterRoute && featureAvailabilityCanRegister;
}

/**
 * Safety-aware navigation check.
 * Merges unlock-explainer safety gates with FeatureAvailability for
 * a complete navigation verdict.
 */
export function canNavigateToRouteWithSafety(
  decision: UnlockDecision | null,
  isHiddenByUser: boolean,
  isDegradedPremium: boolean,
  featureAvailabilityCanNavigate: boolean,
): boolean {
  const safety = checkRouteSafety(decision, isHiddenByUser, isDegradedPremium);
  return safety.canNavigate && featureAvailabilityCanNavigate;
}
