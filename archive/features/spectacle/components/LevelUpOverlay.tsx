/**
 * LevelUpOverlay
 *
 * Enhanced level up celebration with confetti animation,
 * tier names, and feature unlocks. Integrates with SpectacleService.
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
  Easing,
  FadeIn,
  FadeInUp,
  runOnJS,
  withRepeat,
} from 'react-native-reanimated';
import { Box, Text, Button } from '@/components/primitives';
import { useTheme } from '@/theme';
import type { LevelUpPayload } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Progression tiers with unlockable features
const PROGRESSION_TIERS: Record<number, { name: string; unlocks: string[] }> = {
  3: { name: 'Apprentice', unlocks: ['Boss encounters (Tier 1)', 'Streak tracking', 'Basic shop access'] },
  5: { name: 'Disciplined', unlocks: ['Squad creation', 'Advanced stats', 'Session presets'] },
  8: { name: 'Focused', unlocks: ['Boss Tier 2-3', 'AI coach basic', 'Achievement system'] },
  12: { name: 'Diligent', unlocks: ['Squad challenges', 'Battle pass access', 'Premium cosmetics'] },
  15: { name: 'Master', unlocks: ['Boss Tier 4-5', 'AI coach advanced', 'Custom themes'] },
  20: { name: 'Legend', unlocks: ['Boss Tier 6', 'Squad boss raids', 'Hall of Fame eligibility'] },
  30: { name: 'Grandmaster', unlocks: ['Mentor mode', 'Exclusive titles', 'Beta features'] },
};

interface LevelUpOverlayProps {
  payload: LevelUpPayload;
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({
  payload,
  onComplete,
}) => {
  const { theme } = useTheme();
  const [showTapToContinue, setShowTapToContinue] = useState(false);
  const [showUnlocks, setShowUnlocks] = useState(false);
  const [selectedUnlock, setSelectedUnlock] = useState<string | null>(null);

  // Check if this is a tier boundary
  const tierInfo = PROGRESSION_TIERS[payload.newLevel];
  const isTierBoundary = !!tierInfo;

  // Animation values
  const oldLevelScale = useSharedValue(1);
  const oldLevelOpacity = useSharedValue(1);
  const oldLevelTranslate = useSharedValue(0);
  const newLevelScale = useSharedValue(0);
  const newLevelRotate = useSharedValue(-180);
  const labelOpacity = useSharedValue(0);
  const labelTranslateY = useSharedValue(30);
  const tierCardOpacity = useSharedValue(0);
  const tierCardScale = useSharedValue(0.8);
  const unlocksOpacity = useSharedValue(0);
  const shimmerTranslate = useSharedValue(-SCREEN_WIDTH);

  // Generate confetti particles
  const [particles] = useState<Particle[]>(() => {
    const colors = [
      theme.colors.primary[500],
      theme.colors.warning.DEFAULT,
      theme.colors.success.DEFAULT,
      theme.colors.accent.purple,
      theme.colors.accent.pink,
    ];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: -20 - Math.random() * 100,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1000,
    }));
  });

  useEffect(() => {
    runCeremony();
  }, []);

  const runCeremony = async () => {
    // Initial delay
    await delay(300);

    // Phase 1: Old level fades and crosses out
    oldLevelTranslate.value = withTiming(-30, { duration: 300 });
    oldLevelOpacity.value = withTiming(0.3, { duration: 300 });

    await delay(200);

    // Phase 2: New level flies in
    newLevelScale.value = withSpring(1, { damping: 10, stiffness: 100 });
    newLevelRotate.value = withSpring(0, { damping: 12, stiffness: 80 });

    // Label slides up
    await delay(300);
    labelOpacity.value = withTiming(1, { duration: 400 });
    labelTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });

    await delay(400);

    // Phase 3: Tier card (if applicable)
    if (isTierBoundary) {
      tierCardOpacity.value = withTiming(1, { duration: 500 });
      tierCardScale.value = withSpring(1, { damping: 12, stiffness: 100 });

      // Shimmer animation
      shimmerTranslate.value = withRepeat(
        withTiming(SCREEN_WIDTH, { duration: 1500 }),
        -1,
        false
      );

      await delay(600);

      // Show unlocks
      setShowUnlocks(true);
      unlocksOpacity.value = withTiming(1, { duration: 500 });
    }

    await delay(isTierBoundary ? 1000 : 600);

    // Show tap to continue
    setShowTapToContinue(true);
  };

  const handleTap = () => {
    if (showTapToContinue) {
      onComplete();
    }
  };

  const handleUnlockPress = (unlock: string) => {
    setSelectedUnlock(unlock);
    // Could navigate to the unlocked feature here
  };

  // Animated styles
  const oldLevelStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: oldLevelScale.value },
      { translateX: oldLevelTranslate.value },
    ],
    opacity: oldLevelOpacity.value,
  }));

  const newLevelStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: newLevelScale.value },
      { rotateZ: `${newLevelRotate.value}deg` },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateY: labelTranslateY.value }],
  }));

  const tierCardStyle = useAnimatedStyle(() => ({
    opacity: tierCardOpacity.value,
    transform: [{ scale: tierCardScale.value }],
  }));

  const unlocksStyle = useAnimatedStyle(() => ({
    opacity: unlocksOpacity.value,
  }));

  return (
    <Pressable onPress={handleTap} style={{ flex: 1 }}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
      <Box
        flex={1}
        alignItems="center"
        justifyContent="center"
        bg={`${theme.colors.background.primary}EE`}
        style={{ position: 'relative' }}
      >
        {/* Confetti particles */}
        {particles.map((particle) => (
          <ConfettiParticle key={particle.id} particle={particle} />
        ))}

        {/* Level display */}
        <Box alignItems="center" style={{ position: 'relative' }}>
          {/* Old level (crossed out) */}
          <Animated.View style={[oldLevelStyle, { position: 'absolute' }]}>
            <Box alignItems="center">
              <Text
                variant="hero"
                color={theme.colors.text.tertiary}
                style={{
                  fontSize: 72,
                  textDecorationLine: 'line-through',
                  textDecorationColor: theme.colors.error.DEFAULT,
                }}
              >
                {payload.oldLevel}
              </Text>
            </Box>
          </Animated.View>

          {/* New level */}
          <Animated.View style={newLevelStyle}>
            <Box
              width={140}
              height={140}
              borderRadius={70}
              bg={theme.colors.primary[500]}
              alignItems="center"
              justifyContent="center"
              style={{
                shadowColor: theme.colors.primary[500],
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 30,
                elevation: 15,
              }}
            >
              <Text
                variant="hero"
                color={theme.colors.text.inverse}
                style={{ fontSize: 72 }}
              >
                {payload.newLevel}
              </Text>
            </Box>
          </Animated.View>

          {/* Level Up label */}
          <Animated.View style={labelStyle}>
            <Box alignItems="center" mt={6}>
              <Text variant="label" color={theme.colors.primary[500]}>
                LEVEL UP
              </Text>
              <Text variant="h2" color={theme.colors.text.primary} mt={1}>
                {payload.newLevel > payload.oldLevel + 1
                  ? `+${payload.newLevel - payload.oldLevel} Levels!`
                  : 'Level Up!'}
              </Text>
            </Box>
          </Animated.View>
        </Box>

        {/* Tier card (if tier boundary) */}
        {isTierBoundary && (
          <Animated.View style={[tierCardStyle, { marginTop: 32, width: SCREEN_WIDTH - 48 }]}>
            <Box
              bg={theme.colors.background.secondary}
              borderRadius={20}
              p={6}
              style={{
                borderWidth: 2,
                borderColor: theme.colors.primary[500],
                overflow: 'hidden',
              }}
            >
              {/* Shimmer overlay */}
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: [{ translateX: shimmerTranslate.value }],
                  },
                ]}
                pointerEvents="none"
              />

              <Box alignItems="center">
                <Text variant="label" color={theme.colors.primary[500]}>
                  NEW TIER UNLOCKED
                </Text>
                <Text
                  variant="h2"
                  color={theme.colors.primary[500]}
                  mt={2}
                  style={{
                    textShadowColor: theme.colors.primary[500],
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 10,
                  }}
                >
                  {tierInfo.name}
                </Text>
              </Box>

              {/* Unlocks list */}
              {showUnlocks && (
                <Animated.View style={[unlocksStyle, { marginTop: 20 }]}>
                  <Text variant="body" color={theme.colors.text.secondary} textAlign="center" mb={3}>
                    New features unlocked:
                  </Text>
                  <Box flexDirection="column" gap={2}>
                    {tierInfo.unlocks.map((unlock, index) => (
                      <Animated.View
                        key={unlock}
                        entering={FadeInUp.delay(index * 100)}
                      >
                        <Pressable onPress={() => handleUnlockPress(unlock)}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                          <Box
                            flexDirection="row"
                            alignItems="center"
                            bg={theme.colors.background.primary}
                            px={4}
                            py={3}
                            borderRadius={12}
                            style={{
                              borderWidth: 1,
                              borderColor: selectedUnlock === unlock
                                ? theme.colors.primary[500]
                                : theme.colors.border.DEFAULT,
                            }}
                          >
                            <Text style={{ fontSize: 20 }}>🔓</Text>
                            <Text variant="body" color={theme.colors.text.primary} ml={3}>
                              {unlock}
                            </Text>
                          </Box>
                        </Pressable>
                      </Animated.View>
                    ))}
                  </Box>
                </Animated.View>
              )}
            </Box>
          </Animated.View>
        )}

        {/* XP progress hint */}
        <Box mt={8} alignItems="center">
          <Text variant="caption" color={theme.colors.text.tertiary}>
            Total XP: {(payload.newLevel * 100).toLocaleString()}
          </Text>
        </Box>

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

