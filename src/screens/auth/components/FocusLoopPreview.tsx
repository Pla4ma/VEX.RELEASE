import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { motionStagger } from '../../../theme/tokens/motion';
import { VexSignalNode } from './VexSignalNode';

const previewSteps = [
  { label: 'Start', value: 'One protected block' },
  { label: 'Protect', value: 'Focus without interruption' },
  { label: 'Return', value: 'Proof saved for tomorrow' },
] as const;

export function FocusLoopPreview(): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const pathProgress = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) return;
    pathProgress.value = withDelay(300, withTiming(1, { duration: 900 }));
  }, [isReducedMotion, pathProgress]);

  const lineStyle = useAnimatedStyle(() => ({
    opacity: isReducedMotion ? 1 : pathProgress.value,
    transform: [{ scaleY: isReducedMotion ? 1 : pathProgress.value }],
  }));

  const staggerMs = motionStagger.tight;

  return (
    <View
      accessibilityLabel="VEX daily loop preview"
      accessibilityRole="text"
      style={{
        backgroundColor: theme.colors.semantic.surfaceGlass,
        borderColor: theme.colors.semantic.border,
        borderRadius: theme.borderRadius['2xl'],
        borderWidth: 1,
        padding: theme.spacing[5],
        gap: theme.spacing[4],
      }}
    >
      <Text color="vexCyan" variant="label" letterSpacing={1}>
        THE FOCUS LOOP
      </Text>
      <Text color="text.primary" variant="h3">
        One protected block becomes progress you can trust.
      </Text>

      {/* Vertical path with nodes */}
      <View style={{ flexDirection: 'row', gap: theme.spacing[4] }}>
        {/* Node column */}
        <View style={{ alignItems: 'center', width: 20 }}>
          {previewSteps.map((_, i) => (
            <View key={`node-${i}`} style={{ marginVertical: theme.spacing[1] }}>
              <VexSignalNode active index={i} />
            </View>
          ))}
          {/* Connecting line */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 24,
                bottom: 24,
                width: 1.5,
                backgroundColor: theme.colors.semantic.vexCyan,
                left: 9,
                opacity: 0.3,
                transformOrigin: 'top',
              },
              lineStyle,
            ]}
          />
        </View>

        {/* Labels column */}
        <View style={{ flex: 1, gap: theme.spacing[3], justifyContent: 'space-between' }}>
          {previewSteps.map((step, i) => {
            const entering = isReducedMotion
              ? undefined
              : FadeInDown.duration(420).delay(200 + i * staggerMs);
            return (
              <Animated.View
                key={step.label}
                entering={entering}
                style={{ gap: theme.spacing[1] }}
              >
                <Text color="text.primary" variant="label">
                  {step.label}
                </Text>
                <Text color="text.secondary" variant="bodySmall">
                  {step.value}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default FocusLoopPreview;
