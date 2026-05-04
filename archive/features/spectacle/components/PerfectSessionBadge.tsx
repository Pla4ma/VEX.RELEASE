/**
 * PerfectSessionBadge
 *
 * Celebration for perfect sessions (S grade, 0 pauses, 30+ min).
 * Shows animated star burst around the S grade card with bonus rewards.
 */

import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { Box, Text } from '@/components/primitives';
import { useTheme } from '@/theme';
import type { PerfectSessionPayload } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PerfectSessionBadgeProps {
  payload: PerfectSessionPayload;
  onComplete: () => void;
}

export const PerfectSessionBadge: React.FC<PerfectSessionBadgeProps> = ({
  payload,
  onComplete,
}) => {
  const { theme } = useTheme();
  const [showTapToContinue, setShowTapToContinue] = useState(false);

  // Animation values
  const badgeScale = useSharedValue(0);
  const badgeRotate = useSharedValue(-180);
  const starBurstScale = useSharedValue(0);
  const starBurstOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const rewardsOpacity = useSharedValue(0);
  const glowPulse = useSharedValue(0);

  useEffect(() => {
    runCeremony();
  }, []);

  const runCeremony = async () => {
    // Initial delay
    await delay(300);

    // Badge flips in
    badgeRotate.value = withSpring(0, { damping: 15, stiffness: 100 });
    badgeScale.value = withSpring(1, { damping: 12, stiffness: 80 });

    await delay(400);

    // Glow pulse starts
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.5, { duration: 400 })
      ),
      3,
      true
    );

    // Star burst explodes
    starBurstScale.value = withSpring(1.5, { damping: 10, stiffness: 80 });
    starBurstOpacity.value = withTiming(1, { duration: 300 });

    await delay(300);

    // Title slides up
    titleOpacity.value = withTiming(1, { duration: 400 });
    titleTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });

    await delay(600);

    // Show rewards
    rewardsOpacity.value = withTiming(1, { duration: 500 });

    await delay(1200);

    // Show tap to continue
    setShowTapToContinue(true);
  };

  const handleTap = () => {
    if (showTapToContinue) {
      onComplete();
    }
  };

  // Animated styles
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotateY: `${badgeRotate.value}deg` },
    ],
  }));

  const starBurstStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starBurstScale.value }],
    opacity: starBurstOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [1, 1.2]) }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const rewardsStyle = useAnimatedStyle(() => ({
    opacity: rewardsOpacity.value,
  }));

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  return (
    <Pressable onPress={handleTap} style={{ flex: 1 }}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
      <Box
        flex={1}
        alignItems="center"
        justifyContent="center"
        bg={theme.colors.background.primary}
        style={{ position: 'relative' }}
      >
        {/* Background glow */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: 150,
              backgroundColor: theme.colors.warning.DEFAULT,
            },
            glowStyle,
          ]}
          pointerEvents="none"
        />

        {/* Star burst */}
        <Animated.View style={[starBurstStyle, { position: 'absolute' }]} pointerEvents="none">
          <StarBurst />
        </Animated.View>

        {/* S Grade Badge */}
        <Animated.View style={badgeStyle}>
          <Box
            width={140}
            height={140}
            borderRadius={20}
            bg={theme.colors.warning.DEFAULT}
            alignItems="center"
            justifyContent="center"
            style={{
              borderWidth: 4,
              borderColor: theme.colors.warning.dark,
              shadowColor: theme.colors.warning.DEFAULT,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 30,
              elevation: 15,
            }}
          >
            <Text
              variant="hero"
              color={theme.colors.text.inverse}
              style={{ fontSize: 72, fontWeight: '900' }}
            >
              S
            </Text>
          </Box>
        </Animated.View>

        {/* Perfect Session Title */}
        <Animated.View style={[titleStyle, { marginTop: 32 }]}>
          <Box alignItems="center">
            <Box flexDirection="row" alignItems="center" gap={2}>
              <Text style={{ fontSize: 32 }}>🌟</Text>
              <Text
                variant="h1"
                color={theme.colors.warning.DEFAULT}
                style={{
                  textShadowColor: theme.colors.warning.DEFAULT,
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 15,
                }}
              >
                PERFECT SESSION
              </Text>
              <Text style={{ fontSize: 32 }}>🌟</Text>
            </Box>
            <Text variant="bodyLarge" color={theme.colors.text.secondary} mt={2} textAlign="center">
              Flawless focus. Zero interruptions.
            </Text>
          </Box>
        </Animated.View>

        {/* Session stats */}
        <Animated.View entering={FadeInUp.delay(600)} style={{ marginTop: 24 }}>
          <Box
            flexDirection="row"
            gap={6}
            px={6}
            py={4}
            borderRadius={16}
            bg={theme.colors.background.secondary}
          >
            <Box alignItems="center">
              <Text variant="caption" color={theme.colors.text.tertiary}>Duration</Text>
              <Text variant="body" color={theme.colors.text.primary} fontWeight="bold">
                {formatDuration(payload.duration)}
              </Text>
            </Box>
            <Box width={1} height="100%" bg={theme.colors.border.DEFAULT} />
            <Box alignItems="center">
              <Text variant="caption" color={theme.colors.text.tertiary}>Score</Text>
              <Text variant="body" color={theme.colors.text.primary} fontWeight="bold">
                {payload.score}%
              </Text>
            </Box>
            <Box width={1} height="100%" bg={theme.colors.border.DEFAULT} />
            <Box alignItems="center">
              <Text variant="caption" color={theme.colors.text.tertiary}>Pauses</Text>
              <Text variant="body" color={theme.colors.success.DEFAULT} fontWeight="bold">
                None
              </Text>
            </Box>
          </Box>
        </Animated.View>

        {/* Bonus rewards */}
        <Animated.View style={[rewardsStyle, { marginTop: 32 }]}>
          <Box alignItems="center">
            <Text variant="h4" color={theme.colors.text.primary} mb={4}>
              Perfect Session Bonus
            </Text>
            <Box flexDirection="row" gap={3}>
              {/* XP Bonus */}
              <Animated.View entering={FadeInUp.delay(0)}>
                <Box
                  flexDirection="row"
                  alignItems="center"
                  bg={theme.colors.background.secondary}
                  px={4}
                  py={3}
                  borderRadius={12}
                  style={{
                    borderWidth: 2,
                    borderColor: theme.colors.primary[500],
                  }}
                >
                  <Text style={{ fontSize: 24 }}>⭐</Text>
                  <Box ml={2}>
                    <Text variant="body" color={theme.colors.text.primary} fontWeight="bold">
                      +{payload.bonusXp} XP
                    </Text>
                    <Text variant="caption" color={theme.colors.primary[500]}>
                      Bonus
                    </Text>
                  </Box>
                </Box>
              </Animated.View>

              {/* Coins Bonus */}
              <Animated.View entering={FadeInUp.delay(100)}>
                <Box
                  flexDirection="row"
                  alignItems="center"
                  bg={theme.colors.background.secondary}
                  px={4}
                  py={3}
                  borderRadius={12}
                  style={{
                    borderWidth: 2,
                    borderColor: theme.colors.warning.DEFAULT,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>🪙</Text>
                  <Box ml={2}>
                    <Text variant="body" color={theme.colors.text.primary} fontWeight="bold">
                      +{payload.bonusCoins}
                    </Text>
                    <Text variant="caption" color={theme.colors.warning.DEFAULT}>
                      Coins
                    </Text>
                  </Box>
                </Box>
              </Animated.View>

              {/* Gem Chance */}
              {payload.gemChance && (
                <Animated.View entering={FadeInUp.delay(200)}>
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    bg={theme.colors.background.secondary}
                    px={4}
                    py={3}
                    borderRadius={12}
                    style={{
                      borderWidth: 2,
                      borderColor: theme.colors.accent.purple,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>💎</Text>
                    <Box ml={2}>
                      <Text variant="body" color={theme.colors.text.primary} fontWeight="bold">
                        Gem!
                      </Text>
                      <Text variant="caption" color={theme.colors.accent.purple}>
                        Bonus Drop
                      </Text>
                    </Box>
                  </Box>
                </Animated.View>
              )}
            </Box>
          </Box>
        </Animated.View>

        {/* Tap to continue */}
        {showTapToContinue && (
          <Box position="absolute" bottom={40} alignItems="center">
            <Animated.View entering={FadeIn}>
              <Text variant="caption" color={theme.colors.text.tertiary}>
                Tap anywhere to continue
              </Text>
            </Animated.View>
          </Box>
        )}
      </Box>
    </Pressable>
  );
};

// Star burst component with animated rays
const StarBurst: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        width: 300,
        height: 300,
        position: 'relative',
      }}
      pointerEvents="none"
    >
      {/* Star rays */}
      {Array.from({ length: 12 }).map((_, i) => {
        const rotation = (i / 12) * 360;
        const length = 60 + (i % 3) * 20;
        const delay = i * 50;

        return (
          <StarRay
            key={i}
            rotation={rotation}
            length={length}
            delay={delay}
            color={theme.colors.warning.DEFAULT}
          />
        );
      })}

      {/* Sparkle dots */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 100;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const delay = 200 + i * 100;

        return (
          <Animated.View
            key={`sparkle-${i}`}
            entering={FadeIn.delay(delay)}
            style={{
              position: 'absolute',
              left: 150 + x - 6,
              top: 150 + y - 6,
            }}
          >
            <Box
              width={12}
              height={12}
              borderRadius={6}
              bg={theme.colors.warning.light}
              style={{
                shadowColor: theme.colors.warning.DEFAULT,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 10,
              }}
            />
          </Animated.View>
        );
      })}
    </Box>
  );
};

// Individual star ray
interface StarRayProps {
  rotation: number;
  length: number;
  delay: number;
  color: string;
}

const StarRay: React.FC<StarRayProps> = ({ rotation, length, delay, color }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 100 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 4,
          height: length,
          backgroundColor: color,
          left: 148,
          top: 150 - length,
          transformOrigin: 'bottom',
          transform: [{ rotate: `${rotation}deg` }],
          borderRadius: 2,
        },
        animatedStyle,
      ]}
    />
  );
};

// Helper imports
import { useAnimatedStyle as _useAnimatedStyle } from 'react-native-reanimated';
import { withRepeat } from 'react-native-reanimated';

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
