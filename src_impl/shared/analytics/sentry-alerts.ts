/**
 * Sentry Alerts
 *
 * Phase 8C.2 — Critical path alerting for revenue webhook failures
 * and other high-priority issues.
 */

import * as Sentry from '@sentry/react-native';

interface AlertContext {
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

// Helper to calculate expected gems from product ID
function calculateExpectedGems(productId: string): number {
  const gemMap: Record<string, number> = {
    'gems_50': 50,
    'gems_100': 100,
    'gems_250': 250,
    'gems_500': 500,
    'gems_1000': 1000,
    'vip_monthly': 0, // VIP doesn't give gems directly
    'vip_yearly': 0,
  };

  return gemMap[productId] || 0;
}

export * from "./sentry-alerts.types";
export * from "./sentry-alerts.types";
export * from "./sentry-alerts.part1";
