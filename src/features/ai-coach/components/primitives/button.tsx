import React from 'react';
import { createSheet } from '@/shared/ui/create-sheet';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
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
import { launchColors } from '@theme/tokens/launch-colors';
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
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
interface IconButtonProps extends PressableProps {
  icon: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
}
export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  ...props
}: IconButtonProps) {
  const { isReducedMotion } = useReducedMotion();
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: isReducedMotion ? 1 : withSpring(1 - pressed.value * 0.05) },
    ],
  }));
  return (
    <AnimatedPressable
      accessibilityHint="Activates the coach menu"
      accessibilityLabel="Open coach menu"
      accessibilityRole="button"
      disabled={disabled || loading}
      style={[
        styles.iconButton,
        styles[`${size}IconButton`],
        styles[`${variant}IconButton`],
        animatedStyle,
      ]}
      onPressIn={() => (pressed.value = 1)}
      onPressOut={() => (pressed.value = 0)}
      {...props}
    >
      {loading ? <ActivityIndicator size="small" /> : icon}
    </AnimatedPressable>
  );
}
const variantStyles = {
  primary: { indicatorColor: launchColors.hex_fff },
  secondary: { indicatorColor: launchColors.hex_4ecdc4 },
  outline: { indicatorColor: launchColors.hex_4ecdc4 },
  ghost: { indicatorColor: launchColors.hex_4ecdc4 },
  danger: { indicatorColor: launchColors.hex_fff },
};
const styles = createSheet({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  text: { fontWeight: '600', textAlign: 'center' },
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  smText: { fontSize: 14 },
  md: { paddingVertical: 12, paddingHorizontal: 20 },
  mdText: { fontSize: 16 },
  lg: { paddingVertical: 16, paddingHorizontal: 28 },
  lgText: { fontSize: 18 },
  primary: { backgroundColor: launchColors.hex_4ecdc4 },
  primaryText: { color: launchColors.hex_fff },
  secondary: { backgroundColor: launchColors.hex_f0fdfb },
  secondaryText: { color: launchColors.hex_4ecdc4 },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: launchColors.hex_4ecdc4,
  },
  outlineText: { color: launchColors.hex_4ecdc4 },
  ghost: { backgroundColor: 'transparent' },
  ghostText: { color: launchColors.hex_666 },
  danger: { backgroundColor: launchColors.hex_ff6b6b },
  dangerText: { color: launchColors.hex_fff },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  smIconButton: { width: 32, height: 32 },
  mdIconButton: { width: 44, height: 44 },
  lgIconButton: { width: 56, height: 56 },
  primaryIconButton: { backgroundColor: launchColors.hex_4ecdc4 },
  secondaryIconButton: { backgroundColor: launchColors.hex_f0fdfb },
  outlineIconButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: launchColors.hex_4ecdc4,
  },
  ghostIconButton: { backgroundColor: 'transparent' },
  dangerIconButton: { backgroundColor: launchColors.hex_ff6b6b },
});
