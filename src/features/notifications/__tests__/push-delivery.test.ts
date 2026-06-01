import {
  requestPushPermissions,
  getPushToken,
  sendPushNotification,
  schedulePushNotification,
  cancelPushNotification,
  cancelAllPushNotifications,
  getScheduledPushNotifications,
  setBadgeCount,
  clearBadgeCount,
  PushNotificationPayloadSchema,
} from '../push-delivery';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  setBadgeCountAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

import * as Notifications from 'expo-notifications';

describe('Push Delivery Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PushNotificationPayloadSchema', () => {
    it('validates valid payload', () => {
      const validPayload = {
        title: 'Test',
        body: 'Test body',
        priority: 'normal' as const,
        badge: 1,
        sound: true,
      };

      expect(PushNotificationPayloadSchema.parse(validPayload)).toEqual(
        validPayload,
      );
    });

    it('rejects missing required fields', () => {
      expect(() => PushNotificationPayloadSchema.parse({})).toThrow();
    });
  });

  describe('requestPushPermissions', () => {
    it('returns true when already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestPushPermissions();

      expect(result).toBe(true);
    });

    it('requests permissions when not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestPushPermissions();

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('getPushToken', () => {
    it('returns token on success', async () => {
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'test-token-123',
      });

      const result = await getPushToken();

      expect(result).toBe('test-token-123');
    });

    it('returns null on error', async () => {
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValue(
        new Error('Failed'),
      );

      const result = await getPushToken();

      expect(result).toBeNull();
    });
  });

  describe('sendPushNotification', () => {
    it('sends notification immediately', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
        'notification-id-123',
      );

      const result = await sendPushNotification({
        title: 'Test',
        body: 'Test body',
      });

      expect(result).toBe('notification-id-123');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'Test',
            body: 'Test body',
          }),
          trigger: null,
        }),
      );
    });
  });

  describe('schedulePushNotification', () => {
    it('schedules notification for future', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
        'scheduled-id-123',
      );

      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now

      const result = await schedulePushNotification(
        {
          title: 'Scheduled',
          body: 'Scheduled body',
        },
        futureDate,
      );

      expect(result).toBe('scheduled-id-123');
    });
  });

  describe('cancelPushNotification', () => {
    it('cancels scheduled notification', async () => {
      await cancelPushNotification('notification-id');

      expect(
        Notifications.cancelScheduledNotificationAsync,
      ).toHaveBeenCalledWith('notification-id');
    });
  });

  describe('cancelAllPushNotifications', () => {
    it('cancels all scheduled notifications', async () => {
      await cancelAllPushNotifications();

      expect(
        Notifications.cancelAllScheduledNotificationsAsync,
      ).toHaveBeenCalled();
    });
  });

  describe('getScheduledPushNotifications', () => {
    it('returns scheduled notifications', async () => {
      const mockNotifications = [
        { identifier: '1', content: { title: 'Test' } },
      ];
      (
        Notifications.getAllScheduledNotificationsAsync as jest.Mock
      ).mockResolvedValue(mockNotifications);

      const result = await getScheduledPushNotifications();

      expect(result).toEqual(mockNotifications);
    });
  });

  describe('setBadgeCount', () => {
    it('sets badge count', async () => {
      await setBadgeCount(5);

      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(5);
    });
  });

  describe('clearBadgeCount', () => {
    it('clears badge count', async () => {
      await clearBadgeCount();

      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(0);
    });
  });
});
