/**
 * Themes Feature Analytics
 *
 * Comprehensive analytics tracking for UI themes, visual customization, and user experience personalization features.
 */

import { capture } from '../../shared/analytics/analytics-service';

// ============================================================================
// THEME LIFECYCLE ANALYTICS
// ============================================================================

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
    customizations: Record<string, any>;
    overrides: Record<string, any>;
    preferences: Record<string, any>;
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
  previousState: Record<string, any>,
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

// ============================================================================
// CUSTOMIZATION ANALYTICS
// ============================================================================

export function trackThemeCustomized(
  userId: string,
  themeId: string,
  customizationType: 'color' | 'typography' | 'spacing' | 'component' | 'layout',
  customizedAt: Date,
  changes: {
    property: string;
    previousValue: any;
    newValue: any;
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
    changes: Record<string, any>;
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
    value: any;
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
      conditions: Record<string, any>;
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

// ============================================================================
// ACCESSIBILITY ANALYTICS
// ============================================================================

export function trackThemeAccessibilityUpdated(
  userId: string,
  accessibilityType: 'high_contrast' | 'large_text' | 'reduced_motion' | 'color_blind' | 'screen_reader',
  updatedAt: Date,
  settings: {
    enabled: boolean;
    level: number;
    customizations: Record<string, any>;
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

export function trackThemeAccessibilityTested(
  userId: string,
  testedAt: Date,
  testType: 'automated' | 'manual' | 'user_feedback' | 'expert_review',
  results: {
    overall: number;
    categories: {
      color: number;
      typography: number;
      layout: number;
      navigation: number;
      content: number;
    };
    issues: {
      critical: string[];
      major: string[];
      minor: string[];
      suggestions: string[];
    };
  },
  compliance: {
    wcag: string[];
    section508: boolean;
    local: string[];
  },
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  }
): void {
  capture('themes_accessibility_tested', {
    user_id: userId,
    tested_at: testedAt.toISOString(),
    test_type: testType,
    results,
    compliance,
    recommendations,
  });
}

// ============================================================================
// PERFORMANCE ANALYTICS
// ============================================================================

export function trackThemePerformanceOptimized(
  userId: string,
  optimizationType: 'loading' | 'rendering' | 'memory' | 'battery' | 'network',
  optimizedAt: Date,
  metrics: {
    before: {
      loadTime: number;
      renderTime: number;
      memoryUsage: number;
      bundleSize: number;
    };
    after: {
      loadTime: number;
      renderTime: number;
      memoryUsage: number;
      bundleSize: number;
    };
    improvement: {
      loadTime: number;
      renderTime: number;
      memoryUsage: number;
      bundleSize: number;
    };
  },
  optimizations: {
    technique: string;
    impact: number;
    description: string;
  }[],
  tradeoffs: {
    quality: number;
    features: string[];
    compatibility: string[];
  }
): void {
  capture('themes_performance_optimized', {
    user_id: userId,
    optimization_type: optimizationType,
    optimized_at: optimizedAt.toISOString(),
    metrics,
    optimizations,
    tradeoffs,
  });
}

export function trackThemePerformanceMonitored(
  userId: string,
  monitoredAt: Date,
  metrics: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    cpuUsage: number;
    batteryImpact: number;
    networkUsage: number;
  },
  context: {
    device: string;
    browser: string;
    connection: string;
    conditions: string[];
  },
  alerts: {
    type: string;
    threshold: number;
    current: number;
    severity: string;
  }[],
  trends: {
    metric: string;
    direction: 'up' | 'down' | 'stable';
    significance: string;
  }[]
): void {
  capture('themes_performance_monitored', {
    user_id: userId,
    monitored_at: monitoredAt.toISOString(),
    metrics,
    context,
    alerts,
    trends,
  });
}

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

export function trackThemesDashboardViewed(
  userId: string,
  dashboardType: 'overview' | 'theme_detail' | 'customizations' | 'accessibility' | 'performance',
  filters: {
    timeframe: string;
    themeType: string[];
    device: string[];
  },
  interactions: {
    viewDuration: number;
    interactions: string[];
    exports: string[];
    shares: string[];
  },
  context: {
    device: string;
    location?: string;
    role: string;
  }
): void {
  capture('themes_dashboard_viewed', {
    user_id: userId,
    dashboard_type: dashboardType,
    filters,
    interactions,
    context,
  });
}

// ============================================================================
// USER PROPERTIES
// ============================================================================

export function trackThemesUserProperties(
  userId: string,
  userProperties: {
    currentTheme: string;
    themeSwitches: number;
    customizations: number;
    accessibilityEnabled: boolean;
    autoSwitchEnabled: boolean;
    preferredThemeType: string;
    customizationComplexity: string;
    performancePriority: string;
    lastThemeChange?: Date;
    totalThemes: number;
    sharedCustomizations: number;
  }
): void {
  capture('themes_user_properties', {
    user_id: userId,
    current_theme: userProperties.currentTheme,
    theme_switches: userProperties.themeSwitches,
    customizations: userProperties.customizations,
    accessibility_enabled: userProperties.accessibilityEnabled,
    auto_switch_enabled: userProperties.autoSwitchEnabled,
    preferred_theme_type: userProperties.preferredThemeType,
    customization_complexity: userProperties.customizationComplexity,
    performance_priority: userProperties.performancePriority,
    last_theme_change: userProperties.lastThemeChange?.toISOString(),
    total_themes: userProperties.totalThemes,
    shared_customizations: userProperties.sharedCustomizations,
  });
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

export function trackThemesError(
  userId: string,
  errorType: 'loading_error' | 'rendering_error' | 'customization_error' | 'system_error',
  errorCode: string,
  errorMessage: string,
  context: {
    service: string;
    operation: string;
    userId: string;
    themeId?: string;
    component?: string;
  }
): void {
  capture('themes_error', {
    user_id: userId,
    error_type: errorType,
    error_code: errorCode,
    error_message: errorMessage,
    error_context: context,
  });
}

// ============================================================================
// FUNNEL ANALYTICS
// ============================================================================

export function trackThemesFunnel(
  userId: string,
  step: 'theme_applied' | 'first_customization' | 'accessibility_enabled' | 'auto_switch_configured' | 'theme_shared' | 'expert_user'
): void {
  capture('themes_funnel', {
    user_id: userId,
    funnel_step: step,
  });
}
