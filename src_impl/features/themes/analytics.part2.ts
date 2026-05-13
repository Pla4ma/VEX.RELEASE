import { capture } from "../../shared/analytics/analytics-service";


export function trackThemeCustomizationSaved(
  userId: string,
  themeId: string,
  savedAt: Date,
  saveType: 'variant' | 'preset' | 'profile' | 'backup',
  customization: {
    name: string;
    description: string;
    scope: string[];
    changes: Record<string, unknown>;
  },
  sharing: {
    public: boolean;
    shareable: boolean;
    permissions: string[];
  },
  version: {
    number: number;
    parent: string;
    branch: string;
  }
): void {
  capture('themes_customization_saved', {
    user_id: userId,
    theme_id: themeId,
    saved_at: savedAt.toISOString(),
    save_type: saveType,
    customization,
    sharing,
    version,
  });
}

export function trackThemeCustomizationShared(
  userId: string,
  customizationId: string,
  sharedAt: Date,
  sharingType: 'public' | 'private' | 'community' | 'team',
  platform: string,
  audience: {
    type: string;
    recipients?: string[];
    permissions: string[];
  },
  content: {
    name: string;
    description: string;
    preview: string;
    download: boolean;
  },
  engagement: {
    views: number;
    downloads: number;
    likes: number;
    comments: number;
  }
): void {
  capture('themes_customization_shared', {
    user_id: userId,
    customization_id: customizationId,
    shared_at: sharedAt.toISOString(),
    sharing_type: sharingType,
    platform,
    audience,
    content,
    engagement,
  });
}

export function trackThemeAutoSwitchTriggered(
  userId: string,
  fromThemeId: string,
  toThemeId: string,
  triggeredAt: Date,
  triggerType: 'time' | 'location' | 'battery' | 'ambient_light' | 'system',
  triggerCondition: {
    type: string;
    value: unknown;
    threshold: number;
    operator: string;
  },
  context: {
    timeOfDay: string;
    location: string;
    environment: string;
    userActivity: string;
  },
  decision: {
    confidence: number;
    alternatives: string[];
    userOverride: boolean;
  }
): void {
  capture('themes_auto_switch_triggered', {
    user_id: userId,
    from_theme_id: fromThemeId,
    to_theme_id: toThemeId,
    triggered_at: triggeredAt.toISOString(),
    trigger_type: triggerType,
    trigger_condition: triggerCondition,
    context,
    decision,
  });
}

export function trackThemeAutoSwitchSettingsUpdated(
  userId: string,
  settings: {
    enabled: boolean;
    triggers: {
      type: string;
      enabled: boolean;
      conditions: Record<string, unknown>;
    }[];
    schedule: {
      type: string;
      lightTheme: string;
      darkTheme: string;
      times: string[];
      timezone: string;
    };
    preferences: {
      smoothTransition: boolean;
      askFirst: boolean;
      learningMode: boolean;
    };
  },
  updatedFields: string[],
  impact: {
    userExperience: string;
    batteryLife: string;
    satisfaction: string;
  }
): void {
  capture('themes_auto_switch_settings_updated', {
    user_id: userId,
    settings,
    updated_fields: updatedFields,
    impact,
  });
}

export function trackThemeAccessibilityUpdated(
  userId: string,
  accessibilityType: 'high_contrast' | 'large_text' | 'reduced_motion' | 'color_blind' | 'screen_reader',
  updatedAt: Date,
  settings: {
    enabled: boolean;
    level: number;
    customizations: Record<string, unknown>;
  },
  validation: {
    compliant: boolean;
    standards: string[];
    issues: string[];
    recommendations: string[];
  },
  impact: {
    usability: number;
    readability: number;
    navigation: number;
    satisfaction: number;
  }
): void {
  capture('themes_accessibility_updated', {
    user_id: userId,
    accessibility_type: accessibilityType,
    updated_at: updatedAt.toISOString(),
    settings,
    validation,
    impact,
  });
}