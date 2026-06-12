import { checkAlerts, type AlertRule } from '../analytics-alerts';

describe('analytics-alerts', () => {
  describe('checkAlerts', () => {
    it('returns empty when no thresholds breached', () => {
      const metrics = { 'retention.day1': 50, 'crash.session_rate': 0.5 };
      const alerts = checkAlerts(metrics);
      expect(alerts).toEqual([]);
    });

    it('triggers alert when threshold breached (greater than)', () => {
      const rules: AlertRule[] = [
        {
          id: 'test-crash',
          name: 'Crash Rate',
          metric: 'crash.rate',
          threshold: 2,
          operator: '>',
          duration: 10,
          severity: 'WARNING',
          notifyChannels: ['email'],
        },
      ];
      const metrics = { 'crash.rate': 5 };
      const alerts = checkAlerts(metrics, rules);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe('WARNING');
      expect(alerts[0].currentValue).toBe(5);
    });

    it('triggers alert when threshold breached (less than)', () => {
      const rules: AlertRule[] = [
        {
          id: 'test-retention',
          name: 'Retention',
          metric: 'retention.d1',
          threshold: 20,
          operator: '<',
          duration: 60,
          severity: 'CRITICAL',
          notifyChannels: ['slack'],
        },
      ];
      const metrics = { 'retention.d1': 15 };
      const alerts = checkAlerts(metrics, rules);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe('CRITICAL');
    });

    it('uses default rules when none provided', () => {
      const metrics = { 'retention.day1': 5 }; // Below threshold of 10
      const alerts = checkAlerts(metrics);
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('skips metrics not present in data', () => {
      const metrics: Record<string, number> = {};
      const alerts = checkAlerts(metrics);
      expect(alerts).toEqual([]);
    });

    it('returns triggeredAt timestamp', () => {
      const rules: AlertRule[] = [
        {
          id: 'test',
          name: 'Test',
          metric: 'test.metric',
          threshold: 10,
          operator: '>',
          duration: 1,
          severity: 'WARNING',
          notifyChannels: [],
        },
      ];
      const alerts = checkAlerts({ 'test.metric': 20 }, rules);
      expect(alerts[0].triggeredAt).toBeGreaterThan(0);
      expect(typeof alerts[0].triggeredAt).toBe('number');
    });

    it('handles equality operator', () => {
      const rules: AlertRule[] = [
        {
          id: 'test',
          name: 'Test',
          metric: 'test.metric',
          threshold: 10,
          operator: '=',
          duration: 1,
          severity: 'WARNING',
          notifyChannels: [],
        },
      ];
      const alerts = checkAlerts({ 'test.metric': 10 }, rules);
      expect(alerts).toHaveLength(1);
    });

    it('handles multiple rules', () => {
      const rules: AlertRule[] = [
        {
          id: 'rule1',
          name: 'Rule 1',
          metric: 'metric.a',
          threshold: 10,
          operator: '>',
          duration: 1,
          severity: 'WARNING',
          notifyChannels: [],
        },
        {
          id: 'rule2',
          name: 'Rule 2',
          metric: 'metric.b',
          threshold: 20,
          operator: '<',
          duration: 1,
          severity: 'CRITICAL',
          notifyChannels: [],
        },
      ];
      const metrics = { 'metric.a': 15, 'metric.b': 10 };
      const alerts = checkAlerts(metrics, rules);
      expect(alerts).toHaveLength(2);
    });
  });
});
