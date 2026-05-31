/**
 * Notification Event Definitions
 *
 * Event interfaces for the notification system: sending, scheduling,
 * opening, and dismissing notifications.
 */

export type NotificationEventType =
  | 'notification:send'
  | 'notification:scheduled'
  | 'notification:opened'
  | 'notification:dismissed';

export interface NotificationSendEvent {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: number;
  expiresAt?: number;
}

export interface NotificationOpenedEvent {
  notificationId: string;
  userId: string;
  type: string;
  data?: Record<string, unknown>;
  openedAt: number;
}
