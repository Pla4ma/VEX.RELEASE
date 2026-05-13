import * as Sentry from "@sentry/react-native";


export function alertRevenueWebhookFailure(
  error: Error,
  context: {
    userId: string;
    productId: string;
    transactionId: string;
    webhookPayload?: Record<string, unknown>;
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

export function alertSuspiciousActivity(
  activity: string,
  context: {
    userId: string;
    sessionCount: number;
    timeWindow: string;
    details: Record<string, unknown>;
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