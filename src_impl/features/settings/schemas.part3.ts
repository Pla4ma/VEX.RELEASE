import { z } from "zod";


export function createDefaultAppearanceSettings(userId: string): AppearanceSettings {
  return AppearanceSettingsSchema.parse({
    userId,
    theme: 'system',
    accentColor: 'theme.colors.primary[500]',
    fontScale: 1,
    useSystemFont: true,
    reduceMotion: false,
    highContrast: false,
    compactMode: false,
  });
}

export function createDefaultPrivacySettings(userId: string): z.infer<typeof PrivacySettingsSchema> {
  return PrivacySettingsSchema.parse({
    userId,
    profileVisibility: 'friends',
    showOnlineStatus: true,
    showActivityStatus: true,
    allowDataAnalysis: true,
    allowPersonalization: true,
    thirdPartySharing: false,
    analyticsOptOut: false,
  });
}

export function createDefaultDataControlSettings(userId: string): z.infer<typeof DataControlSettingsSchema> {
  return DataControlSettingsSchema.parse({
    userId,
    retentionPolicy: 'standard',
    autoExport: {
      enabled: false,
      frequency: 'never',
      format: 'json',
    },
    backupEnabled: true,
  });
}