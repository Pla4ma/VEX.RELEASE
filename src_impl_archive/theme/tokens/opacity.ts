/**
 * Opacity Tokens
 *
 * Standardized opacity values for consistent transparency.
 */

/**
 * Opacity scale (percentage based)
 */
export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  80: 0.8,
  90: 0.9,
  100: 1,
};

/**
 * Semantic opacity values
 */
export const semanticOpacity = {
  disabled: opacity[50],
  pressed: opacity[80],
  hover: opacity[90],
  loading: opacity[60],
  placeholder: opacity[50],
  backdrop: opacity[50],
  scrim: opacity[60],
};

/**
 * Get opacity value
 */
export function getOpacity(key: keyof typeof opacity | keyof typeof semanticOpacity): number {
  return (opacity as Record<string, number>)[key] ??
         (semanticOpacity as Record<string, number>)[key] ??
         1;
}
