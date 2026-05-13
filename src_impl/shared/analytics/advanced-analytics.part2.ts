import { capture } from "./index";


export function checkAlerts(
  currentMetrics: Record<string, number>,
  rules: AlertRule[] = DEFAULT_ALERT_RULES
): MetricAlert[] {
  const triggered: MetricAlert[] = [];

  for (const rule of rules) {
    const currentValue = currentMetrics[rule.metric];
    if (currentValue === undefined) {continue;}

    let isTriggered = false;
    switch (rule.operator) {
      case '>':
        isTriggered = currentValue > rule.threshold;
        break;
      case '<':
        isTriggered = currentValue < rule.threshold;
        break;
      case '=':
        isTriggered = currentValue === rule.threshold;
        break;
    }

    if (isTriggered) {
      triggered.push({
        id: `alert-${Date.now()}-${rule.id}`,
        metric: rule.metric,
        threshold: rule.threshold,
        operator: rule.operator,
        currentValue,
        severity: rule.severity,
        triggeredAt: Date.now(),
      });

      // Capture alert event
      capture('alert_triggered', {
        rule_id: rule.id,
        metric: rule.metric,
        current_value: currentValue,
        threshold: rule.threshold,
        severity: rule.severity,
      } as Record<string, unknown>);
    }
  }

  return triggered;
}

export function createDashboardData(
  _timeRange: '1d' | '7d' | '30d' | '90d'
): {
  revenue: RevenueMetrics;
  retention: RetentionData;
  funnels: Funnel[];
  alerts: MetricAlert[];
} {
  // In production: fetch from analytics database
  return {
    revenue: {
      totalRevenue: 0,
      arpu: 0,
      arppu: 0,
      conversionRate: 0,
      ltv: { average: 0, median: 0, p90: 0 },
      mrr: 0,
      churnRate: 0,
    },
    retention: {
      cohorts: [],
      averageRetention: { day1: 0, day7: 0, day30: 0, day90: 0 },
    },
    funnels: [],
    alerts: [],
  };
}