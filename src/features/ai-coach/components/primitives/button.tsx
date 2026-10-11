import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { createSheet } from '@/shared/ui/create-sheet';
import {
  Pressable,
  Text,
  ActivityIndicator,
  type GestureResponderEvent,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';

import { IconButton } from './IconButton';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const variantStyles = {
  primary: { indicatorColor: vexFire.cream },
  secondary: { indicatorColor: vexFire.amber },
  outline: { indicatorColor: vexFire.amber },
  ghost: { indicatorColor: vexFire.amber },
  danger: { indicatorColor: vexFire.cream },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const { isReducedMotion } = useReducedMotion();
  const pressed = useSharedValue(0);
  const defaultAccessibilityLabel =
    typeof children === 'string' ? `${children} button` : 'Coach action button';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: isReducedMotion ? 1 : withSpring(1 - pressed.value * 0.02) },
    ],
    opacity: withTiming(disabled ? 0.5 : 1, {
      duration: isReducedMotion ? 0 : 150,
    }),
  }));

  const handlePressIn = (e: GestureResponderEvent): void => {
    pressed.value = 1;
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent): void => {
    pressed.value = 0;
    onPressOut?.(e);
  };

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityHint="Activates the coach menu"
      accessibilityLabel={defaultAccessibilityLabel}
      accessibilityRole="button"
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[styles.base, styles[variant], styles[size], animatedStyle, style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles[variant].indicatorColor}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              styles[`${variant}Text`],
              styles[`${size}Text`],
              textStyle,
            ]}
          >
            {children as string}
          </Text>
          {rightIcon}
        </>
      )}
    </AnimatedPressable>
  );
}

export { IconButton };

const styles = createSheet({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  text: { fontWeight: '600' as const, textAlign: 'center' as const },
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  smText: { fontSize: 14 },
  md: { paddingVertical: 12, paddingHorizontal: 20 },
  mdText: { fontSize: 16 },
  lg: { paddingVertical: 16, paddingHorizontal: 28 },
  lgText: { fontSize: 18 },
  primary: { backgroundColor: vexFire.amber },
  primaryText: { color: vexFire.cream },
  secondary: { backgroundColor: vexFire.panelSoft },
  secondaryText: { color: vexFire.amber },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: vexFire.amber,
  },
  outlineText: { color: vexFire.amber },
  ghost: { backgroundColor: 'transparent' },
  ghostText: { color: vexFire.textMuted },
  danger: { backgroundColor: vexFire.danger },
  dangerText: { color: vexFire.cream },
});
