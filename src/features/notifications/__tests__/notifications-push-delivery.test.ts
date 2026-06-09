/**
 * Tests for: push-delivery
 */

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notif-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  setBadgeCountAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExponentPushToken[test]' }),
  SchedulableTriggerInputTypes: { DATE: 'DATE' },
}));
import * as Notifications from 'expo-notifications';
import {
  handleNotificationResponse,
  presentInAppNotification,
} from '../push-delivery';

describe('Push Delivery', () => {
  describe('handleNotificationResponse', () => {
    it('calls onSessionReminder for SESSION_REMINDER type', () => {
      const handler = jest.fn();
      handleNotificationResponse(
        { notification: { request: { content: { data: { type: 'SESSION_REMINDER' } } } } } as unknown,
        { onSessionReminder: handler },
      );
      expect(handler).toHaveBeenCalled();
    });

    it('calls onStreakRisk for STREAK_RISK type', () => {
      const handler = jest.fn();
      handleNotificationResponse(
        { notification: { request: { content: { data: { type: 'STREAK_RISK' } } } } } as unknown,
        { onStreakRisk: handler },
      );
      expect(handler).toHaveBeenCalled();
    });

    it('calls onBossEscape for BOSS_ESCAPE type', () => {
      const handler = jest.fn();
      handleNotificationResponse(
        { notification: { request: { content: { data: { type: 'BOSS_ESCAPE' } } } } } as unknown,
        { onBossEscape: handler },
      );
      expect(handler).toHaveBeenCalled();
    });

    it('calls onSocialInteraction for SOCIAL type', () => {
      const handler = jest.fn();
      handleNotificationResponse(
        { notification: { request: { content: { data: { type: 'SOCIAL' } } } } } as unknown,
        { onSocialInteraction: handler },
      );
      expect(handler).toHaveBeenCalled();
    });

    it('does not throw for unknown type', () => {
      expect(() =>
        handleNotificationResponse(
          { notification: { request: { content: { data: { type: 'UNKNOWN' } } } } } as unknown,
          {},
        ),
      ).not.toThrow();
    });
  });

  describe('presentInAppNotification', () => {
    it('schedules immediate notification and returns id', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('in-app-id');
      const result = await presentInAppNotification({
        title: 'Test',
        body: 'Body',
      });
      expect(result).toBe('in-app-id');
    });

    it('validates payload', async () => {
      await expect(presentInAppNotification({ title: '', body: '' })).resolves.toBeDefined();
    });
  });
});
