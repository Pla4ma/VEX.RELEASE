import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { motionStagger } from '../../../theme/tokens/motion';
import { VexSignalNode } from './VexSignalNode';
import { AnimatedGradientBorder } from './AnimatedGradientBorder';

const previewSteps = [
  { label: 'Start', value: 'One protected block' },
  { label: 'Protect', value: 'Focus without interruption' },
  { label: 'Return', value: 'Proof saved for tomorrow' },
] as const;

interface LoopStepProps {
  step: typeof previewSteps[number];
  index: number;
  isReducedMotion: boolean;
  staggerMs: number;
}

function LoopStep({ step, index, isReducedMotion, staggerMs }: LoopStepProps): JSX.Element {
  const labelOpacity = useSharedValue(0);
  const labelTranslateY = useSharedValue(8);

  useEffect(() => {
    if (isReducedMotion) {
      labelOpacity.value = 1;
      labelTranslateY.value = 0;
      return;
    }
    labelOpacity.value = withDelay(
      600 + index * staggerMs,
      withTiming(1, { duration: 420, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
    );
    labelTranslateY.value = withDelay(
      600 + index * staggerMs,
      withTiming(0, { duration: 420, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
    );
  }, [isReducedMotion, index, labelOpacity, labelTranslateY, staggerMs]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateY: labelTranslateY.value }],
  }));

  return (
    <Animated.View style={[{ gap: 4 }, labelStyle]}>
      <Text
        color="text.primary"
        variant="label"
        style={{ opacity: 0.95 }}
      >
        {step.label}
      </Text>
      <Text
        color="text.muted"
        variant="bodySmall"
        style={{ opacity: 0.75 }}
      >
        {step.value}
      </Text>
    </Animated.View>
  );
}

export function FocusLoopPreview(): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const pathProgress = useSharedValue(0);
  const packetY = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {
      pathProgress.value = 1;
      packetY.value = 80;
      return;
    }
    pathProgress.value = withDelay(400, withTiming(1, { duration: 900 }));
    packetY.value = withDelay(
      900,
      withRepeat(
        withTiming(80, { duration: 2000, easing: Easing.linear }),
        -1,
        false,
      ),
    );
  }, [isReducedMotion, pathProgress, packetY]);

  const lineStyle = useAnimatedStyle(() => ({
    opacity: isReducedMotion ? 1 : pathProgress.value,
    transform: [{ scaleY: isReducedMotion ? 1 : pathProgress.value }],
  }));

  const packetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: packetY.value }],
  }));

  const staggerMs = motionStagger.normal;
  const cyan = theme.colors.semantic.vexCyan;

  return (
    <AnimatedGradientBorder borderRadius={theme.borderRadius['2xl']}>
      <View
        accessibilityLabel="VEX daily loop preview"
        accessibilityRole="text"
        style={{
          backgroundColor: theme.colors.semantic.backgroundElevated,
          padding: theme.spacing[6],
          gap: theme.spacing[5],
        }}
      >
        <Text
          color="semantic.vexCyan"
          variant="label"
          letterSpacing={2}
          style={{ opacity: 0.9 }}
        >
          THE FOCUS LOOP
        </Text>

        <Text color="text.primary" variant="h3" style={{ lineHeight: 30 }}>
          One protected block{'\n'}becomes progress you can trust.
        </Text>

        {/* Vertical path with nodes */}
        <View style={{ flexDirection: 'row', gap: theme.spacing[4] }}>
          {/* Node column */}
          <View style={{ alignItems: 'center', width: 20 }}>
            {previewSteps.map((_, i) => (
              <View
                key={`node-${i}`}
                style={{ marginVertical: theme.spacing[1] }}
              >
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
                  backgroundColor: cyan,
                  left: 9,
                  opacity: 0.2,
                  transformOrigin: 'top',
                },
                lineStyle,
              ]}
            />
            {/* Traveling packet */}
            {!isReducedMotion && (
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: 21,
                    left: 6,
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: cyan,
                    shadowColor: cyan,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 8,
                  },
                  packetStyle,
                ]}
              />
            )}
          </View>

          {/* Labels column */}
          <View
            style={{
              flex: 1,
              gap: theme.spacing[3],
              justifyContent: 'space-between',
            }}
          >
            {previewSteps.map((step, i) => (
              <LoopStep
                key={step.label}
                step={step}
                index={i}
                isReducedMotion={isReducedMotion}
                staggerMs={staggerMs}
              />
            ))}
          </View>
        </View>
      </View>
    </AnimatedGradientBorder>
  );
}

export default FocusLoopPreview;
