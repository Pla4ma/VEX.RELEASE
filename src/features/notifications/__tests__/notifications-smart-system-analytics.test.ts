/**
 * Tests for: smart-system-analytics
 */

import { getNotificationAnalytics } from '../SmartNotificationSystem.analytics';
import { notificationHistory, scheduledNotifications } from '../SmartNotificationSystem';

beforeEach(() => {
  jest.clearAllMocks();
  notificationHistory.clear();
  scheduledNotifications.clear();
});

describe('NotificationAnalytics (SmartNotificationSystem)', () => {
  it('returns zeros for unknown user', () => {
    const result = getNotificationAnalytics('unknown-user');
    expect(result.totalSent).toBe(0);
    expect(result.totalOpened).toBe(0);
    expect(result.totalDismissed).toBe(0);
    expect(result.openRate).toBe(0);
  });

  it('calculates correct counts from history', () => {
    notificationHistory.set('analytics-user', [
      { id: '1', userId: 'analytics-user', type: 'STREAK_PROTECTION', priority: 'CRITICAL', title: 't', body: 'b', scheduledAt: Date.now(), sentAt: Date.now(), openedAt: Date.now() },
      { id: '2', userId: 'analytics-user', type: 'STREAK_PROTECTION', priority: 'CRITICAL', title: 't', body: 'b', scheduledAt: Date.now(), sentAt: Date.now(), dismissedAt: Date.now() },
      { id: '3', userId: 'analytics-user', type: 'BOSS_OPPORTUNITY', priority: 'HIGH', title: 't', body: 'b', scheduledAt: Date.now(), sentAt: Date.now() },
    ]);
    const result = getNotificationAnalytics('analytics-user');
    expect(result.totalSent).toBe(3);
    expect(result.totalOpened).toBe(1);
    expect(result.totalDismissed).toBe(1);
    expect(result.openRate).toBeCloseTo(1 / 3);
    expect(result.byType.STREAK_PROTECTION.sent).toBe(2);
    expect(result.byType.STREAK_PROTECTION.opened).toBe(1);
    expect(result.byType.BOSS_OPPORTUNITY.sent).toBe(1);
  });
});
