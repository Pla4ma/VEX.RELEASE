import { z } from 'zod';
import type {
  AppearanceSettings,
  PrivacySettings,
} from './types';
import {
  safeValue,
  ThemeModeSchema,
  ProfileVisibilitySchema,
} from './settings-schemas';
import { launchColors } from '@theme/tokens/launch-colors';

// ── Appearance builder ────────────────────────────────────────────────

export function buildAppearanceSettings(userId: string, settings: import('./types').Setting[]): AppearanceSettings {
  const raw = {
    userId,
    theme: safeValue(settings, 'appearance.theme', 'system'),
    accentColor: safeValue(settings, 'appearance.accentColor', launchColors.hex_6366f1),
    fontScale: safeValue(settings, 'appearance.fontScale', 1),
    useSystemFont: safeValue(settings, 'appearance.useSystemFont', true),
    reduceMotion: safeValue(settings, 'appearance.reduceMotion', false),
    highContrast: safeValue(settings, 'appearance.highContrast', false),
    compactMode: safeValue(settings, 'appearance.compactMode', false),
  };

  return {
    userId,
    theme: ThemeModeSchema.parse(raw.theme),
    accentColor: z.string().parse(raw.accentColor),
    fontScale: z.number().parse(raw.fontScale),
    useSystemFont: z.boolean().parse(raw.useSystemFont),
    reduceMotion: z.boolean().parse(raw.reduceMotion),
    highContrast: z.boolean().parse(raw.highContrast),
    compactMode: z.boolean().parse(raw.compactMode),
  };
}

// ── Privacy builder ───────────────────────────────────────────────────

export function buildPrivacySettings(userId: string, settings: import('./types').Setting[]): PrivacySettings {
  const raw = {
    userId,
    profileVisibility: safeValue(settings, 'privacy.profileVisibility', 'friends'),
    showOnlineStatus: safeValue(settings, 'privacy.showOnlineStatus', true),
    showActivityStatus: safeValue(settings, 'privacy.showActivityStatus', true),
    allowDataAnalysis: safeValue(settings, 'privacy.allowDataAnalysis', true),
    allowPersonalization: safeValue(settings, 'privacy.allowPersonalization', true),
    thirdPartySharing: safeValue(settings, 'privacy.thirdPartySharing', false),
    analyticsOptOut: safeValue(settings, 'privacy.analyticsOptOut', false),
  };

  return {
    userId,
    profileVisibility: ProfileVisibilitySchema.parse(raw.profileVisibility),
    showOnlineStatus: z.boolean().parse(raw.showOnlineStatus),
    showActivityStatus: z.boolean().parse(raw.showActivityStatus),
    allowDataAnalysis: z.boolean().parse(raw.allowDataAnalysis),
    allowPersonalization: z.boolean().parse(raw.allowPersonalization),
    thirdPartySharing: z.boolean().parse(raw.thirdPartySharing),
    analyticsOptOut: z.boolean().parse(raw.analyticsOptOut),
  };
}

// Re-export everything from the combined module
export {
  buildNotificationSettings,
  buildCoachSettings,
  safeValue,
  ThemeModeSchema,
  ProfileVisibilitySchema,
  DigestFrequencySchema,
  NotificationChannelsSchema,
  NotificationPreferencesSchema,
  CoachPersonalitySchema,
  CoachFrequencySchema,
  CoachMessageTypesSchema,
  CoachQuietHoursSchema,
} from './settings-schemas';
