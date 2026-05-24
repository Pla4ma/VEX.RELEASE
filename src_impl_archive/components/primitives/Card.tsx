import React, { forwardRef } from 'react';
import {
  Pressable,
  View,
  type AccessibilityRole,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../theme';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost' | 'premium' | 'glass';
export type CardSize = 'sm' | 'md' | 'lg';
export type CardState = 'default' | 'loading' | 'disabled' | 'error' | 'success';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  state?: CardState;
  interactive?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Card = forwardRef<View, CardProps>(({
  children,
  variant = 'default',
  size = 'md',
  state = 'default',
  interactive = false,
  onPress,
  onLongPress,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityState,
}, ref) => {
  const { theme } = useTheme();
  const pressed = useSharedValue(0);
  const semantic = theme.colors.semantic;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: state === 'disabled' ? 0.62 : interpolate(pressed.value, [0, 1], [1, 0.94]),
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.99]) }],
  }));

  const variantStyles: Record<CardVariant, ViewStyle> = {
    default: {
      backgroundColor: semantic.surface,
      borderColor: semantic.border,
      borderWidth: 1,
    },
    elevated: {
      backgroundColor: semantic.surfaceElevated,
      borderColor: semantic.border,
      borderWidth: 1,
      elevation: 8,
      shadowColor: semantic.shadow,
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.22,
      shadowRadius: 28,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: semantic.borderStrong,
      borderWidth: 1,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    glass: {
      backgroundColor: semantic.surfaceGlass,
      borderColor: semantic.border,
      borderWidth: 1,
    },
    premium: {
      backgroundColor: semantic.surfaceElevated,
      borderColor: semantic.primary,
      borderWidth: 1,
      elevation: 10,
      shadowColor: semantic.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.28,
      shadowRadius: 24,
    },
  };

  const sizeStyles: Record<CardSize, ViewStyle> = {
    sm: { borderRadius: theme.borderRadius.lg, padding: theme.spacing[3] },
    md: { borderRadius: theme.borderRadius.xl, padding: theme.spacing[4] },
    lg: { borderRadius: theme.borderRadius['2xl'], padding: theme.spacing[5] },
  };

  const stateStyles: Record<CardState, ViewStyle> = {
    default: {},
    loading: { opacity: 0.72 },
    disabled: { opacity: 0.62 },
    error: { borderColor: semantic.danger, borderWidth: 1 },
    success: { borderColor: semantic.success, borderWidth: 1 },
  };
  const combined = [{ overflow: 'hidden' as const }, variantStyles[variant], sizeStyles[size], stateStyles[state], style];

  if (interactive && onPress) {
    return (
      <AnimatedPressable
        ref={ref}
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityState={{ ...accessibilityState, disabled: state === 'disabled' }}
        disabled={state === 'disabled'}
        onLongPress={onLongPress}
        onPress={onPress}
        onPressIn={() => { pressed.value = withSpring(1, { damping: 16, stiffness: 360 }); }}
        onPressOut={() => { pressed.value = withSpring(0, { damping: 16, stiffness: 360 }); }}
        style={[combined, animatedStyle]}
        testID={testID}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View
      ref={ref}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      style={combined}
      testID={testID}
    >
      {children}
    </View>
  );
});

Card.displayName = 'Card';

export function CardHeader({ children, action, style }: { children: React.ReactNode; action?: React.ReactNode; style?: StyleProp<ViewStyle> }): JSX.Element {
  return (
    <View style={[{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }, style]}>
      <View style={{ flex: 1 }}>{children}</View>
      {action ? <View style={{ marginLeft: 8 }}>{action}</View> : null}
    </View>
  );
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }): JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={[{ borderTopColor: theme.colors.semantic.border, borderTopWidth: 1, paddingTop: 12, marginTop: 12 }, style]}>
      {children}
    </View>
  );
}

