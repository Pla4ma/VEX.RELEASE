/**
 * Accessibility System
 *
 * Phase 6.3 - Accessibility & Inclusivity
 * WCAG 2.1 AA compliance support:
 * - Screen reader optimization
 * - Reduced motion support
 * - Color-blind friendly palettes
 * - Text scaling support
 *
 * Dependencies:
 * - Accessibility (base hooks)
 * - Settings (user preferences)
 * - Themes (color schemes)
 */

import { eventBus } from '../events';

// ============================================================================
// Accessibility Preferences
// ============================================================================

export interface AccessibilityPreferences {
  // Screen reader
  screenReaderOptimized: boolean;
  announcementsEnabled: boolean;

  // Motion
  reducedMotion: boolean;
  animationsEnabled: boolean;

  // Visual
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  textScale: number; // 1.0 = default, up to 2.0
  boldText: boolean;

  // Cognitive
  simplifiedUI: boolean;
  extendedTimeouts: boolean;

  // Input
  switchControl: boolean;
  voiceControl: boolean;
}

export const DEFAULT_ACCESSIBILITY: AccessibilityPreferences = {
  screenReaderOptimized: false,
  announcementsEnabled: true,
  reducedMotion: false,
  animationsEnabled: true,
  highContrast: false,
  colorBlindMode: 'none',
  textScale: 1.0,
  boldText: false,
  simplifiedUI: false,
  extendedTimeouts: false,
  switchControl: false,
  voiceControl: false,
};

// ============================================================================
// WCAG 2.1 AA Compliance Checks
// ============================================================================

