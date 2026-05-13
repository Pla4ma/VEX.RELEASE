import { NotificationEvent } from "./types";


export function createNotificationSentEvent(userId: string, notificationId: string, type: string, category: string, priority: string, channels: string[], template: string, personalization: DynamicValue): NotificationSentEvent {
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

export function createNotificationDeliveredEvent(userId: string, notificationId: string, channel: 'push' | 'email' | 'sms' | 'in_app' | 'webhook', deliveryTime: Date, latency: number, provider: string, messageId?: string): NotificationDeliveredEvent {
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
      deliveryDetails: {
        status: 'delivered',
      },
    },
    metadata: createEventMetadata('notifications'),
  };
}

export function createNotificationReadEvent(userId: string, notificationId: string, readAt: Date, readTimeframe: number, readMethod: 'click' | 'mark_read' | 'auto_read', readContext: DynamicValue): NotificationReadEvent {
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

export function createNotificationClickedEvent(userId: string, notificationId: string, clickedAt: Date, clickTimeframe: number, action: string, actionUrl?: string, actionData?: DynamicValue, clickContext?: DynamicValue): NotificationClickedEvent {
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
      clickContext: clickContext || {
        device: 'unknown',
      },
    },
    metadata: createEventMetadata('notifications'),
  };
}

export function createNotificationFailedEvent(userId: string, notificationId: string, channel: 'push' | 'email' | 'sms' | 'in_app' | 'webhook', failureReason: string, errorCode: string, errorDetails: string, attemptNumber: number, maxAttempts: number, provider: string): NotificationFailedEvent {
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

export function createNotificationPreferencesUpdatedEvent(userId: string, preferences: DynamicValue, updatedFields: string[], updatedBy: 'user' | 'system' | 'admin'): NotificationPreferencesUpdatedEvent {
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

export function validateNotificationEvent(event: NotificationEventType): boolean {
  if (!event.id || !event.userId || !event.timestamp) {
    return false;
  }

  if (!event.type || !event.data || !event.metadata) {
    return false;
  }

  // Add specific validation for each event type
  switch (event.type) {
    case 'notification_sent':
      return validateNotificationSentEvent(event as NotificationSentEvent);
    case 'notification_delivered':
      return validateNotificationDeliveredEvent(event as NotificationDeliveredEvent);
    case 'notification_read':
      return validateNotificationReadEvent(event as NotificationReadEvent);
    case 'notification_clicked':
      return validateNotificationClickedEvent(event as NotificationClickedEvent);
    default:
      return true;
  }
}

export function serializeNotificationEvent(event: NotificationEventType): string {
  return JSON.stringify({
    ...event,
    timestamp: event.timestamp.toISOString(),
  });
}

export function deserializeNotificationEvent(data: string): NotificationEventType {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    timestamp: new Date(parsed.timestamp),
  };
}