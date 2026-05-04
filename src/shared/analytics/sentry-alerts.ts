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
  [key: string]: any;
}

/**
 * Alert when RevenueCat webhook fails to credit gems
 * CRITICAL: This is a revenue-impacting issue
 */
export function alertRevenueWebhookFailure(
  error: Error,
  context: {
    userId: string;
    productId: string;
    transactionId: string;
    webhookPayload?: Record<string, any>;
  }
): void {
  Sentry.withScope((scope) => {
    scope.setLevel('fatal');
    scope.setTag('alert_type', 'revenue_webhook_failure');
    scope.setTag('critical_path', 'true');
    scope.setTag('business_impact', 'revenue');

    scope.setContext('purchase', {
      user_id: context.userId,
      product_id: context.productId,
      transaction_id: context.transactionId,
      gems_expected: calculateExpectedGems(context.productId),
    });

    if (context.webhookPayload) {
      scope.setContext('webhook_payload', context.webhookPayload);
    }

    // Add breadcrumb for debugging
    scope.addBreadcrumb({
      category: 'revenue',
      message: `RevenueCat webhook failed for ${context.productId}`,
      level: 'error',
      data: {
        user_id: context.userId,
        transaction_id: context.transactionId,
      },
    });

    Sentry.captureException(error);
  });

  // In production, also trigger PagerDuty/Opsgenie alert
  // for immediate human attention
}

/**
 * Alert when user wallet fails to update after purchase
 */
export function alertWalletCreditFailure(
  error: Error,
  context: {
    userId: string;
    purchaseId: string;
    currency: 'GEMS' | 'COINS';
    amount: number;
  }
): void {
  Sentry.withScope((scope) => {
    scope.setLevel('fatal');
    scope.setTag('alert_type', 'wallet_credit_failure');
    scope.setTag('critical_path', 'true');
    scope.setTag('business_impact', 'user_trust');

    scope.setContext('wallet_credit', {
      user_id: context.userId,
      purchase_id: context.purchaseId,
      currency: context.currency,
      amount: context.amount,
    });

    Sentry.captureException(error);
  });
}

/**
 * Alert when critical analytics event fails to send
 */
export function alertAnalyticsFailure(
  eventName: string,
  error: Error,
  context?: AlertContext
): void {
  // Only alert for critical conversion events
  const criticalEvents = [
    'purchase_completed',
    'purchase_failed',
    'subscription_started',
    'vip_subscribed',
    'streak_broken',
    'session_abandoned',
  ];

  if (!criticalEvents.includes(eventName)) {
    return; // Non-critical, just log
  }

  Sentry.withScope((scope) => {
    scope.setLevel('error');
    scope.setTag('alert_type', 'analytics_failure');
    scope.setTag('event_name', eventName);
    scope.setTag('critical_path', 'true');

    if (context) {
      scope.setContext('analytics_context', context);
    }

    Sentry.captureException(error);
  });
}

/**
 * Alert on suspicious activity (potential fraud)
 */
export function alertSuspiciousActivity(
  activity: string,
  context: {
    userId: string;
    sessionCount: number;
    timeWindow: string;
    details: Record<string, any>;
  }
): void {
  Sentry.withScope((scope) => {
    scope.setLevel('warning');
    scope.setTag('alert_type', 'suspicious_activity');
    scope.setTag('activity', activity);
    scope.setUser({ id: context.userId });

    scope.setContext('suspicious_activity', {
      activity_type: activity,
      session_count: context.sessionCount,
      time_window: context.timeWindow,
      ...context.details,
    });

    Sentry.captureMessage(`Suspicious activity detected: ${activity}`, 'warning');
  });
}

/**
 * Alert when database operations fail repeatedly
 */
export function alertDatabaseDegradation(
  error: Error,
  context: {
    operation: string;
    table: string;
    retryCount: number;
  }
): void {
  Sentry.withScope((scope) => {
    scope.setLevel('error');
    scope.setTag('alert_type', 'database_degradation');
    scope.setTag('operation', context.operation);
    scope.setTag('table', context.table);

    scope.setContext('database', {
      operation: context.operation,
      table: context.table,
      retry_count: context.retryCount,
    });

    Sentry.captureException(error);
  });
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

/**
 * Revenue webhook failure alert wrapper
 * Usage: In RevenueCat webhook handler, wrap the credit logic
 */
export async function withRevenueAlert<T>(
  operation: () => Promise<T>,
  context: {
    userId: string;
    productId: string;
    transactionId: string;
  }
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    alertRevenueWebhookFailure(
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    throw error;
  }
}
