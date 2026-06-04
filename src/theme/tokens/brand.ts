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
  /** VEX brand violet — rich purple (#8B5CF6) for aurora glow and gradient rims */
  violet: '#8B5CF6',
  /** VEX brand accent violet — lighter violet (#A66BFF) for aurora accent glow */
  accentViolet: '#A66BFF',
  /** VEX brand bright violet — deep violet (#6D3BFF) for aurora bright effects */
  brightViolet: '#6D3BFF',
  /** VEX brand coral pink — soft warm pink (#FF8B96) for input error highlights */
  coralPink: '#FF8B96',
} as const;

/** Brand colors for dark mode (may differ from light) */
export const darkBrandColors = {
  amber: '#FFC46B',
  orange: '#FF8A24',
  coral: '#E89B7A',
  violet: '#8B5CF6',
  accentViolet: '#A66BFF',
  brightViolet: '#6D3BFF',
  coralPink: '#FF8B96',
} as const;
