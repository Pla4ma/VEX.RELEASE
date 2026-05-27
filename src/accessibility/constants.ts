/**
 * Accessibility Constants
 *
 * Default values and configurations for accessibility features.
 */

import { AccessibilityPreferences, ColorBlindPalette } from "./types";

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
  none: {
    name: "Default",
    description: "Default VEX palette",
    colors: {
      primary: "#0066CC",
      secondary: "#00AA66",
      success: "#00AA66",
      warning: "#FF6600",
      error: "#CC0033",
      info: "#0066CC",
      accent: "#FF6600",
      background: "#FFFFFF",
      text: "#000000",
    },
    patterns: {
      success: "solid",
      warning: "diagonal",
      error: "crosshatch",
    },
  },
  protanopia: {
    name: "Protanopia",
    description: "Red-blind friendly palette",
    colors: {
      primary: "#0066CC",
      secondary: "#00AA66",
      success: "#00AA66",
      warning: "#FF6600",
      error: "#CC0033",
      info: "#0066CC",
      accent: "#FF6600",
      background: "#FFFFFF",
      text: "#000000",
    },
    patterns: {
      success: "solid",
      warning: "diagonal",
      error: "crosshatch",
    },
  },
  deuteranopia: {
    name: "Deuteranopia",
    description: "Green-blind friendly palette",
    colors: {
      primary: "#0066CC",
      secondary: "#FF6600",
      success: "#0066CC",
      warning: "#FF6600",
      error: "#AA00AA",
      info: "#0066CC",
      accent: "#AA00AA",
      background: "#FFFFFF",
      text: "#000000",
    },
    patterns: {
      success: "solid",
      warning: "diagonal",
      error: "crosshatch",
    },
  },
  tritanopia: {
    name: "Tritanopia",
    description: "Blue-blind friendly palette",
    colors: {
      primary: "#CC0066",
      secondary: "#FF6600",
      success: "#00AA66",
      warning: "#FF6600",
      error: "#CC0066",
      info: "#CC0066",
      accent: "#00AA66",
      background: "#FFFFFF",
      text: "#000000",
    },
    patterns: {
      success: "solid",
      warning: "diagonal",
      error: "crosshatch",
    },
  },
  achromatopsia: {
    name: "Achromatopsia",
    description: "Complete color blindness palette",
    colors: {
      primary: "#333333",
      secondary: "#666666",
      success: "#333333",
      warning: "#666666",
      error: "#000000",
      info: "#333333",
      accent: "#999999",
      background: "#FFFFFF",
      text: "#000000",
    },
    patterns: {
      success: "solid",
      warning: "diagonal",
      error: "crosshatch",
    },
  },
};
