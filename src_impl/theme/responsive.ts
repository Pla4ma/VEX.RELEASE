/**
 * Responsive Theme Utilities
 * Mobile-first responsive design helpers
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// ============================================================================
// Device Detection
// ============================================================================

export const Device = {
  width,
  height,
  isSmall: height < 700, // iPhone SE, mini
  isMedium: height >= 700 && height < 850, // Standard iPhones
  isLarge: height >= 850, // iPhone Pro Max
  isTablet: width > 768,
  isLandscape: width > height,
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
};

// ============================================================================
// Breakpoints (Mobile-First)
// ============================================================================

export const breakpoints = {
  xs: 0,    // Small phones
  sm: 320,  // iPhone SE
  md: 375,  // Standard iPhone
  lg: 414,  // iPhone Pro Max
  xl: 768,  // Tablets
};

// ============================================================================
// Responsive Value Helper
// ============================================================================

export function responsive<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}): T {
  const { xs, sm, md, lg, xl, default: defaultValue } = values;

  if (Device.width >= breakpoints.xl && xl !== undefined) {return xl;}
  if (Device.width >= breakpoints.lg && lg !== undefined) {return lg;}
  if (Device.width >= breakpoints.md && md !== undefined) {return md;}
  if (Device.width >= breakpoints.sm && sm !== undefined) {return sm;}
  if (xs !== undefined) {return xs;}

  return defaultValue;
}

// ============================================================================
// Spacing Scale (Responsive)
// ============================================================================

export const spacing = {
  // Base spacing
  xs: responsive({ xs: 4, sm: 4, md: 4, default: 4 }),
  sm: responsive({ xs: 6, sm: 8, md: 8, default: 8 }),
  md: responsive({ xs: 10, sm: 12, md: 16, default: 16 }),
  lg: responsive({ xs: 14, sm: 16, md: 24, default: 24 }),
  xl: responsive({ xs: 20, sm: 24, md: 32, default: 32 }),
  '2xl': responsive({ xs: 28, sm: 32, md: 48, default: 48 }),

  // Screen edge padding
  screenEdge: responsive({ xs: 12, sm: 16, md: 20, default: 24 }),

  // Section spacing
  section: responsive({ xs: 20, sm: 24, md: 32, default: 40 }),

  // Card padding
  card: responsive({ xs: 12, sm: 16, md: 20, default: 24 }),

  // Touch spacing (minimum for touch targets)
  touch: 44,
  touchComfortable: 48,
};

// ============================================================================
// Typography Scale (Responsive)
// ============================================================================

export const typography = {
  h1: {
    fontSize: responsive({ xs: 28, sm: 30, md: 32, default: 36 }),
    lineHeight: responsive({ xs: 32, sm: 36, md: 40, default: 44 }),
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: responsive({ xs: 22, sm: 24, md: 26, default: 28 }),
    lineHeight: responsive({ xs: 26, sm: 28, md: 30, default: 32 }),
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: responsive({ xs: 18, sm: 20, md: 22, default: 24 }),
    lineHeight: responsive({ xs: 22, sm: 24, md: 26, default: 28 }),
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: responsive({ xs: 15, sm: 16, md: 18, default: 20 }),
    lineHeight: responsive({ xs: 19, sm: 20, md: 22, default: 24 }),
    fontWeight: '600' as const,
  },
  body: {
    fontSize: responsive({ xs: 14, sm: 14, md: 16, default: 16 }),
    lineHeight: responsive({ xs: 20, sm: 20, md: 24, default: 24 }),
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: responsive({ xs: 11, sm: 12, md: 13, default: 14 }),
    lineHeight: responsive({ xs: 14, sm: 16, md: 18, default: 18 }),
    fontWeight: '400' as const,
  },
};

// ============================================================================
// Layout Helpers
// ============================================================================

export const layout = {
  // Max content width for readability
  maxContentWidth: 480,

  // Grid columns based on screen size
  gridColumns: responsive({ xs: 1, sm: 2, md: 2, lg: 3, default: 2 }),

  // Card widths
  cardWidth: responsive({
    xs: width - 24,
    sm: (width - 40) / 2,
    md: (width - 48) / 2,
    default: 160,
  }),

  // Bottom sheet heights
  bottomSheet: {
    peek: responsive({ xs: 80, sm: 90, md: 100, default: 120 }),
    half: Math.round(height * 0.5),
    full: height - 100,
  },
};

// ============================================================================
// Accessibility Helpers
// ============================================================================

export const accessibility = {
  // Minimum touch target size
  minTouchTarget: 44,

  // Comfortable touch target
  comfortableTouchTarget: 48,

  // Minimum font size for readability
  minFontSize: 11,

  // Maximum font size to prevent overflow
  maxFontSize: 48,

  // Accessible color contrast ratio (WCAG AA)
  minContrastRatio: 4.5,
};

// ============================================================================
// Animation Durations (Respect user preferences)
// ============================================================================

export const animation = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,

  // Spring configurations
  spring: {
    gentle: { tension: 120, friction: 14 },
    normal: { tension: 300, friction: 10 },
    bouncy: { tension: 400, friction: 10 },
  },
};

// ============================================================================
// Platform-Specific Adjustments
// ============================================================================

export const platform = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',

  // Shadow elevation (Android)
  elevation: (level: number) => ({
    elevation: level,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: level / 2 },
    shadowOpacity: 0.3,
    shadowRadius: level,
  }),
};
