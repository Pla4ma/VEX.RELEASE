/**
 * Notifications Feature Barrel Export
 *
 * @phase 11
 */

// Types & Schemas
export * from "./schemas";
export type { NotificationContext } from "./service-types";

// Service
export { dispatchUrgencyNotification } from "./service";
export * as notificationsRepository from "./repository";

// Phase 8 - Push Delivery
export {
  clearBadgeCount,
  getPushToken,
  getScheduledPushNotifications,
  handleNotificationResponse,
  presentInAppNotification,
  requestPushPermissions,
  sendPushNotification,
  schedulePushNotification,
  cancelPushNotification,
  cancelAllPushNotifications,
  setBadgeCount,
  type PushNotificationPayload,
  type NotificationPriority,
} from "./push-delivery";

// Phase 10.1 - Social Notifications
export {
  dispatchSocialNotification,
  type SocialNotification,
} from "./social-notifications";

// Phase 11.5 - Smart Notification Scheduler
export {
  analyzePeakFocusWindow,
  isInPeakWindow,
  processSmartNotifications,
  useSmartNotifications,
} from "./SmartNotificationScheduler";
export {
  PeakFocusWindowSchema,
  NotificationContentTypeSchema,
  SmartNotificationConfigSchema,
  type PeakFocusWindow,
  type NotificationContentType,
  type SmartNotificationConfig,
} from "./SmartNotificationScheduler-types";
export { selectNotificationType } from "./SmartNotificationScheduler-generators";

// Phase 11.6 - Weekly Report
export {
  WeeklyReportCard,
  WeeklyReportCompact,
} from "./components/WeeklyReportCard";

// Phase 8 - Notification Center
export {
  NotificationCenter,
  type NotificationItem,
} from "./components/NotificationCenter";

// Phase 13.2 - Notification Badge
export {
  NotificationBadge,
  NotificationDot,
  useNotificationBadge,
} from "./components/NotificationBadge";

// Hooks
export * from "./hooks";

// Analytics
export * from "./analytics";

// Retention
export * from "./retention-strategy";

// Phase 5.2 - Smart Notification System
export {
  evaluateNotificationContext,
  scheduleNotification,
  sendScheduledNotification,
  markNotificationOpened,
  markNotificationDismissed,
  getReEngagementMessage,
  shouldReEngage,
  getNotificationAnalytics,
  NOTIFICATION_RULES,
  RE_ENGAGEMENT_STAGES,
  STREAK_PROTECTION_RULE,
  BOSS_OPPORTUNITY_RULE,
  STUDY_REMINDER_RULE,
  SQUAD_ACTIVITY_RULE,
  COMEBACK_RULE,
} from "./SmartNotificationSystem";
