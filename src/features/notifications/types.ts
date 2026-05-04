/**
 * Notifications Feature Types
 * 
 * Types for notification management, delivery, and user preferences.
 */

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  status: NotificationStatus;
  createdAt: Date;
  scheduledAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  metadata: NotificationMetadata;
}

export type NotificationType = 
  | 'session_reminder'
  | 'achievement_unlocked'
  | 'challenge_update'
  | 'social_invite'
  | 'system_update'
  | 'progress_milestone'
  | 'streak_update'
  | 'reward_claimed'
  | 'leaderboard_change'
  | 'feature_announcement'
  | 'maintenance'
  | 'security'
  | 'billing'
  | 'custom';

export type NotificationCategory = 
  | 'productivity'
  | 'social'
  | 'gamification'
  | 'system'
  | 'security'
  | 'billing'
  | 'updates'
  | 'reminders'
  | 'achievements'
  | 'challenges';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export type NotificationChannel = 'in_app' | 'push' | 'email' | 'sms' | 'webhook';

export type NotificationStatus = 
  | 'pending'
  | 'scheduled'
  | 'sending'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'expired'
  | 'cancelled';

export interface NotificationMetadata {
  source: string;
  campaign?: string;
  version: string;
  platform?: string;
  deviceInfo?: DeviceInfo;
  geolocation?: Geolocation;
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

export interface Geolocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timezone?: string;
  country?: string;
  city?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  category: NotificationCategory;
  defaultTitle: string;
  defaultMessage: string;
  variables: TemplateVariable[];
  channels: NotificationChannel[];
  priority: NotificationPriority;
  ttl: number; // time to live in seconds
  throttling: ThrottlingSettings;
  localization: Record<string, LocalizedTemplate>;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface LocalizedTemplate {
  title: string;
  message: string;
  variables?: Record<string, string>;
}

export interface ThrottlingSettings {
  enabled: boolean;
  maxPerHour: number;
  maxPerDay: number;
  cooldownPeriod: number; // in seconds
  groupBy: string[]; // fields to group by for throttling
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface RuleAction {
  type: 'send' | 'schedule' | 'transform' | 'filter' | 'route' | 'suppress';
  parameters: Record<string, any>;
}

export interface NotificationPreferences {
  userId: string;
  globalSettings: GlobalNotificationSettings;
  categorySettings: Record<NotificationCategory, CategoryNotificationSettings>;
  typeSettings: Record<NotificationType, TypeNotificationSettings>;
  channelSettings: ChannelNotificationSettings;
  scheduleSettings: ScheduleNotificationSettings;
  quietHours: QuietHoursSettings;
}

export interface GlobalNotificationSettings {
  enabled: boolean;
  doNotDisturb: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  badgeEnabled: boolean;
  previewEnabled: boolean;
  groupingEnabled: boolean;
  smartDelivery: boolean;
}

export interface CategoryNotificationSettings {
  enabled: boolean;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface TypeNotificationSettings {
  enabled: boolean;
  channels: NotificationChannel[];
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  maxPerDay: number;
}

export interface ChannelNotificationSettings {
  inApp: ChannelSettings;
  push: ChannelSettings;
  email: ChannelSettings;
  sms: ChannelSettings;
}

export interface ChannelSettings {
  enabled: boolean;
  priority: number;
  quietHours: boolean;
  grouping: boolean;
}

export interface ScheduleNotificationSettings {
  enabled: boolean;
  timezone: string;
  workingHours: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  workingDays: number[]; // 0-6 (Sunday-Saturday)
}

export interface QuietHoursSettings {
  enabled: boolean;
  start: string; // HH:mm
  end: string; // HH:mm
  timezone: string;
  exceptions: NotificationType[];
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  targetAudience: CampaignTarget;
  schedule: CampaignSchedule;
  budget: CampaignBudget;
  status: CampaignStatus;
  metrics: CampaignMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignTarget {
  users?: string[];
  segments?: string[];
  filters: TargetFilter[];
  excludeUsers?: string[];
}

export interface TargetFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface CampaignSchedule {
  type: 'immediate' | 'scheduled' | 'recurring';
  startDate?: Date;
  endDate?: Date;
  timezone: string;
  frequency?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  sendTimes?: string[]; // HH:mm
}

export interface CampaignBudget {
  maxNotifications: number;
  maxCost?: number;
  costPerNotification?: number;
  currency?: string;
}

export type CampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  failed: number;
  cost: number;
  ctr: number; // click-through rate
  deliveryRate: number;
  readRate: number;
}

export interface NotificationAnalytics {
  userId: string;
  timeframe: 'hourly' | 'daily' | 'weekly' | 'monthly';
  metrics: {
    totalReceived: number;
    totalRead: number;
    totalClicked: number;
    readRate: number;
    clickRate: number;
    averageResponseTime: number;
    categoryBreakdown: Record<NotificationCategory, number>;
    channelBreakdown: Record<NotificationChannel, number>;
  };
  trends: {
    received: TrendData[];
    read: TrendData[];
    clicked: TrendData[];
  };
  insights: string[];
  recommendations: string[];
}

export interface TrendData {
  timestamp: Date;
  value: number;
  change: number;
  significance: 'low' | 'medium' | 'high';
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  userId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  attempts: DeliveryAttempt[];
  deliveredAt?: Date;
  failedAt?: Date;
  error?: DeliveryError;
  metadata: DeliveryMetadata;
}

export type DeliveryStatus = 
  | 'pending'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface DeliveryAttempt {
  attempt: number;
  timestamp: Date;
  status: DeliveryStatus;
  response?: any;
  error?: string;
  duration: number; // in milliseconds
}

export interface DeliveryError {
  code: string;
  message: string;
  type: 'temporary' | 'permanent';
  retryable: boolean;
  retryAfter?: number;
}

export interface DeliveryMetadata {
  provider: string;
  messageId?: string;
  trackingId?: string;
  cost?: number;
  latency?: number;
}

// Event Types
export interface NotificationEvent {
  type: 'notification_sent' | 'notification_delivered' | 'notification_read' | 'notification_clicked' | 'notification_failed' | 'preferences_updated';
  userId: string;
  notificationId?: string;
  channelId?: NotificationChannel;
  data: Record<string, any>;
  timestamp: Date;
}

// Webhook Types
export interface NotificationWebhook {
  id: string;
  name: string;
  url: string;
  events: NotificationEvent['type'][];
  secret: string;
  active: boolean;
  retryPolicy: WebhookRetryPolicy;
  headers: Record<string, string>;
  createdAt: Date;
  lastTriggered?: Date;
}

export interface WebhookRetryPolicy {
  enabled: boolean;
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  retryDelay: number; // in seconds
}

export interface WebhookPayload {
  event: NotificationEvent['type'];
  data: Record<string, any>;
  timestamp: Date;
  signature: string;
  version: string;
}
