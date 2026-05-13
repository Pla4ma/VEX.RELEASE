import { eventBus } from "../events";


export function generateAccessibleLabel(element: { type: string; text?: string; icon?: string; state?: string; progress?: number; action?: string }): string {
  const parts: string[] = [];

  if (element.type) {
    parts.push(element.type);
  }
  if (element.text) {
    parts.push(element.text);
  }
  if (element.state) {
    parts.push(`, ${element.state}`);
  }
  if (element.progress !== undefined) {
    parts.push(`, ${Math.round(element.progress)}% complete`);
  }
  if (element.action) {
    parts.push(`, double tap to ${element.action}`);
  }

  return parts.join('');
}

export function getAnimationConfig(baseDuration: number, reducedMotion: boolean): AnimationConfig {
  if (reducedMotion) {
    return {
      duration: 0, // Instant transitions
      easing: 'linear',
      useReducedMotion: true,
    };
  }

  return {
    duration: baseDuration,
    easing: 'ease-in-out',
    useReducedMotion: false,
  };
}

export function getAnimationStyles(animation: 'fade' | 'slide' | 'scale' | 'none', reducedMotion: boolean): Record<string, string | number> {
  if (reducedMotion || animation === 'none') {
    return {
      transition: 'none',
      animation: 'none',
    };
  }

  const configs: Record<string, Record<string, string | number>> = {
    fade: {
      transition: 'opacity 300ms ease-in-out',
    },
    slide: {
      transition: 'transform 300ms ease-in-out',
    },
    scale: {
      transition: 'transform 300ms ease-in-out, opacity 300ms ease-in-out',
    },
  };

  return configs[animation] || configs.fade;
}

export function calculateScaledFontSize(baseSize: number, scale: number): number {
  // Cap at 2x to prevent layout breaks
  const cappedScale = Math.min(scale, 2.0);
  return Math.round(baseSize * cappedScale);
}

export function getScaledTypography(scale: number): Record<string, { fontSize: number; lineHeight: number }> {
  const baseSizes = {
    h1: { fontSize: 32, lineHeight: 40 },
    h2: { fontSize: 24, lineHeight: 32 },
    h3: { fontSize: 20, lineHeight: 28 },
    body: { fontSize: 16, lineHeight: 24 },
    small: { fontSize: 14, lineHeight: 20 },
    caption: { fontSize: 12, lineHeight: 16 },
  };

  const scaled: Record<string, { fontSize: number; lineHeight: number }> = {};

  for (const [key, value] of Object.entries(baseSizes)) {
    scaled[key] = {
      fontSize: calculateScaledFontSize(value.fontSize, scale),
      lineHeight: calculateScaledFontSize(value.lineHeight, scale),
    };
  }

  return scaled;
}

export function registerFocusableElement(screenId: string, element: FocusableElement): void {
  const elements = focusableElements.get(screenId) || [];
  elements.push(element);
  elements.sort((a, b) => a.order - b.order);
  focusableElements.set(screenId, elements);
}

export function getNextFocusableElement(screenId: string, currentId: string): FocusableElement | null {
  const elements = focusableElements.get(screenId) || [];
  const currentIndex = elements.findIndex((e) => e.id === currentId);

  if (currentIndex === -1) {
    return elements[0] || null;
  }
  return elements[currentIndex + 1] || elements[0] || null;
}

export function getPreviousFocusableElement(screenId: string, currentId: string): FocusableElement | null {
  const elements = focusableElements.get(screenId) || [];
  const currentIndex = elements.findIndex((e) => e.id === currentId);

  if (currentIndex === -1) {
    return elements[elements.length - 1] || null;
  }
  return elements[currentIndex - 1] || elements[elements.length - 1] || null;
}

export function getAccessibilityPreferences(userId: string): AccessibilityPreferences {
  return userPreferences.get(userId) || { ...DEFAULT_ACCESSIBILITY };
}

export function updateAccessibilityPreferences(userId: string, updates: Partial<AccessibilityPreferences>): AccessibilityPreferences {
  const current = getAccessibilityPreferences(userId);
  const updated = { ...current, ...updates };
  userPreferences.set(userId, updated);

  eventBus.publish('accessibility:preferences_changed', {
    userId,
    preferences: updated,
    changes: Object.keys(updates),
  });

  return updated;
}

export function detectSystemAccessibility(): Partial<AccessibilityPreferences> {
  // In React Native, this would use AccessibilityInfo API
  // For now, return defaults
  return {
    screenReaderOptimized: false,
    reducedMotion: false,
    boldText: false,
  };
}

export function auditScreen(
  screenId: string,
  elements: Array<{
    id: string;
    type: string;
    label?: string;
    color?: string;
    backgroundColor?: string;
    touchSize?: { width: number; height: number };
  }>,
): AccessibilityAudit {
  const issues: AccessibilityIssue[] = [];

  for (const element of elements) {
    // Check contrast
    if (element.color && element.backgroundColor) {
      const contrast = calculateContrastRatio(element.color, element.backgroundColor);
      if (contrast < 4.5) {
        issues.push({
          id: `contrast-${element.id}`,
          type: 'contrast',
          severity: 'error',
          element: element.id,
          message: `Contrast ratio ${contrast.toFixed(2)} is below WCAG AA (4.5)`,
          suggestion: getAccessibleAlternatives(element.color, element.backgroundColor, 4.5)[0] ? `Try color: ${getAccessibleAlternatives(element.color, element.backgroundColor, 4.5)[0]}` : 'Use a darker foreground or lighter background',
        });
      }
    }

    // Check touch target size
    if (element.touchSize) {
      const minSize = 44; // WCAG minimum touch target
      if (element.touchSize.width < minSize || element.touchSize.height < minSize) {
        issues.push({
          id: `touch-${element.id}`,
          type: 'touch_target',
          severity: 'warning',
          element: element.id,
          message: `Touch target ${element.touchSize.width}x${element.touchSize.height} is below recommended ${minSize}x${minSize}`,
          suggestion: 'Increase touch target to at least 44x44 points',
        });
      }
    }

    // Check labels
    if (!element.label && ['button', 'link', 'input'].includes(element.type)) {
      issues.push({
        id: `label-${element.id}`,
        type: 'label',
        severity: 'error',
        element: element.id,
        message: 'Interactive element missing accessible label',
        suggestion: 'Add an accessibleLabel or aria-label attribute',
      });
    }
  }

  // Calculate score (100 - 10 per error, 5 per warning)
  const score = Math.max(0, 100 - issues.filter((i) => i.severity === 'error').length * 10 - issues.filter((i) => i.severity === 'warning').length * 5);

  return {
    screenId,
    timestamp: Date.now(),
    issues,
    score,
  };
}