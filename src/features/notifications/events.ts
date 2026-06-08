import {
  NotificationSentEvent,
  NotificationDeliveredEvent,
  NotificationReadEvent,
  NotificationClickedEvent,
  NotificationFailedEvent,
  NotificationPreferencesUpdatedEvent,
  EventMetadata,
  DeviceInfo,
} from './types';
import { v4 } from '../../utils/uuid';

export function createNotificationSentEvent(
  userId: string,
  notificationId: string,
  type: string,
  category: string,
  priority: string,
  channels: string[],
  template: string,
  personalization: NotificationSentEvent['data']['personalization'],
): NotificationSentEvent {
  return {
    id: generateEventId(),
    type: 'notification_sent',
    userId,
    notificationId,
    timestamp: new Date(),
    data: {
      notificationId,
      type,
      category,
      priority,
      channels,
      template,
      personalization,
      delivery: {
        attempts: 1,
        maxAttempts: 3,
        retryPolicy: 'exponential_backoff',
      },
    },
    metadata: createEventMetadata('notifications'),
  };
}
export function createNotificationDeliveredEvent(
  userId: string,
  notificationId: string,
  channel: 'push' | 'email' | 'sms' | 'in_app' | 'webhook',
  deliveryTime: Date,
  latency: number,
  provider: string,
  messageId?: string,
): NotificationDeliveredEvent {
  return {
    id: generateEventId(),
    type: 'notification_delivered',
    userId,
    notificationId,
    channelId: channel,
    timestamp: new Date(),
    data: {
      notificationId,
      channel,
      deliveryTime,
      latency,
      provider,
      messageId,
      deliveryDetails: { status: 'delivered' },
    },
    metadata: createEventMetadata('notifications'),
  };
}
export function createNotificationReadEvent(
  userId: string,
  notificationId: string,
  readAt: Date,
  readTimeframe: number,
  readMethod: 'click' | 'mark_read' | 'auto_read',
  readContext: NotificationReadEvent['data']['readContext'],
): NotificationReadEvent {
  return {
    id: generateEventId(),
    type: 'notification_read',
    userId,
    notificationId,
    timestamp: new Date(),
    data: {
      notificationId,
      readAt,
      readTimeframe,
      readMethod,
      readContext,
    },
    metadata: createEventMetadata('notifications'),
  };
}
export function createNotificationClickedEvent(
  userId: string,
  notificationId: string,
  clickedAt: Date,
  clickTimeframe: number,
  action: string,
  actionUrl?: string,
  actionData?: NotificationClickedEvent['data']['actionData'],
  clickContext?: NotificationClickedEvent['data']['clickContext'],
): NotificationClickedEvent {
  return {
    id: generateEventId(),
    type: 'notification_clicked',
    userId,
    notificationId,
    timestamp: new Date(),
    data: {
      notificationId,
      clickedAt,
      clickTimeframe,
      action,
      actionUrl,
      actionData,
      clickContext: clickContext || { device: 'unknown' },
    },
    metadata: createEventMetadata('notifications'),
  };
}
export function createNotificationFailedEvent(
  userId: string,
  notificationId: string,
  channel: 'push' | 'email' | 'sms' | 'in_app' | 'webhook',
  failureReason: string,
  errorCode: string,
  errorDetails: string,
  attemptNumber: number,
  maxAttempts: number,
  provider: string,
): NotificationFailedEvent {
  return {
    id: generateEventId(),
    type: 'notification_failed',
    userId,
    notificationId,
    channelId: channel,
    timestamp: new Date(),
    data: {
      notificationId,
      channel,
      failureReason,
      errorCode,
      errorDetails,
      attemptNumber,
      maxAttempts,
      retryable: attemptNumber < maxAttempts,
      provider,
      affectedUsers: 1,
    },
    metadata: createEventMetadata('notifications'),
  };
}
export function createNotificationPreferencesUpdatedEvent(
  userId: string,
  preferences: NotificationPreferencesUpdatedEvent['data']['preferences'],
  updatedFields: string[],
  updatedBy: 'user' | 'system' | 'admin',
): NotificationPreferencesUpdatedEvent {
  return {
    id: generateEventId(),
    type: 'notification_preferences_updated',
    userId,
    timestamp: new Date(),
    data: {
      preferences,
      updatedFields,
      updatedBy,
    },
    metadata: createEventMetadata('notifications'),
  };
}
function generateEventId(): string {
  return `evt_${Date.now()}_${v4().replace(/-/g, '').slice(0, 9)}`;
}
function createEventMetadata(source: string): EventMetadata {
  return { source, version: '1.0.0', platform: getPlatform() };
}
function getPlatform(): string {
  if (typeof window !== 'undefined') {
    return 'web';
  }
  return 'unknown';
}
