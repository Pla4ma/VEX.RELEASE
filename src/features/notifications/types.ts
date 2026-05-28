export type {
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationChannel,
  NotificationStatus,
  NotificationMetadata,
  Geolocation,
} from "./types-core";

export type {
  NotificationTemplate,
  TemplateVariable,
  LocalizedTemplate,
  ThrottlingSettings,
  NotificationRule,
  RuleCondition,
  RuleAction,
} from "./types-template";

export type {
  NotificationPreferences,
  GlobalNotificationSettings,
  CategoryNotificationSettings,
  TypeNotificationSettings,
  ChannelNotificationSettings,
  ChannelSettings,
  ScheduleNotificationSettings,
  QuietHoursSettings,
} from "./types-preferences";

export type {
  NotificationCampaign,
  CampaignTarget,
  TargetFilter,
  CampaignSchedule,
  CampaignBudget,
  CampaignStatus,
  CampaignMetrics,
} from "./types-campaign";

export type {
  NotificationAnalytics,
  TrendData,
  NotificationDelivery,
  DeliveryStatus,
  DeliveryAttempt,
  DeliveryError,
  DeliveryMetadata,
  NotificationEvent,
  NotificationWebhook,
  WebhookRetryPolicy,
  WebhookPayload,
} from "./types-delivery";

export * from "./notification-event-types";
