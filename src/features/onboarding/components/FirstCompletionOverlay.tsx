/**
 * FirstCompletionOverlay Component
 *
 * Special onboarding overlay shown on first session completion.
 * Explains the core loop: "You just earned XP. That's how it works."
 * 3-second animation, then proceeds to normal completion screen.
 * Marks isOnboarded = true.
 *
 * @phase 2.7
 */

import React, { useEffect } from 'react';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  withRepeat,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

interface FirstCompletionOverlayProps {
  xpEarned: number;
  onComplete: () => void;
}

/**
 * Animated XP orb
 */
function XpOrb({ xp }: { xp: number }): JSX.Element {
  const { theme } = useTheme();

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withSpring(1.2, { damping: 3, stiffness: 200 }),
            withSpring(1, { damping: 3, stiffness: 200 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withSpring(0.8, { damping: 2 }),
        withSpring(0.4, { damping: 2 })
      ),
      -1,
      true
    ),
  }));

  return (
    <Box justifyContent="center" alignItems="center" height={180}>
      {/* Glow behind */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: `${theme.colors.primary[500]}40`,
          },
          glowStyle,
        ]}
      />

      {/* XP Orb */}
      <Animated.View
        style={[
          {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.colors.primary[500],
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: theme.colors.primary[500],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 10,
          },
          bounceStyle,
        ]}
      >
        <Text fontSize={36} fontWeight="800" color={theme.colors.text.inverse}>
          ✨
        </Text>
      </Animated.View>

      {/* Floating XP number */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(800)}
        style={{
          position: 'absolute',
          bottom: 10,
        }}
      >
        <Text
          variant="h2"
          color="primary.500"
          fontWeight="800"
        >
          +{xp} XP
        </Text>
      </Animated.View>
    </Box>
  );
}

/**
 * Tutorial card explaining the loop
 */
function TutorialCard(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(400)}>
      <Box
        p="xl"
        borderRadius="xl"
        bg="background.secondary"
        borderWidth={1}
        borderColor="border.light"
        alignItems="center"
        gap="lg"
      >
        {/* Explanation */}
        <Box alignItems="center" gap="sm">
          <Text
            variant="h3"
            color="text.primary"
            textAlign="center"
            fontWeight="700"
          >
            That's how it works.
          </Text>
          <Text
            variant="bodyLarge"
            color="text.secondary"
            textAlign="center"
          >
            Every session, you earn XP.
          </Text>
          <Text
            variant="body"
            color="text.tertiary"
            textAlign="center"
          >
            Build streaks. Level up. Defeat bosses.
          </Text>
        </Box>

        {/* Core loop visualization */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap="sm"
          mt="md"
        >
          <Box alignItems="center" gap="xs">
            <Text fontSize={28}>🎯</Text>
            <Text variant="caption" color="text.tertiary">Focus</Text>
          </Box>
          <Text fontSize={20} color="text.tertiary">→</Text>
          <Box alignItems="center" gap="xs">
            <Text fontSize={28}>✨</Text>
            <Text variant="caption" color="text.tertiary">Earn XP</Text>
          </Box>
          <Text fontSize={20} color="text.tertiary">→</Text>
          <Box alignItems="center" gap="xs">
            <Text fontSize={28}>🔥</Text>
            <Text variant="caption" color="text.tertiary">Level Up</Text>
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
}

/**
 * First completion overlay
 */
export function FirstCompletionOverlay({
  xpEarned,
  onComplete,
}: FirstCompletionOverlayProps): JSX.Element {
  const { theme } = useTheme();

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(400)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.background.primary,
        zIndex: 1000,
      }}
    >
      <Box flex={1} justifyContent="center" alignItems="center" px="xl" gap="xl">
        {/* Congratulations */}
        <Animated.View entering={FadeInUp.duration(500).delay(200)}>
          <Box alignItems="center" gap="sm">
            <Text variant="label" color="success.DEFAULT">
              🎉 FIRST SESSION COMPLETE!
            </Text>
          </Box>
        </Animated.View>

        {/* XP Orb */}
        <XpOrb xp={xpEarned} />

        {/* Tutorial Card */}
        <TutorialCard />

        {/* Continue hint */}
        <Animated.View
          entering={FadeIn.duration(400).delay(3000)}
          style={{ marginTop: 'auto', marginBottom: 40 }}
        >
          <Text variant="caption" color="text.tertiary">
            Continuing in a moment...
          </Text>
        </Animated.View>
      </Box>
    </Animated.View>
  );
}

export default FirstCompletionOverlay;
