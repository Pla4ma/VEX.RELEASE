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
  ratio: number;
  passes: boolean;
  level: 'AA' | 'AAA';
}

export interface ScreenReaderAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  delay?: number;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  reducedMotion: boolean;
  useNativeDriver?: boolean;
}

export type ColorBlindType = "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";