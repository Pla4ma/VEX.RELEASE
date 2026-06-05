/**
 * Shadow/Elevation Tokens
 *
 * Shadow values for iOS and elevation values for Android.
 * Provides consistent depth and elevation across the app.
 */

import type { ShadowScale } from '../types';

/**
 * iOS shadow values
 */
export const iosShadows: ShadowScale = {
  none: '0px 0px 0px rgba(0,0,0,0)',
  xs: '0px 1px 2px rgba(0,0,0,0.05)',
  sm: '0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px rgba(0,0,0,0.06)',
  DEFAULT: '0px 4px 6px rgba(0,0,0,0.1), 0px 2px 4px rgba(0,0,0,0.06)',
  md: '0px 6px 12px rgba(0,0,0,0.1), 0px 4px 6px rgba(0,0,0,0.05)',
  lg: '0px 10px 20px rgba(0,0,0,0.15), 0px 6px 8px rgba(0,0,0,0.1)',
  xl: '0px 20px 40px rgba(0,0,0,0.2), 0px 10px 15px rgba(0,0,0,0.1)',
  '2xl': '0px 25px 50px rgba(0,0,0,0.25), 0px 15px 25px rgba(0,0,0,0.15)',
  inner: 'inset 0px 2px 4px rgba(0,0,0,0.06)',
};

/**
 * Android elevation values (in DP)
 */
export const androidElevation = {
  none: 0,
  xs: 1,
  sm: 2,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  inner: 0, // No inner elevation on Android
};

/**
 * Get elevation value for Android
 */
export function getAndroidElevation(size: keyof ShadowScale): number {
  return androidElevation[size] ?? 0;
}

/**
 * Brand shadow colors for glass-morphism and glow effects.
 * Centralised source — never import hex values directly in components.
 */
export const brandShadowTokens = {
  primary: { color: '#A66BFF', radius: 20 },
  accent: { color: '#FF8A24', radius: 14 },
  glass: { color: '#FFFFFF', radius: 36 },
} as const;

/**
 * Component-specific shadow/elevation
 */
export const componentShadows = {
  // Cards
  card: {
    resting: 'sm',
    hover: 'DEFAULT',
    pressed: 'inner',
  },

  // Modals
  modal: {
    backdrop: 'none',
    container: 'lg',
  },

  // Buttons
  button: {
    resting: 'none',
    hover: 'sm',
    pressed: 'inner',
  },

  // Bottom sheets
  bottomSheet: {
    handle: 'none',
    container: 'lg',
  },

  // Floating action button
  fab: {
    resting: 'md',
    pressed: 'sm',
  },

  // Navigation
  header: {
    DEFAULT: 'sm',
  },

  tabBar: {
    DEFAULT: 'md',
  },
};
