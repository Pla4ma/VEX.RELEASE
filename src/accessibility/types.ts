/**
 * Accessibility Types
 *
 * Core accessibility interfaces and types for the VEX app.
 */

export interface AccessibilityPreferences {
  // Screen reader
  screenReaderOptimized: boolean;
  announcementsEnabled: boolean;

  // Motion
  reducedMotion: boolean;
  animationsEnabled: boolean;

  // Visual
  highContrast: boolean;
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";
  textScale: number; // 1.0 = default, up to 2.0
  boldText: boolean;

  // Cognitive
  simplifiedUI: boolean;
  extendedTimeouts: boolean;

  // Input
  switchControl: boolean;
  voiceControl: boolean;
}

export interface ColorBlindPalette {
  name: string;
  description: string;
  colors: Record<string, string>;
}

export interface ContrastCheck {
  foreground: string;
  background: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
}

export interface ScreenReaderAnnouncement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
  timestamp: number;
  delay?: number;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  reducedMotion: boolean;
  useNativeDriver?: boolean;
}

export type ColorBlindType = "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

export interface FocusableElement {
  id: string;
  reactTag: number;
  accessible: boolean;
  focusable: boolean;
}

export interface AccessibilityIssue {
  id: string;
  type: 'focus' | 'label' | 'contrast' | 'motion' | 'keyboard' | 'semantic' | 'touch' | 'screen-reader';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  element?: FocusableElement;
  suggestion?: string;
}

export interface AccessibilityAudit {
  timestamp: number;
  issues: AccessibilityIssue[];
  score: number;
}

export interface AuditableComponentStyle {
  color?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  [key: string]: unknown;
}

export interface AuditableComponentProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessibilityHint?: string;
  onPress?: unknown;
  onLongPress?: unknown;
  animated?: boolean;
  useNativeDriver?: boolean;
  style?: AuditableComponentStyle;
  children?: unknown;
  title?: string;
  [key: string]: unknown;
}

export interface AuditableComponent {
  type?: { displayName?: string } | string;
  props?: AuditableComponentProps;
}
