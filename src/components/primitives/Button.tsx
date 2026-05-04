/**
 * Button Component
 *
 * Interactive button primitive with theme-aware styling.
 */

import React, { type ReactNode, useCallback } from 'react';
import { ActivityIndicator, Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '../../theme';
import { Text } from './Text';
import { buttonTap, triggerHaptic } from '../../utils/haptics';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { SpacingValue } from './types';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'small';

  /** Full width button */
  fullWidth?: boolean;

  /** Loading state */
  isLoading?: boolean;

  /** Disabled state */
  isDisabled?: boolean;

  /** Left icon */
  leftIcon?: ReactNode;

  /** Right icon */
  rightIcon?: ReactNode;

  /** Haptic feedback */
  haptic?: 'none' | 'light' | 'medium' | 'success' | 'warning';

  /** Button content */
  children: ReactNode;

  /** Additional styles */
  style?: StyleProp<ViewStyle>;

  /** Spacing */
  mt?: SpacingValue;
  mb?: SpacingValue;
  ml?: SpacingValue;
  mr?: SpacingValue;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  haptic = 'medium',
  children,
  style,
  mt,
  mb,
  ml,
  mr,
  ...props
}: ButtonProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const { colors, spacing } = theme;
  const scale = useSharedValue(1);
  const defaultAccessibilityLabel =
    typeof children === 'string' ? `${children} button` : 'Action button';

  // Size configurations
  const sizeConfigs = {
    sm: { paddingVertical: spacing[2], paddingHorizontal: spacing[3], fontSize: 14 },
    small: { paddingVertical: spacing[2], paddingHorizontal: spacing[3], fontSize: 14 },
    md: { paddingVertical: spacing[3], paddingHorizontal: spacing[4], fontSize: 16 },
    lg: { paddingVertical: spacing[4], paddingHorizontal: spacing[6], fontSize: 18 },
  };

  const sizeConfig = sizeConfigs[size];

  const resolveSpacing = (value: SpacingValue | undefined): number | undefined => {
    if (value === undefined) {return undefined;}
    if (typeof value === 'number') {return value;}
    const spacingKey = value === 'xs' ? 1 : value === 'sm' ? 2 : value === 'md' ? 3 : value === 'lg' ? 4 : value === 'xl' ? 6 : value === '2xl' ? 8 : value === '3xl' ? 12 : value;
    return spacing[spacingKey as keyof typeof spacing];
  };

  // Variant styles
  const getVariantStyles = (pressed: boolean): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      opacity: isDisabled ? 0.5 : 1,
      width: fullWidth ? '100%' : undefined,
      paddingVertical: sizeConfig.paddingVertical,
      paddingHorizontal: sizeConfig.paddingHorizontal,
    };

    switch (variant) {
      case 'primary':
        return {
          ...base,
          backgroundColor: pressed ? colors.primary[600] : colors.primary[500],
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: pressed ? colors.background.tertiary : colors.background.secondary,
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: pressed ? colors.background.secondary : 'transparent',
          borderWidth: 2,
          borderColor: colors.primary[500],
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: pressed ? colors.background.secondary : 'transparent',
        };
      case 'danger':
        return {
          ...base,
          backgroundColor: pressed ? colors.error.dark : colors.error.DEFAULT,
        };
      default:
        return base;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return 'text.inverse';
      case 'outline':
        return 'primary.500';
      default:
        return 'text.primary';
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    async (event: GestureResponderEvent) => {
      scale.value = isReducedMotion ? 1 : withSpring(0.95, { damping: 15, stiffness: 400 });
      // Trigger button tap haptic on press in
      if (haptic !== 'none') {
        await buttonTap();
      }
      props.onPressIn?.(event);
    },
    [haptic, isReducedMotion, props, scale]
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = isReducedMotion ? 1 : withSpring(1, { damping: 12, stiffness: 200 });
      props.onPressOut?.(event);
    },
    [isReducedMotion, props, scale]
  );

  const handlePress = useCallback(
    async (event: GestureResponderEvent) => {
      if (variant === 'primary') {
        await triggerHaptic(haptic === 'warning' ? 'warning' : haptic === 'success' ? 'success' : haptic === 'light' ? 'impactLight' : 'impactMedium');
      } else if (haptic !== 'none') {
        await triggerHaptic(haptic === 'warning' ? 'warning' : haptic === 'success' ? 'success' : 'impactLight');
      }

      props.onPress?.(event);
    },
    [haptic, props, variant]
  );

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityHint="Activates this control"
        accessibilityLabel={defaultAccessibilityLabel}
        accessibilityRole="button"
        {...props}
        style={({ pressed }) => [
          getVariantStyles(pressed),
          { opacity: pressed ? 0.75 : isDisabled ? 0.5 : 1 },
          {
            marginTop: resolveSpacing(mt),
            marginBottom: resolveSpacing(mb),
            marginLeft: resolveSpacing(ml),
            marginRight: resolveSpacing(mr),
          },
          style,
        ]}
        disabled={isDisabled || isLoading}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}

      >
        {isLoading ? (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'danger' ? colors.text.inverse : colors.primary[500]}
          />
        ) : (
          <>
            {leftIcon}
            {typeof children === 'string' ? (
              <Text
                variant="body"
                fontSize={sizeConfig.fontSize}
                fontWeight="600"
                color={getTextColor()}
                ml={leftIcon ? 'sm' : undefined}
                mr={rightIcon ? 'sm' : undefined}
              >
                {children}
              </Text>
            ) : (
              children
            )}
            {rightIcon}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
