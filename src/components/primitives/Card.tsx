import React, { forwardRef } from 'react';
import {
  Pressable,
  View,
  type AccessibilityRole,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { springPresets } from '../../theme/tokens/motion';

export type CardVariant =
  | 'default'
  | 'elevated'
  | 'outlined'
  | 'ghost'
  | 'premium'
  | 'glass'
  | 'lightGlass'
  | 'lightHero'
  | 'lightSelected'
  | 'lightSuccess';
export type CardSize = 'sm' | 'md' | 'lg';
export type CardState =
  | 'default'
  | 'loading'
  | 'disabled'
  | 'error'
  | 'success';

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

export const Card = forwardRef<View, CardProps>(
  (
    {
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
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const reducedMotion = useReducedMotion();
    const pressed = useSharedValue(0);
    const semantic = theme.colors.semantic;

    const animatedStyle = useAnimatedStyle(() => ({
      opacity:
        state === 'disabled'
          ? 0.62
          : interpolate(pressed.value, [0, 1], [1, 0.94]),
      transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.99]) }],
    }));

    const variantStyles: Record<CardVariant, ViewStyle> = {
      default: {
        backgroundColor: 'rgba(255, 255, 255, 0.58)',
        borderColor: 'rgba(255, 255, 255, 0.74)',
        borderWidth: 1,
        shadowColor: 'rgba(13, 76, 65, 0.13)',
        shadowOpacity: 0.16,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
        elevation: 5,
      },
      lightGlass: {
        backgroundColor: 'rgba(255, 255, 255, 0.58)',
        borderColor: 'rgba(255, 255, 255, 0.74)',
        borderWidth: 1,
        shadowColor: 'rgba(13, 76, 65, 0.13)',
        shadowOpacity: 0.16,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
        elevation: 5,
      },
      elevated: {
        backgroundColor: 'rgba(255, 255, 255, 0.76)',
        borderColor: 'rgba(255, 255, 255, 0.84)',
        borderWidth: 1,
        shadowColor: 'rgba(13, 76, 65, 0.22)',
        shadowOpacity: 0.2,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 16 },
        elevation: 8,
      },
      lightHero: {
        backgroundColor: 'rgba(255, 255, 255, 0.66)',
        borderColor: 'rgba(255, 255, 255, 0.78)',
        borderWidth: 1,
        shadowColor: '#0C765F',
        shadowOpacity: 0.18,
        shadowRadius: 36,
        shadowOffset: { width: 0, height: 20 },
        elevation: 10,
      },
      lightSelected: {
        backgroundColor: 'rgba(255, 255, 255, 0.78)',
        borderColor: '#42CFAE',
        borderWidth: 1.4,
        shadowColor: '#18B894',
        shadowOpacity: 0.22,
        shadowRadius: 26,
        shadowOffset: { width: 0, height: 14 },
        elevation: 8,
      },
      lightSuccess: {
        backgroundColor: 'rgba(255, 255, 255, 0.62)',
        borderColor: 'rgba(66, 207, 174, 0.45)',
        borderWidth: 1,
        shadowColor: '#18B894',
        shadowOpacity: 0.18,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
        elevation: 6,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: 'rgba(13, 76, 65, 0.18)',
        borderWidth: 1,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.58)',
        borderColor: 'rgba(255, 255, 255, 0.74)',
        borderWidth: 1,
        shadowColor: 'rgba(13, 76, 65, 0.13)',
        shadowOpacity: 0.16,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
        elevation: 5,
      },
      premium: {
        backgroundColor: 'rgba(255, 255, 255, 0.78)',
        borderColor: 'rgba(121, 223, 201, 0.7)',
        borderWidth: 1.2,
        shadowColor: '#109779',
        shadowOpacity: 0.22,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 16 },
        elevation: 10,
      },
    };

    const sizeStyles: Record<CardSize, ViewStyle> = {
      sm: { borderRadius: 20, padding: theme.spacing[3] },
      md: { borderRadius: 24, padding: theme.spacing[4] },
      lg: {
        borderRadius: 28,
        padding: theme.spacing[5],
      },
    };

    const stateStyles: Record<CardState, ViewStyle> = {
      default: {},
      loading: { opacity: 0.72 },
      disabled: { opacity: 0.62 },
      error: { borderColor: '#E05E5E', borderWidth: 1 },
      success: { borderColor: '#18B894', borderWidth: 1 },
    };
    const combined = [
      { overflow: 'hidden' as const },
      variantStyles[variant],
      sizeStyles[size],
      stateStyles[state],
      style,
    ];

    if (interactive && onPress) {
      return (
        <AnimatedPressable
          ref={ref}
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole={accessibilityRole ?? 'button'}
          accessibilityState={{
            ...accessibilityState,
            disabled: state === 'disabled',
          }}
          disabled={state === 'disabled'}
          onLongPress={onLongPress}
          onPress={onPress}
          onPressIn={() => {
            if (reducedMotion) {
              pressed.value = 1;
              return;
            }
            pressed.value = withSpring(1, springPresets.tactile);
          }}
          onPressOut={() => {
            if (reducedMotion) {
              pressed.value = 0;
              return;
            }
            pressed.value = withSpring(0, springPresets.tactile);
          }}
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
  },
);

Card.displayName = 'Card';

export { CardHeader, CardFooter } from './CardSubcomponents';
