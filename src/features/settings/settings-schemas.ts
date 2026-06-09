import { z } from 'zod';
import type { Setting, NotificationSettings, CoachSettings } from './types';

// ── Zod schemas for runtime validation ────────────────────────────────

export const DigestFrequencySchema = z.enum(['immediate', 'daily', 'weekly', 'never']);

const PushChannelSchema = z.object({
  enabled: z.boolean().default(true),
  deviceTokens: z.array(z.string()).default([]),
  quietHoursStart: z.number().optional(),
  quietHoursEnd: z.number().optional(),
  timezone: z.string().default('UTC'),
});

const EmailChannelSchema = z.object({
  enabled: z.boolean().default(true),
  email: z.string().default(''),
  digestFrequency: DigestFrequencySchema.default('daily'),
});

const InAppChannelSchema = z.object({
  enabled: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  vibrationEnabled: z.boolean().default(true),
});

export const NotificationChannelsSchema = z.object({
  push: PushChannelSchema,
  email: EmailChannelSchema,
  inApp: InAppChannelSchema,
});

export const NotificationPreferencesSchema = z.object({
  critical: z
    .object({ enabled: z.literal(true), channels: z.array(z.enum(['push', 'email', 'sms', 'in_app'])).min(1) })
    .default({ enabled: true, channels: ['push', 'email', 'in_app'] }),
  high: z
    .object({ enabled: z.literal(true), channels: z.array(z.enum(['push', 'email', 'sms', 'in_app'])).min(1) })
    .default({ enabled: true, channels: ['push', 'in_app'] }),
  normal: z
    .object({ enabled: z.literal(true), channels: z.array(z.enum(['push', 'email', 'sms', 'in_app'])).min(1) })
    .default({ enabled: true, channels: ['in_app'] }),
  low: z
    .object({ enabled: z.literal(false), channels: z.array(z.enum(['push', 'email', 'sms', 'in_app'])) })
    .default({ enabled: false, channels: [] }),
});

export const CoachPersonalitySchema = z.enum(['supportive', 'tough', 'neutral', 'funny']);
export const CoachFrequencySchema = z.enum(['minimal', 'moderate', 'frequent', 'constant']);

export const CoachMessageTypesSchema = z.object({
  streakReminders: z.boolean().default(true),
  sessionTips: z.boolean().default(true),
  milestoneCelebrations: z.boolean().default(true),
  encouragement: z.boolean().default(true),
  challenges: z.boolean().default(true),
});

export const CoachQuietHoursSchema = z.object({
  enabled: z.boolean().default(false),
  start: z.string().default('22:00'),
  end: z.string().default('08:00'),
  timezone: z.string().default('UTC'),
});

export const ThemeModeSchema = z.enum(['light', 'dark', 'system']);
export const ProfileVisibilitySchema = z.enum(['public', 'friends', 'private']);

export function safeValue<T>(settings: Setting[], key: string, defaultValue: T): unknown {
  return settings.find((s) => s.key === key)?.value ?? defaultValue;
}

// ── Notification builder ──────────────────────────────────────────────

export function buildNotificationSettings(
  userId: string,
  settings: Setting[],
): NotificationSettings {
  const raw = {
    userId,
    channels: {
      push: {
        enabled: safeValue(settings, 'notifications.push.enabled', true),
        deviceTokens: safeValue(settings, 'notifications.push.deviceTokens', []),
        quietHoursStart: safeValue(settings, 'notifications.push.quietHoursStart', undefined),
        quietHoursEnd: safeValue(settings, 'notifications.push.quietHoursEnd', undefined),
        timezone: safeValue(settings, 'notifications.push.timezone', 'UTC'),
      },
      email: {
        enabled: safeValue(settings, 'notifications.email.enabled', true),
        email: safeValue(settings, 'notifications.email.address', ''),
        digestFrequency: safeValue(settings, 'notifications.email.digestFrequency', 'daily'),
      },
      inApp: {
        enabled: safeValue(settings, 'notifications.inApp.enabled', true),
        soundEnabled: safeValue(settings, 'notifications.inApp.soundEnabled', true),
        vibrationEnabled: safeValue(settings, 'notifications.inApp.vibrationEnabled', true),
      },
    },
    preferences: {
      critical: { enabled: true, channels: ['push', 'email', 'in_app'] as const },
      high: { enabled: true, channels: ['push', 'in_app'] as const },
      normal: { enabled: true, channels: ['in_app'] as const },
      low: { enabled: false, channels: [] as const },
    },
    customRules: [] as unknown[],
  };

  return {
    userId,
    channels: NotificationChannelsSchema.parse(raw.channels),
    preferences: NotificationPreferencesSchema.parse(raw.preferences),
    customRules: [],
  };
}

// ── Coach builder ─────────────────────────────────────────────────────

export function buildCoachSettings(userId: string, settings: Setting[]): CoachSettings {
  const raw = {
    userId,
    enabled: safeValue(settings, 'coach.enabled', true),
    personality: safeValue(settings, 'coach.personality', 'supportive'),
    frequency: safeValue(settings, 'coach.frequency', 'moderate'),
    messageTypes: {
      streakReminders: safeValue(settings, 'coach.messageTypes.streakReminders', true),
      sessionTips: safeValue(settings, 'coach.messageTypes.sessionTips', true),
      milestoneCelebrations: safeValue(settings, 'coach.messageTypes.milestoneCelebrations', true),
      encouragement: safeValue(settings, 'coach.messageTypes.encouragement', true),
      challenges: safeValue(settings, 'coach.messageTypes.challenges', true),
    },
    quietHours: {
      enabled: safeValue(settings, 'coach.quietHours.enabled', false),
      start: safeValue(settings, 'coach.quietHours.start', '22:00'),
      end: safeValue(settings, 'coach.quietHours.end', '08:00'),
      timezone: safeValue(settings, 'coach.quietHours.timezone', 'UTC'),
    },
    customTriggers: [] as unknown[],
  };

  return {
    userId,
    enabled: z.boolean().parse(raw.enabled),
    personality: CoachPersonalitySchema.parse(raw.personality),
    frequency: CoachFrequencySchema.parse(raw.frequency),
    messageTypes: CoachMessageTypesSchema.parse(raw.messageTypes),
    quietHours: CoachQuietHoursSchema.parse(raw.quietHours),
    customTriggers: [],
  };
}
