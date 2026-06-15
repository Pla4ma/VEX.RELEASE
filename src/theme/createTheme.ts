/**
 * Theme Factory
 *
 * Creates complete theme objects for given mode.
 */

import type { Theme } from './types';
import { getColors, typography, fontFamilies, fontWeights } from './tokens/colors';
import { spacing } from './tokens/spacing';
import { borderRadius } from './tokens/radius';
import { iosShadows } from './tokens/shadows';
import { zIndex } from './tokens/zIndex';
import { animationDuration } from './tokens/timing';
import { opacity } from './tokens/opacity';

/**
 * Default breakpoints for responsive design
 */
const breakpoints = {
  xs: 0,
  sm: 320,
  md: 375,
  lg: 414,
  xl: 768,
  '2xl': 1024,
};

/**
 * Create a complete theme object
 *
 * @param mode - 'light' or 'dark'
 * @param highContrast - Whether to use high contrast colors
 * @returns Complete theme object
 */
export function createTheme(
  mode: 'light' | 'dark' = 'light',
  highContrast = false,
): Theme {
  return {
    name: `vex-${mode}`,
    mode,
    colors: getColors(mode, highContrast),
    typography,
    fonts: fontFamilies,
    fontWeights,
    spacing,
    borderRadius,
    shadows: iosShadows,
    zIndex,
    breakpoints,
    animation: animationDuration,
    opacity,
  };
}

/**
 * Create a light theme
 */
export function createLightTheme(highContrast = false): Theme {
  return createTheme('light', highContrast);
}

/**
 * Create a dark theme
 */
export function createDarkTheme(highContrast = false): Theme {
  return createTheme('dark', highContrast);
}

/**
 * Merge custom overrides with a base theme
 */
export function customizeTheme(
  baseTheme: Theme,
  overrides: Partial<Theme>,
): Theme {
  return {
    ...baseTheme,
    ...overrides,
    colors: {
      ...baseTheme.colors,
      ...overrides.colors,
    },
    typography: {
      ...baseTheme.typography,
      ...overrides.typography,
    },
  };
}
