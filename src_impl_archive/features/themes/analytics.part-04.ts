import { capture } from '../../shared/analytics/analytics-service';

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
