import { capture } from './index';
import type { RevenueMetrics, RetentionData } from './retention-analytics';
import type { Funnel } from './funnel-analytics';

export interface MetricAlert {
  id: string;
  metric: string;
  threshold: number;
  operator: '>' | '<' | '=';
  currentValue: number;
  severity: 'WARNING' | 'CRITICAL';
  triggeredAt: number;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  operator: '>' | '<' | '=';
  duration: number;
  severity: 'WARNING' | 'CRITICAL';
  notifyChannels: string[];
}

const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'alert-d1-retention-drop',
    name: 'D1 Retention Drop',
    metric: 'retention.day1',
    threshold: 10,
    operator: '<',
    duration: 60,
    severity: 'CRITICAL',
    notifyChannels: ['email', 'slack'],
  },
  {
    id: 'alert-session-crash-rate',
    name: 'Session Crash Rate High',
    metric: 'crash.session_rate',
    threshold: 1,
    operator: '>',
    duration: 30,
    severity: 'WARNING',
    notifyChannels: ['email'],
  },
  {
    id: 'alert-revenue-drop',
    name: 'Daily Revenue Drop',
    metric: 'revenue.daily',
    threshold: 20,
    operator: '<',
    duration: 120,
    severity: 'CRITICAL',
    notifyChannels: ['email', 'slack', 'pagerduty'],
  },
];

export function checkAlerts(
  currentMetrics: Record<string, number>,
  rules: AlertRule[] = DEFAULT_ALERT_RULES,
): MetricAlert[] {
  const triggered: MetricAlert[] = [];
  for (const rule of rules) {
    const currentValue = currentMetrics[rule.metric];
    if (currentValue === undefined) {
      continue;
    }
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
      capture('alert_triggered', {
        rule_id: rule.id,
        metric: rule.metric,
        current_value: currentValue,
        threshold: rule.threshold,
        severity: rule.severity,
      } satisfies Record<string, unknown>);
    }
  }
  return triggered;
}

export function createDashboardData(_timeRange: '1d' | '7d' | '30d' | '90d'): {
  revenue: RevenueMetrics;
  retention: RetentionData;
  funnels: Funnel[];
  alerts: MetricAlert[];
} {
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
