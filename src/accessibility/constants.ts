/**
 * Accessibility Constants
 *
 * Default values and configurations for accessibility features.
 */

import { AccessibilityPreferences, ColorBlindPalette } from "./types";
import { accessibilityPalette } from "../theme/tokens/colors";

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
    type: "none",
    name: "Default",
    description: "Default VEX palette",
    colors: accessibilityPalette.neutral,
    patterns: {
      success: "solid",
      warning: "diagonal",
      error: "crosshatch",
    },
  },
  protanopia: {
    type: "protanopia",
    name: "Protanopia",
    description: "Red-blind friendly palette",
    colors: accessibilityPalette.neutral,
    patterns: {
      success: "solid",
      warning: "diagonal",
      error: "crosshatch",
    },
  },
  deuteranopia: {
    type: "deuteranopia",
    name: "Deuteranopia",
    description: "Green-blind friendly palette",
    colors: accessibilityPalette.deuteranopia,
    patterns: {
      success: "solid",
      warning: "diagonal",
      error: "crosshatch",
    },
  },
  tritanopia: {
    type: "tritanopia",
    name: "Tritanopia",
    description: "Blue-blind friendly palette",
    colors: accessibilityPalette.tritanopia,
    patterns: {
      success: "solid",
      warning: "diagonal",
      error: "crosshatch",
    },
  },
  achromatopsia: {
    type: "achromatopsia",
    name: "Achromatopsia",
    description: "Complete color blindness palette",
    colors: accessibilityPalette.achromatopsia,
    patterns: {
      success: "solid",
      warning: "diagonal",
      error: "crosshatch",
    },
  },
};
