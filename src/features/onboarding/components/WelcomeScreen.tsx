/**
 * WelcomeScreen Component
 *
 * First onboarding screen. Bold headline, 3-line value prop, single CTA.
 * Premium dark visual with custom VEX focus mark.
 *
 * @phase 2.2
 */

import React from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { VexFocusMark } from '../../../screens/auth/components/VexFocusMark';

interface WelcomeScreenProps {
  onStart: () => void;
}

/**
 * Animated gradient background orbs
 */
function AnimatedBackground(): JSX.Element {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();

  const orb1 = useAnimatedStyle(() => ({
    transform: [
      {
        scale: isReducedMotion
          ? 1
          : withRepeat(withTiming(1.06, { duration: 10000 }), -1, true),
      },
    ],
    opacity: 0.2,
  }));

  const orb2 = useAnimatedStyle(() => ({
    transform: [
      {
        scale: isReducedMotion
          ? 1
          : withRepeat(withTiming(1.04, { duration: 14000 }), -1, true),
      },
    ],
    opacity: 0.85,
  }));

  return (
    <>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: width * 0.8,
            height: width * 0.8,
            borderRadius: (width * 0.8) / 2,
            backgroundColor: `${theme.colors.semantic.vexCyan}18`,
            top: -width * 0.2,
            right: -width * 0.2,
          },
          orb1,
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: width * 0.6,
            height: width * 0.6,
            borderRadius: (width * 0.6) / 2,
            backgroundColor: `${theme.colors.semantic.vexCyan}10`,
            bottom: height * 0.1,
            left: -width * 0.2,
          },
          orb2,
        ]}
        pointerEvents="none"
      />
    </>
  );
}

/**
 * Welcome screen component
 */
export function WelcomeScreen({ onStart }: WelcomeScreenProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();

  return (
    <Box flex={1} bg="background.primary">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Content */}
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        px="xl"
        gap="xl"
      >
        {/* Custom VEX Focus Mark */}
        <Animated.View entering={isReducedMotion ? undefined : FadeIn.duration(600).delay(200)}>
          <VexFocusMark size={140} />
        </Animated.View>

        {/* Core Identity Sentence */}
        <Animated.View
          entering={isReducedMotion ? undefined : FadeInUp.duration(500).delay(400)}
          style={{ width: '100%' }}
        >
          <Box alignItems="center" gap="md">
            <Text
              variant="hero"
              color="text.primary"
              textAlign="center"
              fontWeight="800"
            >
              VEX changes based{'\n'}on how you work.
            </Text>
          </Box>
        </Animated.View>

        {/* Value Prop */}
        <Animated.View
          entering={isReducedMotion ? undefined : FadeInUp.duration(500).delay(600)}
          style={{ width: '100%' }}
        >
          <Box alignItems="center" gap="sm">
            <Text variant="bodyLarge" color="text.secondary" textAlign="center">
              Answer a few questions, start one focused session, and VEX unlocks
              the system your brain needs.
            </Text>
          </Box>
        </Animated.View>

        {/* Spacer */}
        <Box flex={1} minHeight={40} />

        {/* CTA Button */}
        <Animated.View
          entering={isReducedMotion ? undefined : FadeInUp.duration(500).delay(800)}
          style={{ width: '100%' }}
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={onStart}
            accessibilityLabel="Get started"
            accessibilityRole="button"
            accessibilityHint="Double tap to select"
          >
            Enter VEX
          </Button>
        </Animated.View>
      </Box>
    </Box>
  );
}

export default WelcomeScreen;
