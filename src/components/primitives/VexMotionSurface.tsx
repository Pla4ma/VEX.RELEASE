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
import { timingPresets } from '../../theme/tokens/motion';

export interface VexMotionSurfaceProps extends ViewProps {
  variant?: 'glass' | 'elevated' | 'focused' | 'chrome';
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
}: VexMotionSurfaceProps): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const glowIntensity = useSharedValue(0);
  const glowTarget = theme.opacity[10];

  const variantStyles: Record<
    NonNullable<VexMotionSurfaceProps['variant']>,
    { backgroundColor: string; borderWidth: number; borderColor: string }
  > = {
    glass: {
      backgroundColor: rgbaColors.rgb_18_18_26_0_85,
      borderWidth: theme.spacing[0] + 1,
      borderColor: rgbaColors.rgb_255_255_255_0_06,
    },
    elevated: {
      backgroundColor: theme.colors.semantic.surfaceElevated,
      borderWidth: theme.spacing[0] + 1,
      borderColor: theme.colors.semantic.border,
    },
    focused: {
      backgroundColor: rgbaColors.rgb_18_18_26_0_85,
      borderWidth: theme.spacing[0] + 1,
      borderColor: rgbaColors.vexCyan_0_12,
    },
    chrome: {
      backgroundColor: rgbaColors.rgb_255_255_255_0_05,
      borderWidth: theme.spacing[0] + 1,
      borderColor: rgbaColors.rgb_255_255_255_0_12,
    },
  };

  const base = variantStyles[variant];
  const borderRadius = theme.borderRadius.xl;

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated || isReducedMotion) {
      return {};
    }
    return {
      boxShadow: '0px 0px theme.spacing[3]px lightColors.semantic.vexCyan / glowIntensity.value',
    };
  }, [variant, isReducedMotion, animated]);

  React.useEffect(() => {
    if (animated && !isReducedMotion) {
      glowIntensity.value = withTiming(glowTarget, {
        duration: timingPresets.cinematicReveal.duration,
      });
    }
  }, [animated, glowIntensity, glowTarget, isReducedMotion]);

  return (
    <Animated.View
      testID={testID}
      style={[
        {
          borderRadius,
          overflow: 'hidden',
          boxShadow: '0px theme.spacing[2]px theme.spacing[6]px theme.colors.semantic.shadow / variant === 'elevated' ? theme.opacity[20] : theme.opacity[10]',
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
