import {
  NOTIFICATION_CONFIG,
  NOTIFICATION_TYPE_TO_SAFE_ACTION,
  FILTER_LABELS,
  groupNotificationsByTime,
  mapToNotificationAction,
  type NotificationType,
  type Notification,
} from '../NotificationScreenConfig';

jest.mock('../../features/liveops-config/FeatureFlagService', () => ({
  isFeatureHidden: jest.fn().mockReturnValue(false),
  getFeatureAvailabilityFor: jest.fn().mockReturnValue({ canShowNotification: true }),
  isFeatureAvailableForNavigation: jest.fn().mockReturnValue(true),
}));

describe('NotificationScreenConfig', () => {
  describe('NOTIFICATION_CONFIG', () => {
    it('has config for all notification types', () => {
      const types: NotificationType[] = [
        'ACHIEVEMENT',
        'STREAK_RISK',
        'BOSS',
        'SQUAD',
        'RIVAL',
        'COACH',
        'REWARD',
        'LEVEL_UP',
      ];
      for (const type of types) {
        expect(NOTIFICATION_CONFIG[type]).toBeDefined();
        expect(NOTIFICATION_CONFIG[type].icon).toBeDefined();
        expect(NOTIFICATION_CONFIG[type].color).toBeDefined();
        expect(NOTIFICATION_CONFIG[type].bgColor).toBeDefined();
      }
    });
  });

  describe('NOTIFICATION_TYPE_TO_SAFE_ACTION', () => {
    it('maps all types to actions', () => {
      const types: NotificationType[] = [
        'ACHIEVEMENT',
        'STREAK_RISK',
        'BOSS',
        'SQUAD',
        'RIVAL',
        'COACH',
        'REWARD',
        'LEVEL_UP',
      ];
      for (const type of types) {
        expect(NOTIFICATION_TYPE_TO_SAFE_ACTION[type]).toBeDefined();
      }
    });

    it('maps RIVAL to join_duel', () => {
      expect(NOTIFICATION_TYPE_TO_SAFE_ACTION.RIVAL).toBe('join_duel');
    });

    it('maps COACH to open_coach', () => {
      expect(NOTIFICATION_TYPE_TO_SAFE_ACTION.COACH).toBe('open_coach');
    });
  });

  describe('FILTER_LABELS', () => {
    it('has label for all filterable types', () => {
      expect(FILTER_LABELS.all).toBe('All');
      expect(FILTER_LABELS.ACHIEVEMENT).toBe('Achievements');
      expect(FILTER_LABELS.STREAK_RISK).toBe('Streaks');
      expect(FILTER_LABELS.BOSS).toBe('Momentum');
      expect(FILTER_LABELS.COACH).toBe('Coach');
      expect(FILTER_LABELS.REWARD).toBe('Progress');
      expect(FILTER_LABELS.LEVEL_UP).toBe('Levels');
    });
  });

  describe('groupNotificationsByTime', () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0).getTime();
    const yesterday = today - 86400000;
    const twoDaysAgo = today - 2 * 86400000;
    const lastWeek = today - 7 * 86400000;

    const makeNotification = (timestamp: number): Notification => ({
      id: `n-${timestamp}`,
      type: 'ACHIEVEMENT',
      title: 'Test',
      body: 'Test body',
      timestamp,
      read: false,
      actionParams: {},
    });

    it('groups notifications by time period', () => {
      const notifications = [
        makeNotification(today),
        makeNotification(yesterday),
        makeNotification(twoDaysAgo),
        makeNotification(lastWeek),
      ];
      const result = groupNotificationsByTime(notifications);
      expect(result.today).toHaveLength(1);
      expect(result.yesterday).toHaveLength(1);
      expect(result.thisWeek).toHaveLength(1);
      expect(result.earlier).toHaveLength(1);
    });

    it('returns empty groups for empty input', () => {
      const result = groupNotificationsByTime([]);
      expect(result.today).toHaveLength(0);
      expect(result.yesterday).toHaveLength(0);
      expect(result.thisWeek).toHaveLength(0);
      expect(result.earlier).toHaveLength(0);
    });

    it('puts multiple today notifications in today group', () => {
      const notifications = [makeNotification(today), makeNotification(today - 1000)];
      const result = groupNotificationsByTime(notifications);
      expect(result.today).toHaveLength(2);
    });
  });

  describe('mapToNotificationAction', () => {
    it('maps notification to action with correct type', () => {
      const notification: Notification = {
        id: 'n-1',
        type: 'ACHIEVEMENT',
        actionParams: { achievementId: 'ach-1' },
      };
      const result = mapToNotificationAction(notification);
      expect(result.type).toBe('view_progress');
      expect(result.payload).toEqual({ achievementId: 'ach-1' });
    });

    it('maps RIVAL to join_duel', () => {
      const notification: Notification = {
        id: 'n-1',
        type: 'RIVAL',
        actionParams: {},
      };
      const result = mapToNotificationAction(notification);
      expect(result.type).toBe('join_duel');
    });

    it('defaults unknown types to view_progress', () => {
      const notification: Notification = {
        id: 'n-1',
        type: 'UNKNOWN' as NotificationType,
        actionParams: {},
      };
      const result = mapToNotificationAction(notification);
      expect(result.type).toBe('view_progress');
    });
  });
});