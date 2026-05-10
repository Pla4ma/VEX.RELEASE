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

export interface ColorBlindPalette {
  name: string;
  description: string;
  colors: Record<string, string>;
  patterns: Record<string, string>;
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
  timestamp: number;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  reducedMotion: boolean;
  useNativeDriver?: boolean;
}

<<<<<<< HEAD
export type ColorBlindType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
=======
export type ColorBlindType = "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

export interface FocusableElement {
  id: string;
  reactTag: number;
  accessible: boolean;
  focusable: boolean;
}

export interface AccessibilityIssue {
  id: string;
<<<<<<< HEAD
  type: 'focus' | 'label' | 'contrast' | 'motion' | 'screen-reader';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  element: FocusableElement;
  suggestion: string;
=======
  type: 'focus' | 'label' | 'contrast' | 'motion' | 'keyboard' | 'semantic' | 'touch' | 'screen-reader';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  element?: FocusableElement;
  suggestion?: string;
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
}

export interface AccessibilityAudit {
  timestamp: number;
  issues: AccessibilityIssue[];
  score: number;
}
<<<<<<< HEAD
=======

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
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
