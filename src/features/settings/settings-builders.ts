import type { Setting, NotificationSettings, CoachSettings, AppearanceSettings, PrivacySettings } from './types';
import { launchColors } from '@theme/tokens/launch-colors';

function getValue(settings: Setting[], key: string, defaultValue: unknown) {
  return settings.find((s) => s.key === key)?.value ?? defaultValue;
}

export function buildNotificationSettings(
  userId: string,
  settings: Setting[],
): NotificationSettings {
  return {
    userId,
    channels: {
      push: {
        enabled: getValue(settings, 'notifications.push.enabled', true) as boolean,
        deviceTokens: getValue(settings, 'notifications.push.deviceTokens', []) as string[],
        quietHoursStart: getValue(settings, 'notifications.push.quietHoursStart', undefined) as number | undefined,
        quietHoursEnd: getValue(settings, 'notifications.push.quietHoursEnd', undefined) as number | undefined,
        timezone: getValue(settings, 'notifications.push.timezone', 'UTC') as string,
      },
      email: {
        enabled: getValue(settings, 'notifications.email.enabled', true) as boolean,
        email: getValue(settings, 'notifications.email.address', '') as string,
        digestFrequency: getValue(settings, 'notifications.email.digestFrequency', 'daily') as 'immediate' | 'daily' | 'weekly' | 'never',
      },
      inApp: {
        enabled: getValue(settings, 'notifications.inApp.enabled', true) as boolean,
        soundEnabled: getValue(settings, 'notifications.inApp.soundEnabled', true) as boolean,
        vibrationEnabled: getValue(settings, 'notifications.inApp.vibrationEnabled', true) as boolean,
      },
    },
    preferences: {
      critical: { enabled: true, channels: ['push', 'email', 'in_app'] },
      high: { enabled: true, channels: ['push', 'in_app'] },
      normal: { enabled: true, channels: ['in_app'] },
      low: { enabled: false, channels: [] },
    },
    customRules: [],
  };
}

export function buildCoachSettings(userId: string, settings: Setting[]): CoachSettings {
  return {
    userId,
    enabled: getValue(settings, 'coach.enabled', true) as boolean,
    personality: getValue(settings, 'coach.personality', 'supportive') as 'supportive' | 'tough' | 'neutral' | 'funny',
    frequency: getValue(settings, 'coach.frequency', 'moderate') as 'minimal' | 'moderate' | 'frequent' | 'constant',
    messageTypes: {
      streakReminders: getValue(settings, 'coach.messageTypes.streakReminders', true) as boolean,
      sessionTips: getValue(settings, 'coach.messageTypes.sessionTips', true) as boolean,
      milestoneCelebrations: getValue(settings, 'coach.messageTypes.milestoneCelebrations', true) as boolean,
      encouragement: getValue(settings, 'coach.messageTypes.encouragement', true) as boolean,
      challenges: getValue(settings, 'coach.messageTypes.challenges', true) as boolean,
    },
    quietHours: {
      enabled: getValue(settings, 'coach.quietHours.enabled', false) as boolean,
      start: getValue(settings, 'coach.quietHours.start', '22:00') as string,
      end: getValue(settings, 'coach.quietHours.end', '08:00') as string,
      timezone: getValue(settings, 'coach.quietHours.timezone', 'UTC') as string,
    },
    customTriggers: [],
  };
}

export function buildAppearanceSettings(userId: string, settings: Setting[]): AppearanceSettings {
  return {
    userId,
    theme: getValue(settings, 'appearance.theme', 'system') as 'light' | 'dark' | 'system',
    accentColor: getValue(settings, 'appearance.accentColor', launchColors.hex_6366f1) as string,
    fontScale: getValue(settings, 'appearance.fontScale', 1) as number,
    useSystemFont: getValue(settings, 'appearance.useSystemFont', true) as boolean,
    reduceMotion: getValue(settings, 'appearance.reduceMotion', false) as boolean,
    highContrast: getValue(settings, 'appearance.highContrast', false) as boolean,
    compactMode: getValue(settings, 'appearance.compactMode', false) as boolean,
  };
}

export function buildPrivacySettings(userId: string, settings: Setting[]): PrivacySettings {
  return {
    userId,
    profileVisibility: getValue(settings, 'privacy.profileVisibility', 'friends') as 'public' | 'friends' | 'private',
    showOnlineStatus: getValue(settings, 'privacy.showOnlineStatus', true) as boolean,
    showActivityStatus: getValue(settings, 'privacy.showActivityStatus', true) as boolean,
    allowDataAnalysis: getValue(settings, 'privacy.allowDataAnalysis', true) as boolean,
    allowPersonalization: getValue(settings, 'privacy.allowPersonalization', true) as boolean,
    thirdPartySharing: getValue(settings, 'privacy.thirdPartySharing', false) as boolean,
    analyticsOptOut: getValue(settings, 'privacy.analyticsOptOut', false) as boolean,
  };
}
