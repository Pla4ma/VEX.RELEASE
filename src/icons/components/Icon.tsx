/**
 * Icon Component
 *
 * Main icon component that renders SVG icons from the registry.
 */

import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

import { useTheme } from '../../theme/ThemeContext';
import { getIcon } from '../IconRegistry';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('icons:component');
import {
  type IconProps,
  ICON_SIZE_VALUES,
  ICON_STROKE_WIDTH_VALUES,
  type IconSize,
  type IconStrokeWidth,
  type IconVariant,
} from '../types';

/**
 * Icon component
 */
export function Icon({
  name,
  size = 'md',
  color = 'current',
  variant = 'outline',
  strokeWidth = 'normal',
  animated = false,
  animation,
  style,
  testID,
  accessibilityLabel,
  ...svgProps
}: IconProps): React.ReactNode | null {
  const { theme } = useTheme();

  // Get icon data from registry
  const iconData = useMemo(() => getIcon(name), [name]);

  // Calculate size
  const iconSize = useMemo(() => {
    return typeof size === 'number' ? size : ICON_SIZE_VALUES[size as IconSize];
  }, [size]);

  // Calculate stroke width
  const iconStrokeWidth = useMemo(() => {
    if (typeof strokeWidth === 'number') {
      return strokeWidth;
    }
    return ICON_STROKE_WIDTH_VALUES[strokeWidth as IconStrokeWidth];
  }, [strokeWidth]);

  // Resolve color
  const iconColor = useMemo(() => {
    if (color === 'current') {
      return theme.colors.text.primary;
    }

    if (color.startsWith('#') || color.startsWith('rgb')) {
      return color;
    }

    // Map semantic colors
    switch (color) {
      case 'primary':
        return theme.colors.primary[500];
      case 'secondary':
        return theme.colors.text.secondary;
      case 'tertiary':
        return theme.colors.text.tertiary;
      case 'success':
        return theme.colors.success.DEFAULT;
      case 'warning':
        return theme.colors.warning.DEFAULT;
      case 'error':
        return theme.colors.error.DEFAULT;
      case 'info':
        return theme.colors.info.DEFAULT;
      case 'inverse':
        return theme.colors.text.inverse;
      default:
        return theme.colors.text.primary;
    }
  }, [color, theme]);

  // Get path data based on variant
  const pathData = useMemo(() => {
    if (!iconData) {
      return null;
    }

    switch (variant) {
      case 'solid':
        return iconData.solid || iconData.outline;
      case 'mini':
        return iconData.mini || iconData.outline;
      case 'outline':
      default:
        return iconData.outline;
    }
  }, [iconData, variant]);

  // Handle animation styles
  const _animatedStyle = useMemo(() => {
    if (!animated) {
      return {};
    }

    // Animation would be applied via reanimated here
    // This is a placeholder for the actual animation implementation
    return {};
  }, [animated]);

  // Render null if icon not found
  if (!iconData || !pathData) {
    if (__DEV__) {
      debug.warn(`Icon "${name}" not found in registry`);
    }
    return null;
  }

  return (
    <View
      style={[{ width: iconSize, height: iconSize }, style]}
      testID={testID}
    >
      <Svg
        width={iconSize}
        height={iconSize}
        viewBox={iconData.viewBox || '0 0 24 24'}
        fill={variant === 'solid' ? iconColor : 'none'}
        stroke={variant === 'outline' ? iconColor : 'none'}
        strokeWidth={variant === 'outline' ? iconStrokeWidth : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
        accessibilityLabel={accessibilityLabel || `${name} icon`}
        {...svgProps}
      >
        {variant === 'solid' ? (
          <Path d={pathData} />
        ) : (
          <G>
            {pathData.split(' M').map((path, index) => {
              const d = index === 0 ? path : `M${path}`;
              return <Path key={d} d={d} />;
            })}
          </G>
        )}
      </Svg>
    </View>
  );
}

/**
 * Create an icon component for a specific icon
 */
export function createIcon(name: string, defaultProps?: Partial<IconProps>) {
  return function NamedIcon(props: Omit<IconProps, 'name'>): React.ReactNode {
    return <Icon name={name} {...defaultProps} {...props} />;
  };
}
