/**
 * Theme Configuration
 *
 * Default configuration values for the theme system.
 */

import type { ThemeConfig } from "./types";

/**
 * Default theme configuration
 */
export const defaultThemeConfig: ThemeConfig = {
  defaultMode: "system",
  supportDarkMode: true,
  persistThemePreference: true,
  respectSystemPreference: true,
  transitionOnChange: true,
  transitionDuration: 300,
};

/**
 * Theme storage keys
 */
export const THEME_STORAGE_KEYS = {
  mode: "vex:theme:mode",
  config: "vex:theme:config",
  customColors: "vex:theme:customColors",
};
