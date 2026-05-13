import { capture } from "../../shared/analytics/analytics-service";


export function trackThemeApplied(
  userId: string,
  themeId: string,
  themeName: string,
  themeType: string,
  applicationType: 'manual' | 'auto' | 'scheduled' | 'system',
  context: {
    previousTheme?: string;
    reason: string;
    trigger: string;
  },
  settings: {
    customizations: Record<string, unknown>;
    overrides: Record<string, unknown>;
    preferences: Record<string, unknown>;
  },
  performance: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
  }
): void {
  capture('themes_applied', {
    user_id: userId,
    theme_id: themeId,
    theme_name: themeName,
    theme_type: themeType,
    application_type: applicationType,
    context,
    settings,
    performance,
  });
}

export function trackThemePreviewed(
  userId: string,
  themeId: string,
  themeName: string,
  previewType: 'full' | 'partial' | 'component' | 'color_scheme',
  previewDuration: number,
  context: {
    source: string;
    components: string[];
    sections: string[];
  },
  interactions: {
    views: number;
    modifications: number;
    comparisons: number;
    shares: number;
  },
  feedback: {
    rating?: number;
    impression: string;
    issues: string[];
  }
): void {
  capture('themes_previewed', {
    user_id: userId,
    theme_id: themeId,
    theme_name: themeName,
    preview_type: previewType,
    preview_duration: previewDuration,
    context,
    interactions,
    feedback,
  });
}

export function trackThemeSwitched(
  userId: string,
  fromThemeId: string,
  toThemeId: string,
  switchedAt: Date,
  switchType: 'manual' | 'auto' | 'scheduled' | 'system',
  reason: string,
  context: {
    timeOfDay: string;
    environment: string;
    userPreference: string;
  },
  transition: {
    method: string;
    duration: number;
    smoothness: number;
    issues: string[];
  },
  impact: {
    userSatisfaction: number;
    performance: number;
    accessibility: number;
  }
): void {
  capture('themes_switched', {
    user_id: userId,
    from_theme_id: fromThemeId,
    to_theme_id: toThemeId,
    switched_at: switchedAt.toISOString(),
    switch_type: switchType,
    reason,
    context,
    transition,
    impact,
  });
}

export function trackThemeReset(
  userId: string,
  themeId: string,
  resetType: 'full' | 'partial' | 'component' | 'setting',
  resetAt: Date,
  reason: 'user_request' | 'system_error' | 'compatibility' | 'performance',
  scope: {
    components: string[];
    settings: string[];
    customizations: string[];
  },
  previousState: Record<string, unknown>,
  impact: {
    userExperience: string;
    performance: string;
    satisfaction: string;
  }
): void {
  capture('themes_reset', {
    user_id: userId,
    theme_id: themeId,
    reset_type: resetType,
    reset_at: resetAt.toISOString(),
    reason,
    scope,
    previous_state: previousState,
    impact,
  });
}

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