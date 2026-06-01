/**
 * Tests for: events
 */

import {
  createNotificationSentEvent,
  createNotificationDeliveredEvent,
  createNotificationReadEvent,
  createNotificationClickedEvent,
  createNotificationFailedEvent,
  createNotificationPreferencesUpdatedEvent,
} from '../events';

describe('Events', () => {
  describe('createNotificationSentEvent', () => {
    it('creates valid sent event', () => {
      const event = createNotificationSentEvent(
        'user-1', 'notif-1', 'streak_reminder', 'engagement',
        'high', ['push'], 'default',
        { preferences: {}, context: {} },
      );
      expect(event.type).toBe('notification_sent');
      expect(event.userId).toBe('user-1');
      expect(event.data.channels).toEqual(['push']);
      expect(event.data.delivery.attempts).toBe(1);
      expect(event.metadata.source).toBe('notifications');
    });
  });

  describe('createNotificationDeliveredEvent', () => {
    it('creates valid delivered event', () => {
      const event = createNotificationDeliveredEvent(
        'user-1', 'notif-1', 'push', new Date(), 150, 'expo',
      );
      expect(event.type).toBe('notification_delivered');
      expect(event.data.channel).toBe('push');
      expect(event.data.latency).toBe(150);
    });

    it('includes optional messageId', () => {
      const event = createNotificationDeliveredEvent(
        'user-1', 'notif-1', 'email', new Date(), 200, 'sendgrid', 'msg-123',
      );
      expect(event.data.messageId).toBe('msg-123');
    });
  });

  describe('createNotificationReadEvent', () => {
    it('creates valid read event', () => {
      const event = createNotificationReadEvent(
        'user-1', 'notif-1', new Date(), 300, 'click',
        { device: 'mobile' },
      );
      expect(event.type).toBe('notification_read');
      expect(event.data.readMethod).toBe('click');
    });
  });

  describe('createNotificationClickedEvent', () => {
    it('creates valid clicked event with defaults', () => {
      const event = createNotificationClickedEvent(
        'user-1', 'notif-1', new Date(), 100, 'open',
      );
      expect(event.type).toBe('notification_clicked');
      expect(event.data.clickContext.device).toBe('unknown');
    });

    it('includes optional click context', () => {
      const event = createNotificationClickedEvent(
        'user-1', 'notif-1', new Date(), 100, 'open',
        '/settings', { key: 'val' }, { device: 'web', location: 'home' },
      );
      expect(event.data.actionUrl).toBe('/settings');
      expect(event.data.clickContext.device).toBe('web');
    });
  });

  describe('createNotificationFailedEvent', () => {
    it('creates valid failed event', () => {
      const event = createNotificationFailedEvent(
        'user-1', 'notif-1', 'push', 'timeout', 'ERR_001',
        'Connection timed out', 1, 3, 'expo',
      );
      expect(event.type).toBe('notification_failed');
      expect(event.data.retryable).toBe(true);
      expect(event.data.attemptNumber).toBe(1);
    });

    it('marks non-retryable when at max attempts', () => {
      const event = createNotificationFailedEvent(
        'user-1', 'notif-1', 'push', 'timeout', 'ERR_001',
        'Connection timed out', 3, 3, 'expo',
      );
      expect(event.data.retryable).toBe(false);
    });
  });

  describe('createNotificationPreferencesUpdatedEvent', () => {
    it('creates valid preferences updated event', () => {
      const event = createNotificationPreferencesUpdatedEvent(
        'user-1',
        { push: true, email: false },
        ['push', 'email'],
        'user',
      );
      expect(event.type).toBe('notification_preferences_updated');
      expect(event.data.updatedBy).toBe('user');
      expect(event.data.updatedFields).toEqual(['push', 'email']);
    });
  });
});
