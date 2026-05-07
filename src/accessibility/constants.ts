/**
 * Accessibility Constants
 *
 * Default values and configurations for accessibility features.
 */

import { AccessibilityPreferences, ColorBlindPalette } from './types';

export const DEFAULT_ACCESSIBILITY: AccessibilityPreferences = {
  screenReaderOptimized: false,
  announcementsEnabled: true,
  reducedMotion: false,
  animationsEnabled: true,
  highContrast: false,
  colorBlindMode: "none",
  textScale: 1.0,
  boldText: false,
  simplifiedUI: false,
  extendedTimeouts: false,
  switchControl: false,
  voiceControl: false,
};

export const COLOR_BLIND_PALETTES: Record<string, ColorBlindPalette> = {
  protanopia: {
    name: "Protanopia",
    description: "Red-blind friendly palette",
    colors: {
      primary: "#0066CC",
      secondary: "#00AA66",
      accent: "#FF6600",
      background: "#FFFFFF",
      text: "#000000",
    },
  },
  deuteranopia: {
    name: "Deuteranopia", 
    description: "Green-blind friendly palette",
    colors: {
      primary: "#0066CC",
      secondary: "#FF6600",
      accent: "#AA00AA",
      background: "#FFFFFF",
      text: "#000000",
    },
  },
  tritanopia: {
    name: "Tritanopia",
    description: "Blue-blind friendly palette", 
    colors: {
      primary: "#CC0066",
      secondary: "#FF6600",
      accent: "#00AA66",
      background: "#FFFFFF",
      text: "#000000",
    },
  },
  achromatopsia: {
    name: "Achromatopsia",
    description: "Complete color blindness palette",
    colors: {
      primary: "#333333",
      secondary: "#666666",
      accent: "#999999",
      background: "#FFFFFF",
      text: "#000000",
    },
  },
};