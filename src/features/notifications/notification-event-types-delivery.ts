import { BaseNotificationEvent } from './notification-event-types-core';

export interface NotificationSentEvent extends BaseNotificationEvent {
  type: 'notification_sent';
  data: {
    notificationId: string;
    type: string;
    category: string;
    priority: string;
    channels: string[];
    scheduledAt?: Date;
    template: string;
    personalization: {
      userName?: string;
      preferences: Record<string, unknown>;
      context: Record<string, unknown>;
    };
    delivery: { attempts: number; maxAttempts: number; retryPolicy: string };
  };
}
export interface NotificationDeliveredEvent extends BaseNotificationEvent {
  type: 'notification_delivered';
  data: {
    notificationId: string;
    channel: string;
    deliveryTime: Date;
    latency: number;
    provider: string;
    messageId?: string;
    trackingId?: string;
    deliveryDetails: {
      status: string;
      errorCode?: string;
      errorDetails?: string;
    };
  };
}
export interface NotificationReadEvent extends BaseNotificationEvent {
  type: 'notification_read';
  data: {
    notificationId: string;
    readAt: Date;
    readTimeframe: number;
    readMethod: 'click' | 'mark_read' | 'auto_read';
    readContext: {
      device: string;
      location?: string;
      sessionDuration?: number;
    };
  };
}
export interface NotificationClickedEvent extends BaseNotificationEvent {
  type: 'notification_clicked';
  data: {
    notificationId: string;
    clickedAt: Date;
    clickTimeframe: number;
    action: string;
    actionUrl?: string;
    actionData?: Record<string, unknown>;
    clickContext: {
      device: string;
      location?: string;
      sessionDuration?: number;
    };
  };
}
export interface NotificationFailedEvent extends BaseNotificationEvent {
  type: 'notification_failed';
  data: {
    notificationId: string;
    channel: string;
    failureReason: string;
    errorCode: string;
    errorDetails: string;
    attemptNumber: number;
    maxAttempts: number;
    retryable: boolean;
    retryAfter?: number;
    provider: string;
    affectedUsers: number;
  };
}
export interface NotificationExpiredEvent extends BaseNotificationEvent {
  type: 'notification_expired';
  data: {
    notificationId: string;
    expiredAt: Date;
    originalScheduledTime: Date;
    expirationReason:
      | 'ttl_exceeded'
      | 'no_longer_relevant'
      | 'user_preference'
      | 'system_limit';
    channels: string[];
    deliveryAttempts: number;
    usersAffected: number;
  };
}
export interface NotificationCancelledEvent extends BaseNotificationEvent {
  type: 'notification_cancelled';
  data: {
    notificationId: string;
    cancelledAt: Date;
    reason:
      | 'user_request'
      | 'system_policy'
      | 'content_update'
      | 'technical_issue';
    cancelledBy: string;
    channels: string[];
    usersAffected: number;
    refund?: { type: 'credits' | 'tokens' | 'money'; amount: number };
  };
}
