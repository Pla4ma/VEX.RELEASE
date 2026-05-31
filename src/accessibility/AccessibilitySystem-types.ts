export interface AccessibilityPreferences {
  screenReaderOptimized: boolean;
  announcementsEnabled: boolean;
  reducedMotion: boolean;
  animationsEnabled: boolean;
  highContrast: boolean;
  colorBlindMode:
    | 'none'
    | 'protanopia'
    | 'deuteranopia'
    | 'tritanopia'
    | 'achromatopsia';
  textScale: number;
  boldText: boolean;
  simplifiedUI: boolean;
  extendedTimeouts: boolean;
  switchControl: boolean;
  voiceControl: boolean;
}

export interface ContrastCheck {
  foreground: string;
  background: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
}

export type ColorBlindType =
  | 'none'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia';

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
  patterns: { success: string; warning: string; error: string };
}

export interface ScreenReaderAnnouncement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
  timestamp: number;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  useReducedMotion: boolean;
}

export interface FocusableElement {
  id: string;
  type:
    | 'button'
    | 'link'
    | 'input'
    | 'checkbox'
    | 'radio'
    | 'select'
    | 'heading';
  label: string;
  order: number;
}

export interface AccessibilityAudit {
  screenId: string;
  timestamp: number;
  issues: AccessibilityIssue[];
  score: number;
}

export interface AccessibilityIssue {
  id: string;
  type: 'contrast' | 'label' | 'touch_target' | 'heading' | 'focus';
  severity: 'error' | 'warning';
  element: string;
  message: string;
  suggestion: string;
}
