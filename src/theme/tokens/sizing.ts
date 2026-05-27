/**
 * Sizing Tokens
 *
 * Standardized sizing values for components and layouts.
 */

/**
 * Base sizing unit
 */
export const SIZING_UNIT = 4;

/**
 * Width/height scale
 */
export const sizing = {
  // Fixed widths
  width: {
    xs: 80,
    sm: 120,
    md: 160,
    lg: 240,
    xl: 320,
    "2xl": 400,
    full: "100%",
  },

  // Heights
  height: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
    "2xl": 64,
  },

  // Icon sizes
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    "2xl": 48,
    "3xl": 64,
  },

  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    "2xl": 96,
  },

  // Touch target sizes (minimum)
  touchTarget: {
    min: 44,
    comfortable: 48,
  },

  // Container widths
  container: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },

  // Screen dimensions reference
  screen: {
    minHeight: 568,
    small: 667,
    medium: 812,
    large: 896,
    xlarge: 1024,
  },
};

/**
 * Get icon size
 */
export function getIconSize(size: keyof typeof sizing.icon): number {
  return sizing.icon[size] ?? sizing.icon.md;
}

/**
 * Get avatar size
 */
export function getAvatarSize(size: keyof typeof sizing.avatar): number {
  return sizing.avatar[size] ?? sizing.avatar.md;
}
