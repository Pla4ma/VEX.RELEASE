import * as Notifications from 'expo-notifications';

import type { MessageCategory } from '../schemas';

export const NOTIFICATION_CONFIG = {
  androidChannelId: 'coach-notifications',
  androidChannelName: 'VEX Coach',
  androidChannelDescription: 'Personalized coaching messages and reminders',
  maxNotificationsPerHour: 10,
  quietHoursStart: 22,
  quietHoursEnd: 8,
} as const;

export interface CategoryConfig {
  title: string;
  androidConfig: {
    channelId?: string;
    priority?: Notifications.AndroidNotificationPriority;
  };
}

const CATEGORY_CONFIGS: Record<MessageCategory, CategoryConfig> = {
  STREAK_RISK: {
    title: 'Streak Alert!',
    androidConfig: {
      channelId: NOTIFICATION_CONFIG.androidChannelId,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
  },
  SESSION_SUGGESTION: {
    title: 'Time to Focus',
    androidConfig: {
      channelId: NOTIFICATION_CONFIG.androidChannelId,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
  },
  MILESTONE_HYPE: {
    title: 'Milestone Reached!',
    androidConfig: {
      channelId: NOTIFICATION_CONFIG.androidChannelId,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
  },
  COMEBACK_SUPPORT: {
    title: 'Comeback Mode',
    androidConfig: {
      channelId: NOTIFICATION_CONFIG.androidChannelId,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
  },
  POST_FAILURE: {
    title: 'Supportive Message',
    androidConfig: {
      channelId: NOTIFICATION_CONFIG.androidChannelId,
      priority: Notifications.AndroidNotificationPriority.LOW,
    },
  },
  PROGRESS_REMINDER: {
    title: 'Progress Update',
    androidConfig: {
      channelId: NOTIFICATION_CONFIG.androidChannelId,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
  },
  DIFFICULTY_ADJUST: {
    title: 'Difficulty Adjusted',
    androidConfig: {
      channelId: NOTIFICATION_CONFIG.androidChannelId,
      priority: Notifications.AndroidNotificationPriority.LOW,
    },
  },
  CHALLENGE_PROMPT: {
    title: 'Challenge Alert',
    androidConfig: {
      channelId: NOTIFICATION_CONFIG.androidChannelId,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
  },
  MOTIVATION_BOOST: {
    title: 'Coach Message',
    androidConfig: {
      channelId: NOTIFICATION_CONFIG.androidChannelId,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
  },
  BREAK_SUGGESTION: {
    title: 'Take a Break',
    androidConfig: {
      channelId: NOTIFICATION_CONFIG.androidChannelId,
      priority: Notifications.AndroidNotificationPriority.LOW,
    },
  },
  OVERLOAD_WARNING: {
    title: 'Pace Yourself',
    androidConfig: {
      channelId: NOTIFICATION_CONFIG.androidChannelId,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
  },
};

export function getCategoryConfig(category: MessageCategory): CategoryConfig {
  return CATEGORY_CONFIGS[category] ?? CATEGORY_CONFIGS.MOTIVATION_BOOST;
}
