import React, { type ReactNode } from 'react';
import {
  Text as RNText,
  type TextStyle,
} from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { TextVariant, TextProps } from './Text.types';
import { resolveColorValue, resolveSpacingValue } from './theme-values';

function getVariantStyles(
  variant: TextVariant,
  theme: ReturnType<typeof useTheme>['theme'],
): TextStyle {
  const { typography, fontWeights } = theme;
  const display = typography.display.large;
  const body = typography.body.medium;
  switch (variant) {
    case 'hero':
    case 'display':
      return {
        fontSize: display.fontSize,
        lineHeight: display.lineHeight,
        fontWeight: fontWeights.heavy,
      };
    case 'h1':
      return { ...typography.heading.h1, fontWeight: fontWeights.heavy };
    case 'h2':
      return { ...typography.heading.h2, fontWeight: fontWeights.heavy };
    case 'h3':
      return { ...typography.heading.h3, fontWeight: fontWeights.bold };
    case 'h4':
    case 'h5':
    case 'heading':
    case 'heading2':
    case 'heading3':
    case 'heading4':
      return { ...typography.heading.h4, fontWeight: fontWeights.semibold };
    case 'bodyLarge':
      return typography.body.large;
    case 'bodySmall':
      return typography.body.small;
    case 'caption':
      return typography.ui.caption;
    case 'label':
      return typography.ui.label;
    case 'button':
      return typography.ui.button;
    default:
      return body;
  }
}

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
}: TextProps): React.ReactNode {
  const { theme } = useTheme();

  const variantStyles = getVariantStyles(variant, theme);
  const textStyle: TextStyle = {
    fontSize: fontSize ?? variantStyles.fontSize,
    fontWeight: fontWeight ?? weight ?? variantStyles.fontWeight,
    lineHeight: lineHeight ?? variantStyles.lineHeight,
    letterSpacing: letterSpacing ?? variantStyles.letterSpacing ?? 0,
    textAlign,
    textTransform: textTransform ?? variantStyles.textTransform,
    textDecorationLine,
    fontStyle,
    color: resolveColorValue(color, theme) ?? theme.colors.text.primary,
    flex,
    opacity,
    margin: resolveSpacingValue(m, theme),
    marginTop: resolveSpacingValue(mt, theme) ?? resolveSpacingValue(my, theme),
    marginRight:
      resolveSpacingValue(mr, theme) ?? resolveSpacingValue(mx, theme),
    marginBottom:
      resolveSpacingValue(mb, theme) ?? resolveSpacingValue(my, theme),
    marginLeft:
      resolveSpacingValue(ml, theme) ?? resolveSpacingValue(mx, theme),
    padding: resolveSpacingValue(p, theme),
    paddingTop:
      resolveSpacingValue(pt, theme) ?? resolveSpacingValue(py, theme),
    paddingRight:
      resolveSpacingValue(pr, theme) ?? resolveSpacingValue(px, theme),
    paddingBottom:
      resolveSpacingValue(pb, theme) ?? resolveSpacingValue(py, theme),
    paddingLeft:
      resolveSpacingValue(pl, theme) ?? resolveSpacingValue(px, theme),
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
