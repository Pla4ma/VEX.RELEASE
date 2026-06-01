import type {
  NotificationType,
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
} from './types-core';

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
  workingHours: { start: string; end: string };
  workingDays: number[];
}

export interface QuietHoursSettings {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
  exceptions: NotificationType[];
}
