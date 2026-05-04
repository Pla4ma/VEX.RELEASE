/**
 * Text Component
 *
 * Typography primitive with theme-aware styling.
 */

import React, { type ReactNode } from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle, type StyleProp } from 'react-native';

import { useTheme } from '../../theme';
import type { SpacingValue, ColorValue } from './types';

/**
 * Text variant
 */
export type TextVariant =
  | 'hero'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'display'
  | 'heading'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'button';

/**
 * Text props
 */
export interface TextProps extends Omit<RNTextProps, 'style'> {
  /** Text variant */
  variant?: TextVariant;

  /** Override variant styles */
  fontSize?: TextStyle['fontSize'];
  fontWeight?: TextStyle['fontWeight'];
  weight?: TextStyle['fontWeight'];
  lineHeight?: TextStyle['lineHeight'];
  letterSpacing?: TextStyle['letterSpacing'];
  textAlign?: TextStyle['textAlign'];
  textTransform?: TextStyle['textTransform'];
  textDecorationLine?: TextStyle['textDecorationLine'];
  fontStyle?: TextStyle['fontStyle'];

  /** Colors */
  color?: ColorValue;
  flex?: TextStyle['flex'];
  opacity?: TextStyle['opacity'];

  /** Spacing - margin */
  m?: SpacingValue;
  mt?: SpacingValue;
  mr?: SpacingValue;
  mb?: SpacingValue;
  ml?: SpacingValue;
  mx?: SpacingValue;
  my?: SpacingValue;

  /** Spacing - padding */
  p?: SpacingValue;
  pt?: SpacingValue;
  pr?: SpacingValue;
  pb?: SpacingValue;
  pl?: SpacingValue;
  px?: SpacingValue;
  py?: SpacingValue;

  /** Number of lines */
  numberOfLines?: number;

  /** Truncation mode */
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';

  /** Children */
  children?: ReactNode;

  /** Additional styles */
  style?: StyleProp<TextStyle>;
}

/**
 * Resolve spacing value
 */
function resolveSpacing(value: SpacingValue | undefined, theme: ReturnType<typeof useTheme>['theme'] | { spacing: Record<string, number> }): number | undefined {
  if (value === undefined) {return undefined;}
  if (typeof value === 'number') {return value;}
  if (typeof value === 'string' && value in theme.spacing) {
    return theme.spacing[value as keyof typeof theme.spacing];
  }
  return undefined;
}

/**
 * Get typography styles for variant
 */
function getVariantStyles(variant: TextVariant, theme: ReturnType<typeof useTheme>['theme']): TextStyle {
  const { typography, fontWeights } = theme;

  switch (variant) {
    case 'hero':
    case 'display':
      return {
        fontSize: typography.display.large.fontSize,
        fontWeight: fontWeights.heavy,
        lineHeight: typography.display.large.lineHeight,
        letterSpacing: typography.display.large.letterSpacing,
      };
    case 'h1':
      return {
        fontSize: typography.heading.h1.fontSize,
        fontWeight: fontWeights.heavy,
        lineHeight: typography.heading.h1.lineHeight,
        letterSpacing: typography.heading.h1.letterSpacing,
      };
    case 'h2':
      return {
        fontSize: typography.heading.h2.fontSize,
        fontWeight: fontWeights.heavy,
        lineHeight: typography.heading.h2.lineHeight,
        letterSpacing: typography.heading.h2.letterSpacing,
      };
    case 'h3':
      return {
        fontSize: typography.heading.h3.fontSize,
        fontWeight: fontWeights.heavy,
        lineHeight: typography.heading.h3.lineHeight,
        letterSpacing: typography.heading.h3.letterSpacing,
      };
    case 'h4':
    case 'h5':
    case 'heading':
    case 'heading3':
    case 'heading4':
      return {
        fontSize: typography.heading.h4.fontSize,
        fontWeight: fontWeights.semibold,
        lineHeight: typography.heading.h4.lineHeight,
        letterSpacing: typography.heading.h4.letterSpacing,
      };
    case 'bodyLarge':
      return {
        fontSize: typography.body.large.fontSize,
        fontWeight: fontWeights.regular,
        lineHeight: typography.body.large.lineHeight,
        letterSpacing: typography.body.large.letterSpacing,
      };
    case 'body':
      return {
        fontSize: typography.body.medium.fontSize,
        fontWeight: fontWeights.regular,
        lineHeight: typography.body.medium.lineHeight,
        letterSpacing: typography.body.medium.letterSpacing,
      };
    case 'bodySmall':
      return {
        fontSize: typography.body.small.fontSize,
        fontWeight: fontWeights.regular,
        lineHeight: typography.body.small.lineHeight,
        letterSpacing: typography.body.small.letterSpacing,
      };
    case 'caption':
      return {
        fontSize: typography.ui.caption.fontSize,
        fontWeight: fontWeights.semibold,
        lineHeight: typography.ui.caption.lineHeight,
        letterSpacing: typography.ui.caption.letterSpacing,
      };
    case 'label':
    case 'button':
      return {
        fontSize: typography.ui.label.fontSize,
        fontWeight: fontWeights.semibold,
        lineHeight: typography.ui.label.lineHeight,
        letterSpacing: typography.ui.label.letterSpacing,
        textTransform: typography.ui.label.textTransform,
      };
    default:
      return {
        fontSize: typography.body.medium.fontSize,
        fontWeight: fontWeights.regular,
        lineHeight: typography.body.medium.lineHeight,
      };
  }
}

