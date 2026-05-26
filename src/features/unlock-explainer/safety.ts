import type { UnlockDecision } from './types';

/**
 * Safety contract for all hidden features.
 *
 * A feature that is hidden (by user OR by system decision) MUST be FULLY INERT:
 *
 * - canRender: false         — no UI entry point, no card, no banner, no CTA button
 * - canNavigate: false        — no route registered, no navigation target
 * - canQuery: false           — no TanStack Query, no data fetching
 * - canSubscribe: false       — no EventBus listener, no Realtime channel
 * - canNotify: false          — no notification, no push, no in-app alert
 * - canLoadScript: false      — no lazy bundle, no code splitting trigger
 *
 * This is the hard safety contract. Nothing bypasses it.
 */

export interface FeatureSafetyGates {
  /** UI entry points (cards, banners, CTA buttons) may render */
  canRender: boolean;
  /** Navigation to feature screens is permitted */
  canNavigate: boolean;
  /** TanStack Query and data fetching may execute */
  canQuery: boolean;
  /** EventBus and Realtime subscriptions may be attached */
  canSubscribe: boolean;
  /** Notifications related to this feature may be shown */
  canNotify: boolean;
  /** Lazy-loaded bundles or code-split chunks may be fetched */
  canLoadScript: boolean;
}

function fullyInert(): FeatureSafetyGates {
  return {
    canRender: false,
    canNavigate: false,
    canQuery: false,
    canSubscribe: false,
    canNotify: false,
    canLoadScript: false,
  };
}

function fullyActive(): FeatureSafetyGates {
  return {
    canRender: true,
    canNavigate: true,
    canQuery: true,
    canSubscribe: true,
    canNotify: true,
    canLoadScript: true,
  };
}

function teaseOnly(): FeatureSafetyGates {
  return {
    canRender: true,
    canNavigate: false,
    canQuery: false,
    canSubscribe: false,
    canNotify: false,
    canLoadScript: false,
  };
}

function blockedDisplayOnly(): FeatureSafetyGates {
  return {
    canRender: true,
    canNavigate: false,
    canQuery: false,
    canSubscribe: false,
    canNotify: false,
    canLoadScript: false,
  };
}

/**
 * Premium features that are degraded MUST NOT tease.
 * A degraded premium feature shows a fallback explanation ONLY if useful,
 * never a broken/paywall fake CTA.
 */
const PREMIUM_GATED_FEATURES = new Set([
  'ai_coach_advanced',
  'streak_insurance',
  'premium_currency',
  'premium_hard_sell',
  'advanced_economy',
]);

/**
 * Returns the safety gates for a feature given its unlock decision
 * and whether it is hidden by user.
 *
 * @param decision — unlock-explainer decision for the feature
 * @param isHiddenByUser — whether user has explicitly hidden this feature
 * @param isDegradedPremium — whether this is a premium feature in degraded state
 */
export function computeFeatureSafetyGates(
  decision: UnlockDecision | null,
  isHiddenByUser: boolean,
  isDegradedPremium: boolean,
): FeatureSafetyGates {
  // User-hidden: fully inert. Never show, never load.
  if (isHiddenByUser) {
    return fullyInert();
  }

  // Degraded premium: may show fallback explanation, no fake CTA
  if (isDegradedPremium && decision?.decision === 'degraded') {
    return blockedDisplayOnly();
  }

  // System-hidden: fully inert
  if (!decision || decision.decision === 'hidden') {
    return fullyInert();
  }

  // Blocked: display fallback only, no navigation/queries
  if (decision.decision === 'blocked') {
    return blockedDisplayOnly();
  }

  // Teased: entry point visible, nothing else
  if (decision.decision === 'teased') {
    return teaseOnly();
  }

  // Unlocked: full access
  if (decision.decision === 'unlocked') {
    return fullyActive();
  }

  // Default: inert (unknown states)
  return fullyInert();
}

/**
 * Check whether a premium-degraded feature may show a tease/CTA.
 * Returns false — degraded premium must NOT tease.
 */
export function canDegradedPremiumTease(featureKey: string): boolean {
  if (PREMIUM_GATED_FEATURES.has(featureKey)) {
    return false;
  }
  return false; // Default conservative: no tease for ANY degraded premium
}

/**
 * Check whether a feature is premium-gated.
 */
export function isPremiumGatedFeature(featureKey: string): boolean {
  return PREMIUM_GATED_FEATURES.has(featureKey);
}

/**
 * Features that must NEVER unlock — no monetization, no gamble, no store.
 */
export const NEVER_UNLOCK_FEATURES = new Set([
  'shop',
  'inventory',
  'wagers',
  'battle_pass',
  'premium_currency',
  'streak_insurance',
  'gems_prominent',
  'economy_advanced',
  'economy_basic',
]);

/**
 * Verifies a decision does not leak a never-unlock feature.
 */
export function isNeverUnlockFeature(featureKey: string): boolean {
  return NEVER_UNLOCK_FEATURES.has(featureKey);
}
