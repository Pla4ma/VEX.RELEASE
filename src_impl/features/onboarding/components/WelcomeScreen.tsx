/**
 * WelcomeScreen Component
 *
 * First onboarding screen. Bold headline, 3-line value prop, single CTA.
 * Subtle animated background.
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

interface WelcomeScreenProps {
  onStart: () => void;
}

/**
 * Animated gradient background circles
 */
function AnimatedBackground(): JSX.Element {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();

  const circle1Style = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withTiming(1.2, { duration: 8000 }),
          -1,
          true
        ),
      },
    ],
    opacity: 0.3,
  }));

  const circle2Style = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withTiming(1.1, { duration: 10000 }),
          -1,
          true
        ),
      },
    ],
    opacity: 0.2,
  }));

  return (
    <>
      {/* Large gradient circle top-right */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: width * 0.8,
            height: width * 0.8,
            borderRadius: (width * 0.8) / 2,
            backgroundColor: `${theme.colors.primary[500]}20`,
            top: -width * 0.2,
            right: -width * 0.2,
          },
          circle1Style,
        ]}
      />

      {/* Medium gradient circle bottom-left */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: width * 0.6,
            height: width * 0.6,
            borderRadius: (width * 0.6) / 2,
            backgroundColor: `${theme.colors.accent.purple}15`,
            bottom: height * 0.1,
            left: -width * 0.2,
          },
          circle2Style,
        ]}
      />
    </>
  );
}

/**
 * Welcome screen component
 */
export function WelcomeScreen({ onStart }: WelcomeScreenProps): JSX.Element {
  const { theme } = useTheme();

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
        {/* Logo/Icon */}
        <Animated.View entering={FadeIn.duration(600).delay(200)}>
          <Box
            width={120}
            height={120}
            borderRadius="full"
            bg={`${theme.colors.primary[500]}15`}
            justifyContent="center"
            alignItems="center"
            borderWidth={2}
            borderColor={`${theme.colors.primary[500]}30`}
          >
            <Text fontSize={56}>🎯</Text>
          </Box>
        </Animated.View>

        {/* Headline */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(400)}
          style={{ width: '100%' }}
        >
          <Box alignItems="center" gap="md">
            <Text
              variant="hero"
              color="text.primary"
              textAlign="center"
              fontWeight="800"
            >
              Your Focus Score{'\n'}starts at 550
            </Text>
          </Box>
        </Animated.View>

        {/* Value Prop - 3 lines */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(600)}
          style={{ width: '100%' }}
        >
          <Box alignItems="center" gap="sm">
            <Text
              variant="bodyLarge"
              color="text.secondary"
              textAlign="center"
            >
              Every session proves your focus grows.
            </Text>
            <Text
              variant="body"
              color="text.tertiary"
              textAlign="center"
            >
              Start above average. Level up from there.
            </Text>
          </Box>
        </Animated.View>

        {/* Spacer */}
        <Box flex={1} minHeight={40} />

        {/* CTA Button */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(800)}
          style={{ width: '100%' }}
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={onStart}

          accessibilityLabel="Let's go → button"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
            Let's go →
          </Button>
        </Animated.View>
      </Box>
    </Box>
  );
}

export default WelcomeScreen;
