/**
 * VEX Brand Tokens
 *
 * Core brand identity colors used across auth screens and brand elements.
 * These are theme-aware — they may shift subtly between light/dark modes.
 */

/** Brand colors for light mode */
export const brandColors = {
  /** VEX signature amber — warm gold accent (e.g. CTA glow) */
  amber: '#FFC46B',
  /** VEX signature orange — energetic brand accent */
  orange: '#FF8A24',
  /** VEX signature coral — warm error/editorial accent */
  coral: '#E89B7A',
} as const;

/** Brand colors for dark mode (may differ from light) */
export const darkBrandColors = {
  amber: '#FFC46B',
  orange: '#FF8A24',
  coral: '#E89B7A',
} as const;
