/**
 * CriticalHitBanner Component
 *
 * "⚡ CRITICAL FOCUS ⚡" banner with dramatic animation.
 * Appears before XP reveal when isCritical === true.
 * Triggers haptics + 3x XP animation.
 *
 * @phase 3B.2
 */

import React, { useEffect } from 'react';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withSpring, withSequence, withTiming, withRepeat, withDelay, interpolate } from 'react-native-reanimated';
import { triggerHapticPattern } from '../../../utils/haptics';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

export interface CriticalHitBannerProps {
  /** XP amount (will show 3x) */
  xpAmount: number;
  /** Called when reveal animation completes */
  onRevealComplete: () => void;
}

/**
 * Lightning bolt animation
 */
function LightningBolt({ delay }: { delay: number }): JSX.Element {
  const boltStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(withSequence(withDelay(delay, withTiming(1, { duration: 100 })), withTiming(0.3, { duration: 100 }), withTiming(1, { duration: 100 }), withTiming(0, { duration: 500 })), 2, false),
    transform: [
      {
        scale: withSequence(withDelay(delay, withSpring(1.5, { damping: 5 })), withTiming(1, { duration: 300 })),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
        },
        boltStyle,
      ]}
    >
      <Text fontSize={40}>⚡</Text>
    </Animated.View>
  );
}

/**
 * Energy burst effect
 */
function EnergyBurst(): JSX.Element {
  const { theme } = useTheme();

  const burstStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(3, { damping: 5, stiffness: 100 }),
      },
    ],
    opacity: withSequence(withTiming(0.8, { duration: 200 }), withTiming(0, { duration: 600 })),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: `${theme.colors.accent.purple}60`,
        },
        burstStyle,
      ]}
    />
  );
}

/**
 * Critical hit banner
 */
export function CriticalHitBanner({ xpAmount, onRevealComplete }: CriticalHitBannerProps): JSX.Element {
  const { theme } = useTheme();

  // Trigger haptics on mount
  useEffect(() => {
    const triggerHaptics = async () => {
      await triggerHapticPattern(['success', 'success'], 200);
    };
    void triggerHaptics();

    // Auto-complete after animation
    const timer = setTimeout(() => {
      onRevealComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onRevealComplete]);

  const bannerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSequence(withSpring(0.5, { damping: 10 }), withSpring(1.1, { damping: 8, stiffness: 200 }), withSpring(1, { damping: 12 })),
      },
    ],
  }));

  const tripleXStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withDelay(1500, withSequence(withSpring(1.5, { damping: 5, stiffness: 200 }), withSpring(1, { damping: 10 }))),
      },
    ],
    opacity: withDelay(1500, withTiming(1, { duration: 300 })),
  }));

  return (
    <Box flex={1} justifyContent="center" alignItems="center" px="xl">
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={[
          {
            width: '100%',
            alignItems: 'center',
          },
        ]}
      >
        {/* Lightning bolts */}
        <Box height={100} width={200} justifyContent="center" alignItems="center">
          <LightningBolt delay={0} />
          <LightningBolt delay={200} />
          <LightningBolt delay={400} />
          <EnergyBurst />
        </Box>

        {/* CRITICAL banner */}
        <Animated.View
          style={[
            {
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 16,
              backgroundColor: `${theme.colors.accent.purple}30`,
              borderWidth: 3,
              borderColor: theme.colors.accent.purple,
              alignItems: 'center',
            },
            bannerStyle,
          ]}
        >
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={28}>⚡</Text>
            <Text fontSize={28} fontWeight="900" color={theme.colors.accent.purple} letterSpacing={2}>
              CRITICAL FOCUS
            </Text>
            <Text fontSize={28}>⚡</Text>
          </Box>
        </Animated.View>

        {/* 3x XP reveal */}
        <Animated.View
          style={[
            {
              marginTop: 32,
              alignItems: 'center',
              opacity: 0,
            },
            tripleXStyle,
          ]}
        >
          <Box flexDirection="row" alignItems="center" gap="md" px="xl" py="lg" borderRadius="xl" bg={`${theme.colors.accent.purple}20`} borderWidth={2} borderColor="accent.purple">
            <Text fontSize={48}>✨</Text>
            <Box>
              <Text variant="hero" color="accent.purple" fontWeight="800">
                {xpAmount * 3}
              </Text>
              <Text variant="caption" color="text.tertiary">
                XP (3× CRITICAL!)
              </Text>
            </Box>
          </Box>
        </Animated.View>

        {/* Normal XP crossed out */}
        <Animated.View
          style={{
            marginTop: 16,
            opacity: withDelay(1500, withTiming(0.5, { duration: 300 })),
          }}
        >
          <Text
            variant="h4"
            color="text.tertiary"
            style={{
              textDecorationLine: 'line-through',
            }}
          >
            Was: {xpAmount} XP
          </Text>
        </Animated.View>
      </Animated.View>
    </Box>
  );
}

export default CriticalHitBanner;
