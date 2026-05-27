/**
 * Accessibility Types
 *
 * Core accessibility interfaces and types for the VEX app.
 */

export interface AccessibilityPreferences {
  screenReaderOptimized: boolean;
  announcementsEnabled: boolean;
  reducedMotion: boolean;
  animationsEnabled: boolean;
  highContrast: boolean;
  colorBlindMode:
    | "none"
    | "protanopia"
    | "deuteranopia"
    | "tritanopia"
    | "achromatopsia";
  textScale: number;
  boldText: boolean;
  simplifiedUI: boolean;
  extendedTimeouts: boolean;
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
  priority: "polite" | "assertive";
  timestamp: number;
  delay?: number;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  reducedMotion: boolean;
  useNativeDriver?: boolean;
}

export type ColorBlindType =
  | "none"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

export interface FocusableElement {
  id: string;
  reactTag: number;
  accessible: boolean;
  focusable: boolean;
}

export type AccessibilityIssue = AccessibilityIssueBase;

export interface AccessibilityIssueBase {
  id: string;
  type:
    | "focus"
    | "label"
    | "contrast"
    | "motion"
    | "keyboard"
    | "semantic"
    | "touch"
    | "screen-reader";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  element?: FocusableElement;
  suggestion?: string;
}

export interface AccessibilityAudit {
  timestamp: number;
  issues: AccessibilityIssueBase[];
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

export interface AuditAccessibilityIssue {
  id: string;
  type: "error" | "warning" | "info";
  category:
    | "contrast"
    | "focus"
    | "keyboard"
    | "screen-reader"
    | "motion"
    | "color"
    | "semantic"
    | "touch";
  severity: "critical" | "major" | "moderate" | "minor";
  message: string;
  recommendation: string;
  element?: string;
  wcagGuideline: string;
  automated: boolean;
}

export interface AccessibilityAuditResult {
  score: number;
  issues: AuditAccessibilityIssue[];
  passedChecks: string[];
  failedChecks: string[];
  summary: { critical: number; major: number; moderate: number; minor: number };
  timestamp: number;
}

export interface ComponentAccessibilityConfig {
  componentName: string;
  requiresTesting: boolean;
  customRules?: AccessibilityRule[];
  interactiveElements?: string[];
  requiredLabels?: string[];
}

export interface AccessibilityRule {
  id: string;
  description: string;
  check: (element: AuditableComponent) => AuditAccessibilityIssue | null;
  category: AuditAccessibilityIssue["category"];
  severity: AuditAccessibilityIssue["severity"];
  wcagGuideline: string;
}
