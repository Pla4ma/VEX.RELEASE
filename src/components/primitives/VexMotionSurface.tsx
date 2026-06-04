import React from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { rgbaColors } from '../../theme/tokens/rgba-colors';
import { lightColors } from '@/theme/tokens/colors';

export interface VexMotionSurfaceProps extends ViewProps {
  variant?: 'glass' | 'elevated' | 'focused';
  children?: React.ReactNode;
  animated?: boolean;
  testID?: string;
}

export function VexMotionSurface({
  variant = 'elevated',
  children,
  animated = false,
  style,
  testID,
  ...rest
}: VexMotionSurfaceProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const glowIntensity = useSharedValue(0);

  const VARIANT_STYLES: Record<string, { backgroundColor: string; borderWidth: number; borderColor: string }> = {
    glass: {
      backgroundColor: rgbaColors.rgb_18_18_26_0_85 ?? 'rgba(18,18,26,0.85)',
      borderWidth: 1,
      borderColor: rgbaColors.rgb_255_255_255_0_06 ?? 'rgba(255,255,255,0.06)',
    },
    elevated: {
      backgroundColor: theme.colors.semantic.background,
      borderWidth: 1,
      borderColor: theme.colors.semantic.border,
    },
    focused: {
      backgroundColor: rgbaColors.rgb_18_18_26_0_85 ?? 'rgba(18,18,26,0.85)',
      borderWidth: 1,
      borderColor: rgbaColors.vexCyan_0_12 ?? 'rgba(0,229,255,0.12)',
    },
  };

  const base = VARIANT_STYLES[variant];
  const borderRadius = theme.spacing?.[3] ?? 12;

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated || isReducedMotion || variant !== 'focused') {
      return {};
    }
    return {
      shadowColor: lightColors.semantic.vexCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowIntensity.value,
      shadowRadius: 12,
    };
  }, [variant, isReducedMotion, animated]);

  React.useEffect(() => {
    if (animated && !isReducedMotion && variant === 'focused') {
      glowIntensity.value = withTiming(0.08, { duration: 600 });
    }
  }, [animated, isReducedMotion, variant, glowIntensity]);

  return (
    <Animated.View
      testID={testID}
      style={[
        {
          borderRadius,
          overflow: 'hidden',
          ...base,
        },
        animatedStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}
