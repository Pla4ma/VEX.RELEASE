/**
 * Box Component
 *
 * Primitive layout component - the building block for all layouts.
 */

import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { resolveColorValue, resolveSpacingValue } from './theme-values';
import type { BoxProps } from './BoxProps';

export function Box({
  flex,
  flexDirection,
  flexWrap,
  justifyContent,
  alignItems,
  alignContent,
  alignSelf,
  margin,
  m,
  mt,
  mr,
  mb,
  ml,
  mx,
  my,
  p,
  padding,
  pt,
  pr,
  pb,
  pl,
  px,
  py,
  width,
  height,
  aspectRatio,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  position,
  top,
  right,
  bottom,
  left,
  zIndex,
  bg,
  backgroundColor,
  opacity,
  shadow,
  borderRadius,
  borderWidth,
  borderColor,
  borderLeftWidth,
  borderLeftColor,
  borderRightWidth,
  borderRightColor,
  borderTopWidth,
  borderTopColor,
  borderBottomWidth,
  borderBottomColor,
  overflow,
  children,
  style,
  ...props
}: BoxProps): React.ReactNode {
  const { theme } = useTheme();

  const boxStyle: ViewStyle = {
    // Flex
    flex,
    flexDirection,
    flexWrap,
    justifyContent,
    alignItems,
    alignContent,
    alignSelf,

    // Margin
    margin: resolveSpacingValue(m, theme) ?? resolveSpacingValue(margin, theme),
    marginTop:
      resolveSpacingValue(mt, theme) ?? resolveSpacingValue(my, theme),
    marginRight:
      resolveSpacingValue(mr, theme) ?? resolveSpacingValue(mx, theme),
    marginBottom:
      resolveSpacingValue(mb, theme) ?? resolveSpacingValue(my, theme),
    marginLeft:
      resolveSpacingValue(ml, theme) ?? resolveSpacingValue(mx, theme),

    // Padding
    padding:
      resolveSpacingValue(p, theme) ?? resolveSpacingValue(padding, theme),
    paddingTop:
      resolveSpacingValue(pt, theme) ?? resolveSpacingValue(py, theme),
    paddingRight:
      resolveSpacingValue(pr, theme) ?? resolveSpacingValue(px, theme),
    paddingBottom:
      resolveSpacingValue(pb, theme) ?? resolveSpacingValue(py, theme),
    paddingLeft:
      resolveSpacingValue(pl, theme) ?? resolveSpacingValue(px, theme),

    // Sizing
    width,
    height,
    aspectRatio,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,

    // Positioning
    position,
    top,
    right,
    bottom,
    left,
    zIndex,

    // Appearance
    backgroundColor: resolveColorValue(bg ?? backgroundColor, theme),
    opacity,
    shadowOpacity: shadow ? 0.16 : undefined,
    shadowRadius: shadow ? 12 : undefined,
    elevation: shadow ? 4 : undefined,
    borderRadius,
    borderWidth,
    borderColor: resolveColorValue(borderColor, theme),
    borderLeftWidth,
    borderLeftColor: resolveColorValue(borderLeftColor, theme),
    borderRightWidth,
    borderRightColor: resolveColorValue(borderRightColor, theme),
    borderTopWidth,
    borderTopColor: resolveColorValue(borderTopColor, theme),
    borderBottomWidth,
    borderBottomColor: resolveColorValue(borderBottomColor, theme),
    overflow,
  };

  return (
    <View style={[boxStyle, style]} {...props}>
      {children}
    </View>
  );
}


