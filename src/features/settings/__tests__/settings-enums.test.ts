import { describe, expect, it } from '@jest/globals';

import {
  SettingCategorySchema,
  NotificationChannelSchema,
  NotificationPrioritySchema,
  CoachPersonalitySchema,
  CoachFrequencySchema,
  ThemeModeSchema,
  DataRetentionPolicySchema,
  ExportFormatSchema,
  SyncStatusSchema,
} from '../enums';
import {
  SettingRowSchema,
  AppearanceSettingsSchema,
  PrivacySettingsSchema,
  DataControlSettingsSchema,
  SyncStateSchema,
} from '../core-schemas';

describe('settings enums', () => {
  it('SettingCategorySchema accepts valid categories', () => {
    for (const cat of ['general', 'notifications', 'coach', 'appearance', 'privacy', 'data', 'advanced']) {
      expect(SettingCategorySchema.safeParse(cat).success).toBe(true);
    }
    expect(SettingCategorySchema.safeParse('invalid').success).toBe(false);
  });

  it('NotificationChannelSchema accepts valid channels', () => {
    for (const ch of ['push', 'email', 'in_app', 'sms']) {
      expect(NotificationChannelSchema.safeParse(ch).success).toBe(true);
    }
  });

  it('NotificationPrioritySchema accepts valid priorities', () => {
    for (const p of ['critical', 'high', 'normal', 'low']) {
      expect(NotificationPrioritySchema.safeParse(p).success).toBe(true);
    }
  });

  it('CoachPersonalitySchema accepts valid personalities', () => {
    for (const p of ['supportive', 'tough', 'neutral', 'funny']) {
      expect(CoachPersonalitySchema.safeParse(p).success).toBe(true);
    }
  });

  it('CoachFrequencySchema accepts valid frequencies', () => {
    for (const f of ['minimal', 'moderate', 'frequent', 'constant']) {
      expect(CoachFrequencySchema.safeParse(f).success).toBe(true);
    }
  });

  it('ThemeModeSchema accepts valid themes', () => {
    for (const t of ['light', 'dark', 'system']) {
      expect(ThemeModeSchema.safeParse(t).success).toBe(true);
    }
    expect(ThemeModeSchema.safeParse('high-contrast').success).toBe(false);
  });

  it('DataRetentionPolicySchema accepts valid policies', () => {
    for (const p of ['minimal', 'standard', 'comprehensive', 'forever']) {
      expect(DataRetentionPolicySchema.safeParse(p).success).toBe(true);
    }
  });

  it('ExportFormatSchema accepts valid formats', () => {
    for (const f of ['json', 'csv', 'pdf']) {
      expect(ExportFormatSchema.safeParse(f).success).toBe(true);
    }
  });

  it('SyncStatusSchema accepts valid statuses', () => {
    for (const s of ['idle', 'syncing', 'error', 'conflict']) {
      expect(SyncStatusSchema.safeParse(s).success).toBe(true);
    }
  });
});

describe('core-schemas', () => {
  it('SettingRowSchema validates correct DB row shape', () => {
    const result = SettingRowSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440010',
      user_id: 'user-1',
      key: 'general.language',
      value: 'en',
      category: 'general',
      is_default: true,
      last_modified: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  it('AppearanceSettingsSchema validates correct shape', () => {
    const result = AppearanceSettingsSchema.safeParse({
      userId: '550e8400-e29b-41d4-a716-446655440020',
      theme: 'system',
      accentColor: '#6366f1',
      fontScale: 1,
      useSystemFont: true,
      reduceMotion: false,
      highContrast: false,
      compactMode: false,
    });
    expect(result.success).toBe(true);
  });

  it('AppearanceSettingsSchema rejects invalid hex color', () => {
    const result = AppearanceSettingsSchema.safeParse({
      userId: '550e8400-e29b-41d4-a716-446655440020',
      theme: 'system',
      accentColor: 'red',
      fontScale: 1,
      useSystemFont: true,
      reduceMotion: false,
      highContrast: false,
      compactMode: false,
    });
    expect(result.success).toBe(false);
  });

  it('PrivacySettingsSchema validates correct shape', () => {
    const result = PrivacySettingsSchema.safeParse({
      userId: '550e8400-e29b-41d4-a716-446655440020',
      profileVisibility: 'friends',
      showOnlineStatus: true,
      showActivityStatus: true,
      allowDataAnalysis: true,
      allowPersonalization: true,
      thirdPartySharing: false,
      analyticsOptOut: false,
    });
    expect(result.success).toBe(true);
  });

  it('DataControlSettingsSchema validates correct shape', () => {
    const result = DataControlSettingsSchema.safeParse({
      userId: '550e8400-e29b-41d4-a716-446655440020',
      retentionPolicy: 'standard',
      autoExport: { enabled: false, frequency: 'never', format: 'json' },
      backupEnabled: true,
    });
    expect(result.success).toBe(true);
  });

  it('SyncStateSchema validates correct shape', () => {
    const result = SyncStateSchema.safeParse({
      userId: '550e8400-e29b-41d4-a716-446655440020',
      status: 'idle',
      lastSyncAttempt: Date.now(),
      pendingChanges: 0,
      conflicts: [],
    });
    expect(result.success).toBe(true);
  });
});
