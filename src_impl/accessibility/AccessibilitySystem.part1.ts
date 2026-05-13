import { eventBus } from "../events";


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

export function calculateContrastRatio(color1: string, color2: string): number {
  const luminance1 = calculateLuminance(color1);
  const luminance2 = calculateLuminance(color2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

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

export function getAccessibleColor(colorType: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info', colorBlindMode: ColorBlindType): string {
  return COLOR_BLIND_PALETTES[colorBlindMode].colors[colorType];
}

export function getStatusPattern(status: 'success' | 'warning' | 'error', colorBlindMode: ColorBlindType): string {
  return COLOR_BLIND_PALETTES[colorBlindMode].patterns[status];
}

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

export function getRecentAnnouncements(limit: number = 5): ScreenReaderAnnouncement[] {
  return announcements.slice(-limit);
}