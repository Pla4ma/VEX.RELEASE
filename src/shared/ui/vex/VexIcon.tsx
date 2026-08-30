import React from 'react';
import { Platform, View, type TextStyle } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import type { IconColor, IconProps, IconSize } from '../../../icons/types';
import { useTheme } from '../../../theme/ThemeContext';

const FALLBACK_GLYPHS: Record<string, string> = {
  alarm: '◌',
  book: '▤',
  chart: '▥',
  'check-circle': '✓',
  flame: '♨',
  home: '⌂',
  refresh: '↻',
  sparkles: '✦',
  target: '◎',
  user: '♙',
};

interface VexIconProps extends Pick<IconProps, 'name' | 'variant' | 'strokeWidth'> {
  color?: IconColor | string;
  size?: IconSize;
  accessibilityLabel?: string;
}

const FALLBACK_SIZES: Record<IconSize, keyof ReturnType<typeof useTheme>['theme']['spacing']> = {
  xs: 3,
  sm: 4,
  md: 5,
  lg: 6,
  xl: 8,
  '2xl': 12,
  '3xl': 16,
};

function resolveFallbackColor(color: IconColor | string, theme: ReturnType<typeof useTheme>['theme']): string {
  if (color === 'current') return theme.colors.text.primary;
  if (color === 'inverse') return theme.colors.text.inverse;
  if (color === 'primary') return theme.colors.primary[500];
  if (color === 'secondary') return theme.colors.text.secondary;
  if (color === 'tertiary') return theme.colors.text.tertiary;
  return color;
}

export function VexIcon({ name, color = 'current', size = 'md', variant = 'outline', strokeWidth, accessibilityLabel }: VexIconProps): React.JSX.Element {
  const { theme } = useTheme();
  if (Platform.OS !== 'web') {
    return <Icon accessibilityLabel={accessibilityLabel} color={color} name={name} size={size} strokeWidth={strokeWidth} variant={variant} />;
  }
  const fallbackColor = resolveFallbackColor(color, theme);
  const isSolid = variant === 'solid';
  const iconFrame = { alignItems: 'center' as const, height: theme.spacing[6], justifyContent: 'center' as const, width: theme.spacing[6] };
  const inverseColor = theme.colors.background.primary;
  if (name === 'home') {
    return (
      <View accessibilityLabel={accessibilityLabel ?? `${name} icon`} style={iconFrame}>
        <View style={{
          backgroundColor: isSolid ? fallbackColor : 'transparent',
          borderColor: fallbackColor,
          borderLeftWidth: 1,
          borderTopWidth: 1,
          height: theme.spacing[4],
          position: 'absolute',
          top: theme.spacing[1],
          transform: [{ rotate: '45deg' }],
          width: theme.spacing[4],
        }} />
        <View style={{
          backgroundColor: isSolid ? fallbackColor : 'transparent',
          borderColor: fallbackColor,
          borderWidth: 1,
          bottom: theme.spacing[1],
          height: theme.spacing[3],
          position: 'absolute',
          width: theme.spacing[5],
        }} />
        {isSolid ? <View style={{ backgroundColor: inverseColor, bottom: theme.spacing[1], height: theme.spacing[2], position: 'absolute', width: theme.spacing[1] }} /> : null}
      </View>
    );
  }
  if (name === 'bell') {
    return (
      <View accessibilityLabel={accessibilityLabel ?? `${name} icon`} style={iconFrame}>
        <View style={{ borderColor: fallbackColor, borderBottomLeftRadius: theme.borderRadius.md, borderBottomRightRadius: theme.borderRadius.md, borderTopLeftRadius: theme.borderRadius.full, borderTopRightRadius: theme.borderRadius.full, borderWidth: 1, height: theme.spacing[4], position: 'absolute', top: theme.spacing[1], width: theme.spacing[4] }} />
        <View style={{ backgroundColor: fallbackColor, bottom: theme.spacing[2], height: theme.spacing[1], position: 'absolute', width: theme.spacing[5] }} />
        <View style={{ backgroundColor: fallbackColor, borderRadius: theme.borderRadius.full, bottom: theme.spacing[1], height: theme.spacing[1], width: theme.spacing[1] }} />
      </View>
    );
  }
  if (name === 'chart') {
    const bars = [
      { height: theme.spacing[2], left: theme.spacing[2] },
      { height: theme.spacing[4], left: theme.spacing[3] },
      { height: theme.spacing[3], left: theme.spacing[4] },
    ];
    return (
      <View accessibilityLabel={accessibilityLabel ?? `${name} icon`} style={iconFrame}>
        <View style={{ backgroundColor: fallbackColor, bottom: theme.spacing[1], height: theme.spacing[1], left: theme.spacing[1], position: 'absolute', width: theme.spacing[1] }} />
        <View style={{ backgroundColor: fallbackColor, bottom: theme.spacing[1], height: theme.spacing[1], left: theme.spacing[1], position: 'absolute', width: theme.spacing[5] }} />
        {bars.map(({ height, left }, index) => (
          <View key={`bar-${index}`} style={{
            backgroundColor: fallbackColor,
            borderRadius: theme.borderRadius.xs,
            bottom: theme.spacing[2],
            height,
            left,
            position: 'absolute',
            width: theme.spacing[1],
          }} />
        ))}
      </View>
    );
  }
  if (name === 'check-circle') {
    return (
      <View accessibilityLabel={accessibilityLabel ?? `${name} icon`} style={{
        ...iconFrame,
        backgroundColor: isSolid ? fallbackColor : 'transparent',
        borderColor: fallbackColor,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
      }}>
        <Text style={{ color: isSolid ? inverseColor : fallbackColor, fontSize: theme.spacing[3], fontWeight: theme.fontWeights.bold, lineHeight: theme.spacing[3] }}>✓</Text>
      </View>
    );
  }
  if (name === 'user') {
    return (
      <View accessibilityLabel={accessibilityLabel ?? `${name} icon`} style={{
        alignItems: 'center',
        height: theme.spacing[6],
        justifyContent: 'flex-end',
        width: theme.spacing[6],
      }}>
        <View style={{
          backgroundColor: isSolid ? fallbackColor : 'transparent',
          borderColor: fallbackColor,
          borderRadius: theme.borderRadius.full,
          borderWidth: 1,
          height: theme.spacing[3],
          width: theme.spacing[3],
        }} />
        <View style={{
          backgroundColor: isSolid ? fallbackColor : 'transparent',
          borderColor: fallbackColor,
          borderBottomWidth: 0,
          borderTopLeftRadius: theme.borderRadius.full,
          borderTopRightRadius: theme.borderRadius.full,
          borderWidth: 1,
          height: theme.spacing[3],
          marginTop: theme.spacing[1],
          width: theme.spacing[6],
        }} />
      </View>
    );
  }
  const textStyle: TextStyle = {
    color: fallbackColor,
    fontFamily: theme.fonts.primary,
    fontSize: theme.spacing[FALLBACK_SIZES[size]],
    fontWeight: variant === 'solid' ? theme.fontWeights.bold : theme.fontWeights.regular,
    lineHeight: theme.spacing[FALLBACK_SIZES[size]],
    textAlign: 'center',
  };
  return <Text accessibilityLabel={accessibilityLabel ?? `${name} icon`} style={textStyle}>{FALLBACK_GLYPHS[name] ?? '·'}</Text>;
}
