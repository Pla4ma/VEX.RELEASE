import { capture } from '../../shared/analytics/analytics-service';

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

