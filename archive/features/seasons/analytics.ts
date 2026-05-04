/**
 * Seasons Feature - Analytics
 *
 * Sentry breadcrumbs and custom event tracking
 */

import * as Sentry from '@sentry/react-native';
import type { Season, UserSeasonProgress } from './schemas';

// ============================================================================
// Breadcrumb Helpers
// ============================================================================

/**
 * Add season creation breadcrumb
 */
export function breadcrumbSeasonCreated(seasonId: string, name: string): void {
  Sentry.addBreadcrumb({
    category: 'season',
    message: `Season created: ${name}`,
    level: 'info',
    data: { seasonId },
  });
}

/**
 * Add season phase change breadcrumb
 */
export function breadcrumbPhaseChanged(
  seasonId: string,
  previousPhase: string,
  newPhase: string
): void {
  Sentry.addBreadcrumb({
    category: 'season',
    message: `Season phase changed: ${previousPhase} -> ${newPhase}`,
    level: 'info',
    data: { seasonId, previousPhase, newPhase },
  });
}

/**
 * Add tier unlock breadcrumb
 */
export function breadcrumbTierUnlocked(
  userId: string,
  seasonId: string,
  tier: number
): void {
  Sentry.addBreadcrumb({
    category: 'season',
    message: `Tier unlocked: ${tier}`,
    level: 'info',
    data: { userId, seasonId, tier },
  });
}

/**
 * Add premium purchase breadcrumb
 */
export function breadcrumbPremiumPurchased(
  userId: string,
  seasonId: string,
  gemsDeducted: number
): void {
  Sentry.addBreadcrumb({
    category: 'season',
    message: `Premium purchased: ${gemsDeducted} gems`,
    level: 'info',
    data: { userId, seasonId, gemsDeducted },
  });
}

// ============================================================================
// Error Tracking
// ============================================================================

/**
 * Track season error
 */
export function trackSeasonError(
  operation: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  Sentry.captureException(error, {
    tags: { feature: 'seasons', operation },
    extra: context,
  });
}

/**
 * Track season warning
 */
export function trackSeasonWarning(
  message: string,
  context?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    category: 'season',
    message,
    level: 'warning',
    data: context,
  });
}

// ============================================================================
// Custom Event Tracking
// ============================================================================

/**
 * Track season view
 */
export function trackSeasonView(seasonId: string, userId: string): void {
  Sentry.addBreadcrumb({
    category: 'season',
    message: 'Season hub viewed',
    level: 'info',
    data: { seasonId, userId },
  });
}

/**
 * Track tier claim
 */
export function trackTierClaim(
  userId: string,
  seasonId: string,
  tier: number,
  isPremium: boolean
): void {
  Sentry.addBreadcrumb({
    category: 'season',
    message: `Tier ${tier} claimed (${isPremium ? 'premium' : 'free'})`,
    level: 'info',
    data: { userId, seasonId, tier, isPremium },
  });
}

/**
 * Track season engagement metrics
 */
export function trackSeasonEngagement(
  seasonId: string,
  metrics: {
    totalParticipants: number;
    premiumConversion: number;
    averageTier: number;
  }
): void {
  Sentry.addBreadcrumb({
    category: 'season',
    message: 'Season engagement metrics',
    level: 'info',
    data: { seasonId, ...metrics },
  });
}
