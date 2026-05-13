import { capture } from "../../shared/analytics/analytics-service";


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