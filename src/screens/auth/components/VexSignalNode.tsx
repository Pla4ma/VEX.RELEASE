import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface VexSignalNodeProps {
  active?: boolean;
  index: number;
}

export function VexSignalNode({ active = false, index }: VexSignalNodeProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion || !active) return;
    pulse.value = withRepeat(
      withDelay(index * 400, withTiming(1, { duration: 2000 })),
      -1,
      true,
    );
  }, [isReducedMotion, active, index, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.4 }],
    opacity: active ? 0.35 - pulse.value * 0.2 : 0,
  }));

  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      {/* Pulse ring */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: theme.colors.semantic.vexCyan,
          },
          ringStyle,
        ]}
      />
      {/* Core dot */}
      <View
        style={{
          width: active ? 10 : 6,
          height: active ? 10 : 6,
          borderRadius: active ? 5 : 3,
          backgroundColor: active
            ? theme.colors.semantic.vexCyan
            : theme.colors.text.muted,
        }}
      />
    </View>
  );
}

export default VexSignalNode;
