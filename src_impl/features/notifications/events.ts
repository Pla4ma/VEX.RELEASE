/**
 * Notifications Feature Events
 *
 * Event definitions for notification management, delivery, and user preferences.
 */

import { NotificationEvent } from './types';

// Base Event Interface
export interface BaseNotificationEvent {
  id: string;
  userId: string;
  notificationId?: string;
  channelId?: 'in_app' | 'push' | 'email' | 'sms' | 'webhook';
  timestamp: Date;
  data: DynamicRecord;
  metadata: EventMetadata;
}

export interface EventMetadata {
  source: string;
  version: string;
  platform?: string;
  deviceInfo?: DeviceInfo;
  sessionId?: string;
  correlationId?: string;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'web';
  os: string;
  version: string;
  appVersion?: string;
  pushToken?: string;
}

// Notification Lifecycle Events
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
      preferences: DynamicRecord;
      context: DynamicRecord;
    };
    delivery: {
      attempts: number;
      maxAttempts: number;
      retryPolicy: string;
    };
  };
}

export interface NotificationDeliveredEvent extends BaseNotificationEvent {
  type: 'notification_delivered';
  data: {
    notificationId: string;
    channel: string;
    deliveryTime: Date;
    latency: number; // in milliseconds
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
    readTimeframe: number; // time between delivery and read in seconds
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
    clickTimeframe: number; // time between delivery and click in seconds
    action: string;
    actionUrl?: string;
    actionData?: DynamicRecord;
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
    retryAfter?: number; // seconds
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
    expirationReason: 'ttl_exceeded' | 'no_longer_relevant' | 'user_preference' | 'system_limit';
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
    reason: 'user_request' | 'system_policy' | 'content_update' | 'technical_issue';
    cancelledBy: string;
    channels: string[];
    usersAffected: number;
    refund?: {
      type: 'credits' | 'tokens' | 'money';
      amount: number;
    };
  };
}

// Template Events
export interface NotificationTemplateCreatedEvent extends BaseNotificationEvent {
  type: 'notification_template_created';
  data: {
    templateId: string;
    name: string;
    type: string;
    category: string;
    defaultTitle: string;
    defaultMessage: string;
    variables: {
      name: string;
      type: string;
      required: boolean;
      defaultValue?: DynamicValue;
    }[];
    channels: string[];
    priority: string;
    ttl: number;
    localization: Record<
      string,
      {
        title: string;
        message: string;
      }
    >;
    createdBy: string;
  };
}

export interface NotificationTemplateUpdatedEvent extends BaseNotificationEvent {
  type: 'notification_template_updated';
  data: {
    templateId: string;
    changes: {
      field: string;
      oldValue: DynamicValue;
      newValue: DynamicValue;
      reason: string;
    }[];
    updatedBy: string;
    version: string;
    affectedNotifications: number;
  };
}

export interface NotificationTemplateDeletedEvent extends BaseNotificationEvent {
  type: 'notification_template_deleted';
  data: {
    templateId: string;
    deletedAt: Date;
    deletedBy: string;
    reason: string;
    affectedNotifications: number;
    replacementTemplate?: string;
  };
}

// Preference Events
export interface NotificationPreferencesUpdatedEvent extends BaseNotificationEvent {
  type: 'notification_preferences_updated';
  data: {
    preferences: {
      globalSettings: {
        enabled: boolean;
        doNotDisturb: boolean;
        soundEnabled: boolean;
        vibrationEnabled: boolean;
        badgeEnabled: boolean;
        previewEnabled: boolean;
        groupingEnabled: boolean;
        smartDelivery: boolean;
      };
      categorySettings: Record<
        string,
        {
          enabled: boolean;
          channels: string[];
          priority: string;
          soundEnabled: boolean;
          vibrationEnabled: boolean;
        }
      >;
      typeSettings: Record<
        string,
        {
          enabled: boolean;
          channels: string[];
          frequency: string;
          maxPerDay: number;
        }
      >;
      channelSettings: {
        inApp: DynamicValue;
        push: DynamicValue;
        email: DynamicValue;
        sms: DynamicValue;
      };
      scheduleSettings: {
        enabled: boolean;
        timezone: string;
        workingHours: {
          start: string;
          end: string;
        };
        workingDays: number[];
      };
      quietHours: {
        enabled: boolean;
        start: string;
        end: string;
        timezone: string;
        exceptions: string[];
      };
    };
    updatedFields: string[];
    updatedBy: 'user' | 'system' | 'admin';
  };
}

export interface NotificationChannelPreferencesUpdatedEvent extends BaseNotificationEvent {
  type: 'notification_channel_preferences_updated';
  data: {
    channel: string;
    preferences: {
      enabled: boolean;
      priority: number;
      quietHours: boolean;
      grouping: boolean;
      settings: DynamicRecord;
    };
    previousPreferences: DynamicRecord;
    reason: string;
  };
}