/**
 * Text component
 */
export function Text({
  variant = 'body',
  fontSize,
  fontWeight,
  weight,
  lineHeight,
  letterSpacing,
  textAlign,
  textTransform,
  textDecorationLine,
  fontStyle,
  color,
  flex,
  opacity,
  m,
  mt,
  mr,
  mb,
  ml,
  mx,
  my,
  p,
  pt,
  pr,
  pb,
  pl,
  px,
  py,
  numberOfLines,
  ellipsizeMode,
  children,
  style,
  ...props
}: TextProps): JSX.Element {
  const { theme } = useTheme();
  const { fontWeights } = theme;

  const variantStyles = getVariantStyles(variant, theme);

  const textStyle: TextStyle = {
    // Variant styles (overridable)
    fontSize: fontSize ?? variantStyles.fontSize,
    fontWeight: fontWeight ?? weight ?? variantStyles.fontWeight,
    lineHeight: lineHeight ?? variantStyles.lineHeight,
    letterSpacing: letterSpacing ?? variantStyles.letterSpacing,

    // Additional styles
    textAlign,
    textTransform: textTransform ?? variantStyles.textTransform,
    textDecorationLine,
    fontStyle,
    color: color ?? theme.colors.text.primary,
    flex,
    opacity,

    // Margin
    margin: resolveSpacing(m, theme),
    marginTop: resolveSpacing(mt, theme) ?? resolveSpacing(my, theme),
    marginRight: resolveSpacing(mr, theme) ?? resolveSpacing(mx, theme),
    marginBottom: resolveSpacing(mb, theme) ?? resolveSpacing(my, theme),
    marginLeft: resolveSpacing(ml, theme) ?? resolveSpacing(mx, theme),

    // Padding
    padding: resolveSpacing(p, theme),
    paddingTop: resolveSpacing(pt, theme) ?? resolveSpacing(py, theme),
    paddingRight: resolveSpacing(pr, theme) ?? resolveSpacing(px, theme),
    paddingBottom: resolveSpacing(pb, theme) ?? resolveSpacing(py, theme),
    paddingLeft: resolveSpacing(pl, theme) ?? resolveSpacing(px, theme),
  };

  return (
    <RNText
      style={[textStyle, style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      {...props}
    >
      {children}
    </RNText>
  );
}

/**
 * Create a text variant component
 */
export function createTextVariant(variant: TextVariant, defaultProps?: Partial<TextProps>) {
  return function TextVariant(props: TextProps): JSX.Element {
    return <Text variant={variant} {...defaultProps} {...props} />;
  };
}
