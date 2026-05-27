import { NotificationEvent } from "./types";
export interface BaseNotificationEvent {
  id: string;
  userId: string;
  notificationId?: string;
  channelId?: "in_app" | "push" | "email" | "sms" | "webhook";
  timestamp: Date;
  data: Record<string, unknown>;
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
  type: "mobile" | "tablet" | "desktop" | "web";
  os: string;
  version: string;
  appVersion?: string;
  pushToken?: string;
}
export interface NotificationSentEvent extends BaseNotificationEvent {
  type: "notification_sent";
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
  type: "notification_delivered";
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
  type: "notification_read";
  data: {
    notificationId: string;
    readAt: Date;
    readTimeframe: number;
    readMethod: "click" | "mark_read" | "auto_read";
    readContext: {
      device: string;
      location?: string;
      sessionDuration?: number;
    };
  };
}
export interface NotificationClickedEvent extends BaseNotificationEvent {
  type: "notification_clicked";
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
  type: "notification_failed";
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
  type: "notification_expired";
  data: {
    notificationId: string;
    expiredAt: Date;
    originalScheduledTime: Date;
    expirationReason:
      | "ttl_exceeded"
      | "no_longer_relevant"
      | "user_preference"
      | "system_limit";
    channels: string[];
    deliveryAttempts: number;
    usersAffected: number;
  };
}
export interface NotificationCancelledEvent extends BaseNotificationEvent {
  type: "notification_cancelled";
  data: {
    notificationId: string;
    cancelledAt: Date;
    reason:
      | "user_request"
      | "system_policy"
      | "content_update"
      | "technical_issue";
    cancelledBy: string;
    channels: string[];
    usersAffected: number;
    refund?: { type: "credits" | "tokens" | "money"; amount: number };
  };
}
export interface NotificationTemplateCreatedEvent extends BaseNotificationEvent {
  type: "notification_template_created";
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
      defaultValue?: unknown;
    }[];
    channels: string[];
    priority: string;
    ttl: number;
    localization: Record<string, { title: string; message: string }>;
    createdBy: string;
  };
}
export interface NotificationTemplateUpdatedEvent extends BaseNotificationEvent {
  type: "notification_template_updated";
  data: {
    templateId: string;
    changes: {
      field: string;
      oldValue: unknown;
      newValue: unknown;
      reason: string;
    }[];
    updatedBy: string;
    version: string;
    affectedNotifications: number;
  };
}
export interface NotificationTemplateDeletedEvent extends BaseNotificationEvent {
  type: "notification_template_deleted";
  data: {
    templateId: string;
    deletedAt: Date;
    deletedBy: string;
    reason: string;
    affectedNotifications: number;
    replacementTemplate?: string;
  };
}
export interface NotificationPreferencesUpdatedEvent extends BaseNotificationEvent {
  type: "notification_preferences_updated";
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
        inApp: unknown;
        push: unknown;
        email: unknown;
        sms: unknown;
      };
      scheduleSettings: {
        enabled: boolean;
        timezone: string;
        workingHours: { start: string; end: string };
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
    updatedBy: "user" | "system" | "admin";
  };
}
export interface NotificationChannelPreferencesUpdatedEvent extends BaseNotificationEvent {
  type: "notification_channel_preferences_updated";
  data: {
    channel: string;
    preferences: {
      enabled: boolean;
      priority: number;
      quietHours: boolean;
      grouping: boolean;
      settings: Record<string, unknown>;
    };
    previousPreferences: Record<string, unknown>;
    reason: string;
  };
}
export interface NotificationCampaignCreatedEvent extends BaseNotificationEvent {
  type: "notification_campaign_created";
  data: {
    campaignId: string;
    name: string;
    description: string;
    templateId: string;
    targetAudience: {
      users?: string[];
      segments?: string[];
      filters: unknown[];
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
  type: "notification_campaign_started";
  data: {
    campaignId: string;
    startedAt: Date;
    targetCount: number;
    estimatedDuration: number;
    channels: string[];
    budget: { maxNotifications: number; maxCost?: number };
  };
}
export interface NotificationCampaignCompletedEvent extends BaseNotificationEvent {
  type: "notification_campaign_completed";
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
    performance: { efficiency: number; effectiveness: number; roi: number };
    issues: string[];
    recommendations: string[];
  };
}
export interface NotificationCampaignPausedEvent extends BaseNotificationEvent {
  type: "notification_campaign_paused";
  data: {
    campaignId: string;
    pausedAt: Date;
    reason: string;
    pausedBy: string;
    progress: { sent: number; total: number; percentage: number };
    resumeAt?: Date;
  };
}
export interface NotificationRuleTriggeredEvent extends BaseNotificationEvent {
  type: "notification_rule_triggered";
  data: {
    ruleId: string;
    ruleName: string;
    triggeredAt: Date;
    conditions: {
      field: string;
      operator: string;
      value: unknown;
      satisfied: boolean;
    }[];
    actions: {
      type: string;
      parameters: Record<string, unknown>;
      executed: boolean;
    }[];
    context: {
      userId: string;
      triggerData: Record<string, unknown>;
      environment: Record<string, unknown>;
    };
  };
}
export interface NotificationRuleCreatedEvent extends BaseNotificationEvent {
  type: "notification_rule_created";
  data: {
    ruleId: string;
    name: string;
    description: string;
    conditions: unknown[];
    actions: unknown[];
    priority: number;
    enabled: boolean;
    createdBy: string;
    createdAt: Date;
  };
}
export interface NotificationRuleUpdatedEvent extends BaseNotificationEvent {
  type: "notification_rule_updated";
  data: {
    ruleId: string;
    changes: {
      field: string;
      oldValue: unknown;
      newValue: unknown;
      reason: string;
    }[];
    updatedBy: string;
    updatedAt: Date;
  };
}
export interface NotificationAnalyticsEvent extends BaseNotificationEvent {
  type: "notification_analytics";
  data: {
    analyticsType: "performance" | "engagement" | "delivery" | "user_behavior";
    timeframe: string;
    metrics: Record<string, number>;
    dimensions: Record<string, unknown>;
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
  type: "notification_performance_report";
  data: {
    reportPeriod: { start: Date; end: Date };
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
export interface NotificationWebhookTriggeredEvent extends BaseNotificationEvent {
  type: "notification_webhook_triggered";
  data: {
    webhookId: string;
    webhookName: string;
    url: string;
    triggeredAt: Date;
    event: string;
    payload: Record<string, unknown>;
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
  type: "notification_webhook_failed";
  data: {
    webhookId: string;
    webhookName: string;
    url: string;
    failedAt: Date;
    event: string;
    payload: Record<string, unknown>;
    error: { type: string; message: string; statusCode?: number };
    retryCount: number;
    maxRetries: number;
    nextRetry?: Date;
  };
}
export interface NotificationSystemMaintenanceEvent extends BaseNotificationEvent {
  type: "notification_system_maintenance";
  data: {
    maintenanceType: "scheduled" | "emergency" | "upgrade" | "migration";
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
  type: "notification_system_error";
  data: {
    errorType:
      | "delivery_failure"
      | "template_error"
      | "rule_error"
      | "system_error";
    errorCode: string;
    errorMessage: string;
    severity: "low" | "medium" | "high" | "critical";
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
  type: "notification_system_performance";
  data: {
    metric: string;
    value: number;
    threshold: number;
    status: "normal" | "warning" | "critical";
    service: string;
    timeframe: string;
    context: Record<string, unknown>;
  };
}
export interface NotificationUserInteractionEvent extends BaseNotificationEvent {
  type: "notification_user_interaction";
  data: {
    interactionType:
      | "dismiss"
      | "snooze"
      | "mute"
      | "unmute"
      | "mark_spam"
      | "report_abuse";
    notificationId?: string;
    category?: string;
    channel?: string;
    interactionTime: Date;
    reason?: string;
    feedback?: { rating: number; comment?: string };
    context: { device: string; location?: string; sessionDuration?: number };
  };
}
export interface NotificationUserFeedbackEvent extends BaseNotificationEvent {
  type: "notification_user_feedback";
  data: {
    feedbackType: "rating" | "comment" | "suggestion" | "complaint";
    notificationId?: string;
    category?: string;
    rating?: number;
    comment?: string;
    sentiment?: "positive" | "neutral" | "negative";
    tags?: string[];
    submittedAt: Date;
    context: { device: string; location?: string };
  };
}
export type NotificationEventType =
  | NotificationSentEvent
  | NotificationDeliveredEvent
  | NotificationReadEvent
  | NotificationClickedEvent
  | NotificationFailedEvent
  | NotificationExpiredEvent
  | NotificationCancelledEvent
  | NotificationTemplateCreatedEvent
  | NotificationTemplateUpdatedEvent
  | NotificationTemplateDeletedEvent
  | NotificationPreferencesUpdatedEvent
  | NotificationChannelPreferencesUpdatedEvent
  | NotificationCampaignCreatedEvent
  | NotificationCampaignStartedEvent
  | NotificationCampaignCompletedEvent
  | NotificationCampaignPausedEvent
  | NotificationRuleTriggeredEvent
  | NotificationRuleCreatedEvent
  | NotificationRuleUpdatedEvent
  | NotificationAnalyticsEvent
  | NotificationPerformanceReportEvent
  | NotificationWebhookTriggeredEvent
  | NotificationWebhookFailedEvent
  | NotificationSystemMaintenanceEvent
  | NotificationSystemErrorEvent
  | NotificationSystemPerformanceEvent
  | NotificationUserInteractionEvent
  | NotificationUserFeedbackEvent;
