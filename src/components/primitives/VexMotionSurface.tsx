import React from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface VexMotionSurfaceProps extends ViewProps {
  variant?: 'glass' | 'elevated' | 'focused';
  children?: React.ReactNode;
  animated?: boolean;
  testID?: string;
}

const VARIANT_STYLES = {
  glass: {
    backgroundColor: 'rgba(18,18,26,0.85)' as const,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)' as const,
  },
  elevated: {
    backgroundColor: '#12121A' as const,
    borderWidth: 1,
    borderColor: '#1A1A24' as const,
  },
  focused: {
    backgroundColor: 'rgba(18,18,26,0.85)' as const,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.12)' as const,
  },
};

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

  const base = VARIANT_STYLES[variant];
  const borderRadius = theme.spacing?.[3] ?? 12;

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated || isReducedMotion || variant !== 'focused') {
      return {};
    }
    return {
      shadowColor: '#00E5FF',
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