// Campaign Events
export interface NotificationCampaignCreatedEvent extends BaseNotificationEvent {
  type: 'notification_campaign_created';
  data: {
    campaignId: string;
    name: string;
    description: string;
    templateId: string;
    targetAudience: {
      users?: string[];
      segments?: string[];
      filters: DynamicValue[];
      excludeUsers?: string[];
    };
    schedule: {
      type: string;
      startDate?: Date;
      endDate?: Date;
      timezone: string;
      frequency?: string;
      sendTimes?: string[];
    };
    budget: {
      maxNotifications: number;
      maxCost?: number;
      costPerNotification?: number;
      currency?: string;
    };
    status: string;
    createdBy: string;
  };
}

export interface NotificationCampaignStartedEvent extends BaseNotificationEvent {
  type: 'notification_campaign_started';
  data: {
    campaignId: string;
    startedAt: Date;
    targetCount: number;
    estimatedDuration: number;
    channels: string[];
    budget: {
      maxNotifications: number;
      maxCost?: number;
    };
  };
}

export interface NotificationCampaignCompletedEvent extends BaseNotificationEvent {
  type: 'notification_campaign_completed';
  data: {
    campaignId: string;
    completedAt: Date;
    metrics: {
      sent: number;
      delivered: number;
      read: number;
      clicked: number;
      failed: number;
      cost: number;
      ctr: number;
      deliveryRate: number;
      readRate: number;
    };
    performance: {
      efficiency: number;
      effectiveness: number;
      roi: number;
    };
    issues: string[];
    recommendations: string[];
  };
}

export interface NotificationCampaignPausedEvent extends BaseNotificationEvent {
  type: 'notification_campaign_paused';
  data: {
    campaignId: string;
    pausedAt: Date;
    reason: string;
    pausedBy: string;
    progress: {
      sent: number;
      total: number;
      percentage: number;
    };
    resumeAt?: Date;
  };
}

// Rule Events
export interface NotificationRuleTriggeredEvent extends BaseNotificationEvent {
  type: 'notification_rule_triggered';
  data: {
    ruleId: string;
    ruleName: string;
    triggeredAt: Date;
    conditions: {
      field: string;
      operator: string;
      value: DynamicValue;
      satisfied: boolean;
    }[];
    actions: {
      type: string;
      parameters: DynamicRecord;
      executed: boolean;
    }[];
    context: {
      userId: string;
      triggerData: DynamicRecord;
      environment: DynamicRecord;
    };
  };
}

export interface NotificationRuleCreatedEvent extends BaseNotificationEvent {
  type: 'notification_rule_created';
  data: {
    ruleId: string;
    name: string;
    description: string;
    conditions: DynamicValue[];
    actions: DynamicValue[];
    priority: number;
    enabled: boolean;
    createdBy: string;
    createdAt: Date;
  };
}

export interface NotificationRuleUpdatedEvent extends BaseNotificationEvent {
  type: 'notification_rule_updated';
  data: {
    ruleId: string;
    changes: {
      field: string;
      oldValue: DynamicValue;
      newValue: DynamicValue;
      reason: string;
    }[];
    updatedBy: string;
    updatedAt: Date;
  };
}

// Analytics Events
export interface NotificationAnalyticsEvent extends BaseNotificationEvent {
  type: 'notification_analytics';
  data: {
    analyticsType: 'performance' | 'engagement' | 'delivery' | 'user_behavior';
    timeframe: string;
    metrics: Record<string, number>;
    dimensions: DynamicRecord;
    insights: {
      type: string;
      description: string;
      significance: string;
      recommendations: string[];
    }[];
    generatedAt: Date;
  };
}

export interface NotificationPerformanceReportEvent extends BaseNotificationEvent {
  type: 'notification_performance_report';
  data: {
    reportPeriod: {
      start: Date;
      end: Date;
    };
    overview: {
      totalSent: number;
      totalDelivered: number;
      totalRead: number;
      totalClicked: number;
      deliveryRate: number;
      readRate: number;
      clickRate: number;
      averageLatency: number;
    };
    byChannel: Record<
      string,
      {
        sent: number;
        delivered: number;
        read: number;
        clicked: number;
        deliveryRate: number;
        readRate: number;
        clickRate: number;
      }
    >;
    byCategory: Record<
      string,
      {
        sent: number;
        delivered: number;
        read: number;
        clicked: number;
        deliveryRate: number;
        readRate: number;
        clickRate: number;
      }
    >;
    trends: {
      delivery: Array<{ date: Date; rate: number }>;
      engagement: Array<{ date: Date; rate: number }>;
      performance: Array<{ date: Date; score: number }>;
    };
  };
}

// Webhook Events
export interface NotificationWebhookTriggeredEvent extends BaseNotificationEvent {
  type: 'notification_webhook_triggered';
  data: {
    webhookId: string;
    webhookName: string;
    url: string;
    triggeredAt: Date;
    event: string;
    payload: DynamicRecord;
    response: {
      statusCode: number;
      responseTime: number;
      success: boolean;
      error?: string;
    };
    retryCount: number;
  };
}

