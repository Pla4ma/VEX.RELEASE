import { BaseNotificationEvent } from './notification-event-types-core';

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
  type: 'notification_template_updated';
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
      settings: Record<string, unknown>;
    };
    previousPreferences: Record<string, unknown>;
    reason: string;
  };
}
