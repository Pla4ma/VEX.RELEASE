import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../../theme/ThemeContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface VexSignalNodeProps {
  active?: boolean;
  index: number;
}

export function VexSignalNode({ active = false, index }: VexSignalNodeProps): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (!active || isReducedMotion) {
      pulseScale.value = 1;
      pulseOpacity.value = 0;
      return;
    }
    pulseScale.value = withDelay(
      index * 400 + 600,
      withRepeat(
        withSpring(1.8, { damping: 12, stiffness: 180 }),
        -1,
        false,
      ),
    );
    pulseOpacity.value = withDelay(
      index * 400 + 600,
      withRepeat(
        withTiming(0, { duration: 1200 }),
        -1,
        false,
      ),
    );
    return () => {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
    };
  }, [active, index, isReducedMotion, pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View
      style={{
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: active ? 16 : 0,
            height: active ? 16 : 0,
            borderRadius: 8,
            backgroundColor: theme.colors.semantic.vexCyan,
          },
          pulseStyle,
        ]}
      />
      <View
        style={{
          width: active ? 7 : 5,
          height: active ? 7 : 5,
          borderRadius: active ? 3.5 : 2.5,
          backgroundColor: active
            ? theme.colors.semantic.vexCyan
            : theme.colors.text.muted,
          boxShadow: active ? '0px 0px 8px ' + theme.colors.semantic.vexCyan : '0px 0px 0px transparent',
        }}
      />
    </View>
  );
}

export default VexSignalNode;
