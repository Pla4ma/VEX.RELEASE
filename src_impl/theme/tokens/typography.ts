/**
 * Typography Tokens
 *
 * Complete typography system with font sizes, weights, line heights,
 * and letter spacing for the VEX application.
 */

import type { TextStyle } from 'react-native';
import type { TypographyScale, FontFamilies, FontWeights } from '../types';

/**
 * Font families used in the app
 */
export const fontFamilies: FontFamilies = {
  primary: 'Inter',
  secondary: 'Inter',
  mono: 'JetBrains Mono',
};

/**
 * Font weights
 */
export const fontWeights: FontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
};

/**
 * Base typography styles
 */
const baseTextStyle: TextStyle = {
  fontFamily: fontFamilies.primary,
  fontWeight: fontWeights.regular,
  color: '#0F172A',
};

/**
 * Display typography scale
 */
export const displayTypography: TypographyScale['display'] = {
  large: {
    ...baseTextStyle,
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -0.5,
    fontWeight: fontWeights.heavy,
  },
  medium: {
    ...baseTextStyle,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.5,
    fontWeight: fontWeights.heavy,
  },
  small: {
    ...baseTextStyle,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
    fontWeight: fontWeights.heavy,
  },
};

/**
 * Heading typography scale
 */
export const headingTypography: TypographyScale['heading'] = {
  h1: {
    ...baseTextStyle,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
    fontWeight: fontWeights.heavy,
  },
  h2: {
    ...baseTextStyle,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
    fontWeight: fontWeights.heavy,
  },
  h3: {
    ...baseTextStyle,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.2,
    fontWeight: fontWeights.heavy,
  },
  h4: {
    ...baseTextStyle,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontWeight: fontWeights.semibold,
  },
  h5: {
    ...baseTextStyle,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.05,
    fontWeight: fontWeights.semibold,
  },
  h6: {
    ...baseTextStyle,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.semibold,
  },
};

/**
 * Body text typography scale
 */
export const bodyTypography: TypographyScale['body'] = {
  large: {
    ...baseTextStyle,
    fontSize: 18,
    lineHeight: 27,
    fontWeight: fontWeights.regular,
  },
  medium: {
    ...baseTextStyle,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.regular,
  },
  small: {
    ...baseTextStyle,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: fontWeights.regular,
  },
};

/**
 * UI element typography
 */
export const uiTypography: TypographyScale['ui'] = {
  button: {
    ...baseTextStyle,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.25,
  },
  label: {
    ...baseTextStyle,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.semibold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  caption: {
    ...baseTextStyle,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.4,
  },
  overline: {
    ...baseTextStyle,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
};

/**
 * Complete typography scale
 */
export const typography: TypographyScale = {
  display: displayTypography,
  heading: headingTypography,
  body: bodyTypography,
  ui: uiTypography,
};

/**
 * Get font size for a specific scale
 */
export function getFontSize(
  category: keyof TypographyScale,
  size: string
): number {
  const categoryStyles = typography[category];
  const style = categoryStyles[size as keyof typeof categoryStyles] as { fontSize?: number } | undefined;
  return style?.fontSize ?? 16;
}

/**
 * Get line height for a specific scale
 */
export function getLineHeight(
  category: keyof TypographyScale,
  size: string
): number {
  const categoryStyles = typography[category];
  const style = categoryStyles[size as keyof typeof categoryStyles] as { lineHeight?: number } | undefined;
  return style?.lineHeight ?? 24;
}