// Confetti particle component
interface ConfettiParticleProps {
  particle: Particle;
}

const ConfettiParticle: React.FC<ConfettiParticleProps> = ({ particle }) => {
  const translateY = useSharedValue(particle.y);
  const translateX = useSharedValue(particle.x);
  const rotation = useSharedValue(particle.rotation);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Start animation after delay
    const startAnimation = () => {
      opacity.value = withTiming(1, { duration: 200 });

      // Fall animation
      translateY.value = withTiming(
        SCREEN_HEIGHT + 50,
        {
          duration: 3000 + Math.random() * 2000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
        () => {
          // Reset for next fall
          translateY.value = -20;
          opacity.value = 0;
          // Loop
          runOnJS(startAnimation)();
        }
      );

      // Slight horizontal drift
      translateX.value = withTiming(
        particle.x + (Math.random() - 0.5) * 100,
        { duration: 3000 }
      );

      // Rotation
      rotation.value = withTiming(
        particle.rotation + 360,
        { duration: 3000 }
      );
    };

    const timeoutId = setTimeout(startAnimation, particle.delay);
    return () => clearTimeout(timeoutId);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateZ: `${rotation.value}deg` },
      { scale: particle.scale },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 8,
          height: 8,
          backgroundColor: particle.color,
          borderRadius: 2,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    />
  );
};

// Utility delay function
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
