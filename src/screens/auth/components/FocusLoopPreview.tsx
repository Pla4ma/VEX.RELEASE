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
import { useTheme } from '../../../theme/ThemeContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { motionStagger } from '../../../theme/tokens/motion';
import { VexSignalNode } from './VexSignalNode';
import { AnimatedGradientBorder } from './AnimatedGradientBorder';
import { previewSteps, LoopStep } from './LoopStep';

export function FocusLoopPreview(): React.ReactNode {
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
            {previewSteps.map((step, i) => (
              <View
                key={step.label}
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
                    boxShadow: '0px 0px 8px cyan / 0.8',
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
