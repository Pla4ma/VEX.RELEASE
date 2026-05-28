import { BaseNotificationEvent } from "./notification-event-types-core";

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