export interface NotificationWebhookFailedEvent extends BaseNotificationEvent {
  type: 'notification_webhook_failed';
  data: {
    webhookId: string;
    webhookName: string;
    url: string;
    failedAt: Date;
    event: string;
    payload: DynamicRecord;
    error: {
      type: string;
      message: string;
      statusCode?: number;
    };
    retryCount: number;
    maxRetries: number;
    nextRetry?: Date;
  };
}

// System Events
export interface NotificationSystemMaintenanceEvent extends BaseNotificationEvent {
  type: 'notification_system_maintenance';
  data: {
    maintenanceType: 'scheduled' | 'emergency' | 'upgrade' | 'migration';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    affectedServices: string[];
    impact: {
      delivery: boolean;
      processing: boolean;
      scheduling: boolean;
      analytics: boolean;
    };
    message: string;
    initiatedBy: string;
  };
}

export interface NotificationSystemErrorEvent extends BaseNotificationEvent {
  type: 'notification_system_error';
  data: {
    errorType: 'delivery_failure' | 'template_error' | 'rule_error' | 'system_error';
    errorCode: string;
    errorMessage: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    context: {
      service: string;
      operation: string;
      userId?: string;
      notificationId?: string;
      templateId?: string;
      ruleId?: string;
    };
    stackTrace?: string;
    affectedUsers: number;
    recoveryAction: string;
  };
}

export interface NotificationSystemPerformanceEvent extends BaseNotificationEvent {
  type: 'notification_system_performance';
  data: {
    metric: string;
    value: number;
    threshold: number;
    status: 'normal' | 'warning' | 'critical';
    service: string;
    timeframe: string;
    context: DynamicRecord;
  };
}

// User Interaction Events
export interface NotificationUserInteractionEvent extends BaseNotificationEvent {
  type: 'notification_user_interaction';
  data: {
    interactionType: 'dismiss' | 'snooze' | 'mute' | 'unmute' | 'mark_spam' | 'report_abuse';
    notificationId?: string;
    category?: string;
    channel?: string;
    interactionTime: Date;
    reason?: string;
    feedback?: {
      rating: number;
      comment?: string;
    };
    context: {
      device: string;
      location?: string;
      sessionDuration?: number;
    };
  };
}

export interface NotificationUserFeedbackEvent extends BaseNotificationEvent {
  type: 'notification_user_feedback';
  data: {
    feedbackType: 'rating' | 'comment' | 'suggestion' | 'complaint';
    notificationId?: string;
    category?: string;
    rating?: number;
    comment?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    tags?: string[];
    submittedAt: Date;
    context: {
      device: string;
      location?: string;
    };
  };
}

// Union Type for All Notification Events
export type NotificationEventType = NotificationSentEvent | NotificationDeliveredEvent | NotificationReadEvent | NotificationClickedEvent | NotificationFailedEvent | NotificationExpiredEvent | NotificationCancelledEvent | NotificationTemplateCreatedEvent | NotificationTemplateUpdatedEvent | NotificationTemplateDeletedEvent | NotificationPreferencesUpdatedEvent | NotificationChannelPreferencesUpdatedEvent | NotificationCampaignCreatedEvent | NotificationCampaignStartedEvent | NotificationCampaignCompletedEvent | NotificationCampaignPausedEvent | NotificationRuleTriggeredEvent | NotificationRuleCreatedEvent | NotificationRuleUpdatedEvent | NotificationAnalyticsEvent | NotificationPerformanceReportEvent | NotificationWebhookTriggeredEvent | NotificationWebhookFailedEvent | NotificationSystemMaintenanceEvent | NotificationSystemErrorEvent | NotificationSystemPerformanceEvent | NotificationUserInteractionEvent | NotificationUserFeedbackEvent;

// Event Factory Functions
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

// Helper Functions
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEventMetadata(source: string): EventMetadata {
  return {
    source,
    version: '1.0.0',
    platform: getPlatform(),
  };
}

function getPlatform(): string {
  if (typeof window !== 'undefined') {
    return 'web';
  }
  // Add platform detection logic here
  return 'unknown';
}

// Event Validation
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

function validateNotificationSentEvent(event: NotificationSentEvent): boolean {
  const { data } = event;
  return !!(data.notificationId && data.type && data.category && data.priority && data.channels && data.template && data.personalization);
}

function validateNotificationDeliveredEvent(event: NotificationDeliveredEvent): boolean {
  const { data } = event;
  return !!(data.notificationId && data.channel && data.deliveryTime && typeof data.latency === 'number' && data.provider);
}

function validateNotificationReadEvent(event: NotificationReadEvent): boolean {
  const { data } = event;
  return !!(data.notificationId && data.readAt && typeof data.readTimeframe === 'number' && data.readMethod && data.readContext);
}

function validateNotificationClickedEvent(event: NotificationClickedEvent): boolean {
  const { data } = event;
  return !!(data.notificationId && data.clickedAt && typeof data.clickTimeframe === 'number' && data.action && data.clickContext);
}

// Event Serialization
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
