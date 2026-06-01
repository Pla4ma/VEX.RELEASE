/**
 * Theme System Export
 *
 * Complete theme system for the VEX application.
 */

// Types
export * from './types';

// Tokens
export * from './tokens';

// Context and hooks
export {
  ThemeProvider,
  useTheme,
  useThemeObject,
  useIsDarkMode,
  ThemeContext,
} from './ThemeContext';

// Theme factory
export {
  createTheme,
  createLightTheme,
  createDarkTheme,
  customizeTheme,
} from './createTheme';

// Service
export {
  ThemeService,
  getThemeService,
  type ThemeChangeEvent,
} from './ThemeService';

// Config
export { defaultThemeConfig, THEME_STORAGE_KEYS } from './config';
