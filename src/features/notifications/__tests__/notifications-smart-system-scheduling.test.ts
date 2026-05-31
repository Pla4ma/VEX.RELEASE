/**
 * Tests for: smart-system-scheduling
 */

import {
  scheduleNotification,
  sendScheduledNotification,
  markNotificationOpened,
  markNotificationDismissed,
  notificationHistory,
  scheduledNotifications,
} from '../SmartNotificationSystem';
import { eventBus } from '../../../events';

describe('SmartNotificationSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(eventBus, 'publish');
    notificationHistory.clear();
    scheduledNotifications.clear();
  });

    describe('scheduleNotification', () => {
      it('adds notification to scheduled map', () => {
        const notification = {
          id: 'notif-1',
          userId: 'user-1',
          type: 'STREAK_PROTECTION' as const,
          priority: 'CRITICAL' as const,
          title: 'Test',
          body: 'Body',
          scheduledAt: Date.now(),
        };
        scheduleNotification(notification);
        expect(scheduledNotifications.get('user-1')).toHaveLength(1);
        expect(scheduledNotifications.get('user-1')![0].id).toBe('notif-1');
      });

      it('replaces existing notification of same type', () => {
        const notification1 = {
          id: 'notif-1',
          userId: 'user-1',
          type: 'STREAK_PROTECTION' as const,
          priority: 'CRITICAL' as const,
          title: 'Test 1',
          body: 'Body 1',
          scheduledAt: Date.now(),
        };
        const notification2 = {
          id: 'notif-2',
          userId: 'user-1',
          type: 'STREAK_PROTECTION' as const,
          priority: 'HIGH' as const,
          title: 'Test 2',
          body: 'Body 2',
          scheduledAt: Date.now(),
        };
        scheduleNotification(notification1);
        scheduleNotification(notification2);
        expect(scheduledNotifications.get('user-1')).toHaveLength(1);
        expect(scheduledNotifications.get('user-1')![0].id).toBe('notif-2');
      });

      it('allows different types to coexist', () => {
        scheduleNotification({
          id: 'notif-1', userId: 'user-1', type: 'STREAK_PROTECTION',
          priority: 'CRITICAL', title: 't1', body: 'b1', scheduledAt: Date.now(),
        });
        scheduleNotification({
          id: 'notif-2', userId: 'user-1', type: 'BOSS_OPPORTUNITY',
          priority: 'HIGH', title: 't2', body: 'b2', scheduledAt: Date.now(),
        });
        expect(scheduledNotifications.get('user-1')).toHaveLength(2);
      });

      it('sets custom deliverAt time', () => {
        const futureTime = Date.now() + 3600000;
        scheduleNotification({
          id: 'notif-1', userId: 'user-1', type: 'STREAK_PROTECTION',
          priority: 'CRITICAL', title: 't', body: 'b', scheduledAt: Date.now(),
        }, futureTime);
        expect(scheduledNotifications.get('user-1')![0].scheduledAt).toBe(futureTime);
      });
    });

    describe('sendScheduledNotification', () => {
      it('moves notification from scheduled to history and publishes event', () => {
        const notification = {
          id: 'notif-1', userId: 'user-1', type: 'STREAK_PROTECTION' as const,
          priority: 'CRITICAL' as const, title: 'Test', body: 'Body', scheduledAt: Date.now(),
        };
        scheduledNotifications.set('user-1', [notification]);

        const result = sendScheduledNotification('user-1', 'notif-1');
        expect(result).toBe(true);
        expect(scheduledNotifications.get('user-1')).toHaveLength(0);
        expect(notificationHistory.get('user-1')).toHaveLength(1);
        expect(notificationHistory.get('user-1')![0].sentAt).toBeDefined();
        expect(eventBus.publish).toHaveBeenCalledWith(
          'notification:sent',
          expect.objectContaining({ userId: 'user-1', notificationId: 'notif-1' }),
        );
      });

      it('returns false when notification not found', () => {
        const result = sendScheduledNotification('user-1', 'nonexistent');
        expect(result).toBe(false);
      });
    });

    describe('markNotificationOpened', () => {
      it('sets openedAt on matching notification', () => {
        const notification = {
          id: 'notif-1', userId: 'user-1', type: 'STREAK_PROTECTION' as const,
          priority: 'CRITICAL' as const, title: 't', body: 'b',
          scheduledAt: Date.now(), sentAt: Date.now(),
        };
        notificationHistory.set('user-1', [notification]);

        markNotificationOpened('user-1', 'notif-1');
        expect(notificationHistory.get('user-1')![0].openedAt).toBeDefined();
      });

      it('does nothing when notification not found', () => {
        notificationHistory.set('user-1', []);
        markNotificationOpened('user-1', 'nonexistent');
        // Should not throw
      });
    });

    describe('markNotificationDismissed', () => {
      it('sets dismissedAt on matching notification', () => {
        const notification = {
          id: 'notif-1', userId: 'user-1', type: 'STREAK_PROTECTION' as const,
          priority: 'CRITICAL' as const, title: 't', body: 'b',
          scheduledAt: Date.now(), sentAt: Date.now(),
        };
        notificationHistory.set('user-1', [notification]);

        markNotificationDismissed('user-1', 'notif-1');
        expect(notificationHistory.get('user-1')![0].dismissedAt).toBeDefined();
      });

      it('does nothing when notification not found', () => {
        markNotificationDismissed('user-1', 'nonexistent');
        // Should not throw
      });
    });
});
