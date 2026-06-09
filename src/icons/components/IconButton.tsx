/**
 * IconButton Component
 *
 * Pressable button with an icon.
 */

import React, { useCallback } from 'react';
import { Pressable, type type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '../../theme';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Icon } from './Icon';
import type { IconButtonProps } from '../types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * IconButton component
 */
export function IconButton({
  name,
  size = 'md',
  color = 'primary',
  variant = 'outline',
  strokeWidth,
  onPress,
  disabled = false,
  style,
  hitSlop = 10,
  pressable = true,
  testID,
  accessibilityLabel,
  accessibilityHint,
  ...iconProps
}: IconButtonProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = useCallback(() => {
    if (pressable && !disabled) {
      scale.value = isReducedMotion ? 1 : withSpring(0.9);
    }
  }, [pressable, disabled, isReducedMotion, scale]);

  const handlePressOut = useCallback(() => {
    if (pressable && !disabled) {
      scale.value = isReducedMotion ? 1 : withSpring(1);
    }
  }, [pressable, disabled, isReducedMotion, scale]);

  const handlePress = useCallback(() => {
    if (!disabled && onPress) {
      onPress();
    }
  }, [disabled, onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      style={[
        {
          opacity: disabled ? theme.opacity[50] : 1,
        },
        animatedStyle,
        style as ViewStyle,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || name}
      accessibilityHint={accessibilityHint || `Activates ${name} control`}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Icon
        name={name}
        size={size}
        color={color}
        variant={variant}
        strokeWidth={strokeWidth}
        {...iconProps}
      />
    </AnimatedPressable>
  );
}

/**
 * Create an icon button for a specific icon
 */
export function createIconButton(
  name: string,
  defaultProps?: Partial<IconButtonProps>,
) {
  return function NamedIconButton(
    props: Omit<IconButtonProps, 'name'>,
  ): JSX.Element {
    return <IconButton name={name} {...defaultProps} {...props} />;
  };
}