export interface ContrastCheck {
  foreground: string;
  background: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
}

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const luminance1 = calculateLuminance(color1);
  const luminance2 = calculateLuminance(color2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

function calculateLuminance(color: string): number {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Calculate luminance
  const [lr, lg, lb] = [r, g, b].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/**
 * Check if colors meet WCAG standards
 */
export function checkContrast(foreground: string, background: string): ContrastCheck {
  const ratio = calculateContrastRatio(foreground, background);

  return {
    foreground,
    background,
    ratio,
    passesAA: ratio >= 4.5, // WCAG AA standard for normal text
    passesAAA: ratio >= 7, // WCAG AAA standard
  };
}

/**
 * Get accessible color alternatives
 */
export function getAccessibleAlternatives(targetColor: string, backgroundColor: string, minContrast: number = 4.5): string[] {
  const alternatives: string[] = [];

  // Try lightening/darkening
  for (let i = 0; i <= 100; i += 10) {
    const lighter = adjustBrightness(targetColor, i);
    const darker = adjustBrightness(targetColor, -i);

    if (calculateContrastRatio(lighter, backgroundColor) >= minContrast) {
      alternatives.push(lighter);
    }
    if (calculateContrastRatio(darker, backgroundColor) >= minContrast) {
      alternatives.push(darker);
    }
  }

  return alternatives.slice(0, 3); // Return top 3
}

function adjustBrightness(color: string, percent: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const adjust = (c: number) => {
    const adjusted = c + (255 * percent) / 100;
    return Math.max(0, Math.min(255, Math.round(adjusted)));
  };

  const nr = adjust(r);
  const ng = adjust(g);
  const nb = adjust(b);

  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

// ============================================================================
// Color Blind Friendly Palettes
// ============================================================================

export type ColorBlindType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface ColorBlindPalette {
  type: ColorBlindType;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  patterns: {
    success: string; // Icon/shape pattern
    warning: string;
    error: string;
  };
}

export const COLOR_BLIND_PALETTES: Record<ColorBlindType, ColorBlindPalette> = {
  none: {
    type: 'none',
    name: 'Standard',
    description: 'Default color vision',
    colors: {
      primary: '#4299E1',
      secondary: '#9F7AEA',
      success: '#48BB78',
      warning: '#ED8936',
      error: '#E53E3E',
      info: '#38B2AC',
    },
    patterns: { success: '✓', warning: '⚠', error: '✕' },
  },
  protanopia: {
    type: 'protanopia',
    name: 'Protanopia (Red-Blind)',
    description: 'Cannot perceive red light',
    colors: {
      primary: '#3182CE',
      secondary: '#805AD5',
      success: '#38A169',
      warning: '#D69E2E',
      error: '#9B2C2C',
      info: '#2C7A7B',
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
  deuteranopia: {
    type: 'deuteranopia',
    name: 'Deuteranopia (Green-Blind)',
    description: 'Cannot perceive green light',
    colors: {
      primary: '#2B6CB0',
      secondary: '#6B46C1',
      success: '#276749',
      warning: '#B7791F',
      error: '#742A2A',
      info: '#234E52',
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
  tritanopia: {
    type: 'tritanopia',
    name: 'Tritanopia (Blue-Blind)',
    description: 'Cannot perceive blue light',
    colors: {
      primary: '#2C5282',
      secondary: '#553C9A',
      success: '#2F855A',
      warning: '#C05621',
      error: '#9B2C2C',
      info: '#2C7A7B',
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
  achromatopsia: {
    type: 'achromatopsia',
    name: 'Achromatopsia (Total Color Blind)',
    description: 'Cannot perceive any color',
    colors: {
      primary: '#4A5568',
      secondary: '#718096',
      success: '#2D3748',
      warning: '#A0AEC0',
      error: '#1A202C',
      info: '#718096',
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
};

/**
 * Get accessible color for current color blind mode
 */
export function getAccessibleColor(colorType: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info', colorBlindMode: ColorBlindType): string {
  return COLOR_BLIND_PALETTES[colorBlindMode].colors[colorType];
}

/**
 * Get pattern indicator for status
 */
export function getStatusPattern(status: 'success' | 'warning' | 'error', colorBlindMode: ColorBlindType): string {
  return COLOR_BLIND_PALETTES[colorBlindMode].patterns[status];
}

// ============================================================================
// Screen Reader Support
// ============================================================================

export interface ScreenReaderAnnouncement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
  timestamp: number;
}

const announcements: ScreenReaderAnnouncement[] = [];

/**
 * Announce message to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement: ScreenReaderAnnouncement = {
    id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message,
    priority,
    timestamp: Date.now(),
  };

  announcements.push(announcement);

  // Keep only last 10
  if (announcements.length > 10) {
    announcements.shift();
  }

  // Map accessibility priorities to event priorities
  const eventPriority = priority === 'assertive' ? 'high' : 'normal';
  eventBus.publish('accessibility:announce', { message, priority: eventPriority });
}

/**
 * Get recent announcements
 */
export function getRecentAnnouncements(limit: number = 5): ScreenReaderAnnouncement[] {
  return announcements.slice(-limit);
}

/**
 * Generate accessible label for UI element
 */
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

// ============================================================================
// Reduced Motion Support
// ============================================================================

export interface AnimationConfig {
  duration: number;
  easing: string;
  useReducedMotion: boolean;
}

/**
 * Get animation config respecting reduced motion preference
 */
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

/**
 * Get animation style object
 */
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

// ============================================================================
// Text Scaling
// ============================================================================

/**
 * Calculate scaled font size
 */
export function calculateScaledFontSize(baseSize: number, scale: number): number {
  // Cap at 2x to prevent layout breaks
  const cappedScale = Math.min(scale, 2.0);
  return Math.round(baseSize * cappedScale);
}

/**
 * Get scaled typography styles
 */
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

// ============================================================================
// Focus Management
// ============================================================================

export interface FocusableElement {
  id: string;
  type: 'button' | 'link' | 'input' | 'checkbox' | 'radio' | 'select' | 'heading';
  label: string;
  order: number;
}

const focusableElements = new Map<string, FocusableElement[]>();

/**
 * Register focusable element for keyboard navigation
 */
export function registerFocusableElement(screenId: string, element: FocusableElement): void {
  const elements = focusableElements.get(screenId) || [];
  elements.push(element);
  elements.sort((a, b) => a.order - b.order);
  focusableElements.set(screenId, elements);
}

/**
 * Get next focusable element
 */
export function getNextFocusableElement(screenId: string, currentId: string): FocusableElement | null {
  const elements = focusableElements.get(screenId) || [];
  const currentIndex = elements.findIndex((e) => e.id === currentId);

  if (currentIndex === -1) {
    return elements[0] || null;
  }
  return elements[currentIndex + 1] || elements[0] || null;
}

/**
 * Get previous focusable element
 */
export function getPreviousFocusableElement(screenId: string, currentId: string): FocusableElement | null {
  const elements = focusableElements.get(screenId) || [];
  const currentIndex = elements.findIndex((e) => e.id === currentId);

  if (currentIndex === -1) {
    return elements[elements.length - 1] || null;
  }
  return elements[currentIndex - 1] || elements[elements.length - 1] || null;
}

// ============================================================================
// Accessibility Preferences Management
// ============================================================================

const userPreferences = new Map<string, AccessibilityPreferences>();

/**
 * Get user accessibility preferences
 */
export function getAccessibilityPreferences(userId: string): AccessibilityPreferences {
  return userPreferences.get(userId) || { ...DEFAULT_ACCESSIBILITY };
}

/**
 * Update accessibility preferences
 */
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

/**
 * Detect system accessibility settings
 */
export function detectSystemAccessibility(): Partial<AccessibilityPreferences> {
  // In React Native, this would use AccessibilityInfo API
  // For now, return defaults
  return {
    screenReaderOptimized: false,
    reducedMotion: false,
    boldText: false,
  };
}

// ============================================================================
// Accessibility Audit
// ============================================================================

export interface AccessibilityAudit {
  screenId: string;
  timestamp: number;
  issues: AccessibilityIssue[];
  score: number; // 0-100
}

export interface AccessibilityIssue {
  id: string;
  type: 'contrast' | 'label' | 'touch_target' | 'heading' | 'focus';
  severity: 'error' | 'warning';
  element: string;
  message: string;
  suggestion: string;
}

/**
 * Run accessibility audit on screen
 */
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

// ============================================================================
// Exports (types already exported above)
// ============================================================================
