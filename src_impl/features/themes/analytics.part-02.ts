import { capture } from '../../shared/analytics/analytics-service';

export function trackThemeCustomized(
  userId: string,
  themeId: string,
  customizationType: 'color' | 'typography' | 'spacing' | 'component' | 'layout',
  customizedAt: Date,
  changes: {
    property: string;
    previousValue: unknown;
    newValue: unknown;
    scope: string;
  }[],
  context: {
    component: string;
    section: string;
    device: string;
  },
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  },
  preview: {
    applied: boolean;
    satisfaction: number;
    iterations: number;
  }
): void {
  capture('themes_customized', {
    user_id: userId,
    theme_id: themeId,
    customization_type: customizationType,
    customized_at: customizedAt.toISOString(),
    changes,
    context,
    validation,
    preview,
  });
}

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

// ============================================================================
// AUTO-SWITCH ANALYTICS
// ============================================================================

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

