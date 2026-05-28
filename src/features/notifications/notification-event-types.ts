export type {
  BaseNotificationEvent,
  EventMetadata,
  DeviceInfo,
} from "./notification-event-types-core";
export type {
  NotificationSentEvent,
  NotificationDeliveredEvent,
  NotificationReadEvent,
  NotificationClickedEvent,
  NotificationFailedEvent,
  NotificationExpiredEvent,
  NotificationCancelledEvent,
} from "./notification-event-types-delivery";
export type {
  NotificationTemplateCreatedEvent,
  NotificationTemplateUpdatedEvent,
  NotificationTemplateDeletedEvent,
  NotificationPreferencesUpdatedEvent,
  NotificationChannelPreferencesUpdatedEvent,
} from "./notification-event-types-template";
export type {
  NotificationCampaignCreatedEvent,
  NotificationCampaignStartedEvent,
  NotificationCampaignCompletedEvent,
  NotificationCampaignPausedEvent,
  NotificationRuleTriggeredEvent,
  NotificationRuleCreatedEvent,
  NotificationRuleUpdatedEvent,
} from "./notification-event-types-campaign";
export type {
  NotificationAnalyticsEvent,
  NotificationPerformanceReportEvent,
  NotificationWebhookTriggeredEvent,
  NotificationWebhookFailedEvent,
  NotificationSystemMaintenanceEvent,
  NotificationSystemErrorEvent,
  NotificationSystemPerformanceEvent,
  NotificationUserInteractionEvent,
  NotificationUserFeedbackEvent,
} from "./notification-event-types-system";

import type {
  NotificationSentEvent,
  NotificationDeliveredEvent,
  NotificationReadEvent,
  NotificationClickedEvent,
  NotificationFailedEvent,
  NotificationExpiredEvent,
  NotificationCancelledEvent,
} from "./notification-event-types-delivery";
import type {
  NotificationTemplateCreatedEvent,
  NotificationTemplateUpdatedEvent,
  NotificationTemplateDeletedEvent,
  NotificationPreferencesUpdatedEvent,
  NotificationChannelPreferencesUpdatedEvent,
} from "./notification-event-types-template";
import type {
  NotificationCampaignCreatedEvent,
  NotificationCampaignStartedEvent,
  NotificationCampaignCompletedEvent,
  NotificationCampaignPausedEvent,
  NotificationRuleTriggeredEvent,
  NotificationRuleCreatedEvent,
  NotificationRuleUpdatedEvent,
} from "./notification-event-types-campaign";
import type {
  NotificationAnalyticsEvent,
  NotificationPerformanceReportEvent,
  NotificationWebhookTriggeredEvent,
  NotificationWebhookFailedEvent,
  NotificationSystemMaintenanceEvent,
  NotificationSystemErrorEvent,
  NotificationSystemPerformanceEvent,
  NotificationUserInteractionEvent,
  NotificationUserFeedbackEvent,
} from "./notification-event-types-system";

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
