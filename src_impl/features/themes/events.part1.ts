import { ThemeEvent } from "./types";


export function createThemeAppliedEvent(
  userId: string,
  themeId: string,
  themeName: string,
  themeType: string,
  applicationType: 'system' | 'auto' | 'manual' | 'scheduled',
  context: DynamicValue,
  settings: DynamicValue,
  performance: DynamicValue
): ThemeAppliedEvent {
  return {
    id: generateEventId(),
    type: 'theme_applied',
    userId,
    timestamp: new Date(),
    data: {
      themeId,
      themeName,
      themeType,
      appliedAt: new Date(),
      applicationType,
      context,
      settings,
      performance,
    },
    metadata: createEventMetadata('themes'),
  };
}

export function createThemeCustomizedEvent(
  userId: string,
  themeId: string,
  customizationType: 'typography' | 'spacing' | 'color' | 'layout' | 'component',
  changes: DynamicValue[],
  context: DynamicValue,
  validation: DynamicValue,
  preview: DynamicValue
): ThemeCustomizedEvent {
  return {
    id: generateEventId(),
    type: 'theme_customized',
    userId,
    timestamp: new Date(),
    data: {
      themeId,
      customizationType,
      customizedAt: new Date(),
      changes,
      context,
      validation,
      preview,
    },
    metadata: createEventMetadata('themes'),
  };
}

export function createThemeAutoSwitchTriggeredEvent(
  userId: string,
  fromThemeId: string,
  toThemeId: string,
  triggerType: 'system' | 'time' | 'location' | 'battery' | 'ambient_light',
  triggerCondition: DynamicValue,
  context: DynamicValue,
  decision: DynamicValue
): ThemeAutoSwitchTriggeredEvent {
  return {
    id: generateEventId(),
    type: 'theme_auto_switch_triggered',
    userId,
    timestamp: new Date(),
    data: {
      fromThemeId,
      toThemeId,
      triggeredAt: new Date(),
      triggerType,
      triggerCondition,
      context,
      decision,
    },
    metadata: createEventMetadata('themes'),
  };
}

export function createThemeAccessibilityUpdatedEvent(
  userId: string,
  accessibilityType: 'reduced_motion' | 'high_contrast' | 'large_text' | 'color_blind' | 'screen_reader',
  settings: DynamicValue,
  validation: DynamicValue,
  impact: DynamicValue
): ThemeAccessibilityUpdatedEvent {
  return {
    id: generateEventId(),
    type: 'theme_accessibility_updated',
    userId,
    timestamp: new Date(),
    data: {
      accessibilityType,
      updatedAt: new Date(),
      settings,
      validation,
      impact,
    },
    metadata: createEventMetadata('themes'),
  };
}

export function createThemePerformanceOptimizedEvent(
  userId: string,
  optimizationType: 'loading' | 'network' | 'memory' | 'battery' | 'rendering',
  metrics: DynamicValue,
  optimizations: DynamicValue[],
  tradeoffs: DynamicValue
): ThemePerformanceOptimizedEvent {
  return {
    id: generateEventId(),
    type: 'theme_performance_optimized',
    userId,
    timestamp: new Date(),
    data: {
      optimizationType,
      optimizedAt: new Date(),
      metrics,
      optimizations,
      tradeoffs,
    },
    metadata: createEventMetadata('themes'),
  };
}

export function validateThemeEvent(event: ThemeEventType): boolean {
  if (!event.id || !event.userId || !event.timestamp) {
    return false;
  }

  if (!event.type || !event.data || !event.metadata) {
    return false;
  }

  // Add specific validation for each event type
  switch (event.type) {
    case 'theme_applied':
      return validateThemeAppliedEvent(event as ThemeAppliedEvent);
    case 'theme_customized':
      return validateThemeCustomizedEvent(event as ThemeCustomizedEvent);
    case 'theme_auto_switch_triggered':
      return validateThemeAutoSwitchTriggeredEvent(event as ThemeAutoSwitchTriggeredEvent);
    case 'theme_accessibility_updated':
      return validateThemeAccessibilityUpdatedEvent(event as ThemeAccessibilityUpdatedEvent);
    case 'theme_performance_optimized':
      return validateThemePerformanceOptimizedEvent(event as ThemePerformanceOptimizedEvent);
    default:
      return true;
  }
}

export function serializeThemeEvent(event: ThemeEventType): string {
  return JSON.stringify({
    ...event,
    timestamp: event.timestamp.toISOString(),
  });
}