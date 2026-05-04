/**
 * RareLootDropCeremony
 *
 * Celebration for rare loot drops with different visual treatments
 * based on rarity: Rare (blue), Epic (purple), Legendary (gold/orange).
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
} from 'react-native-reanimated';
import { Box, Text } from '@/components/primitives';
import { useTheme } from '@/theme';
import { LootRarity, type LootDropPayload } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RareLootDropCeremonyProps {
  payload: LootDropPayload;
  onComplete: () => void;
}

// Rarity configuration with colors and effects
const RARITY_CONFIG: Record<LootRarity, {
  color: string;
  glowColor: string;
  text: string;
  screenDarken: number;
  dramaticPause: number;
  hasScreenShake: boolean;
  particleCount: number;
  spotlight: boolean;
}> = {
  [LootRarity.COMMON]: {
    color: '#9CA3AF',
    glowColor: '#D1D5DB',
    text: 'Common Drop',
    screenDarken: 0,
    dramaticPause: 0,
    hasScreenShake: false,
    particleCount: 10,
    spotlight: false,
  },
  [LootRarity.UNCOMMON]: {
    color: '#22C55E',
    glowColor: '#86EFAC',
    text: 'Uncommon!',
    screenDarken: 0,
    dramaticPause: 0,
    hasScreenShake: false,
    particleCount: 15,
    spotlight: false,
  },
  [LootRarity.RARE]: {
    color: '#3B82F6',
    glowColor: '#60A5FA',
    text: 'RARE DROP!',
    screenDarken: 0,
    dramaticPause: 0,
    hasScreenShake: false,
    particleCount: 25,
    spotlight: true,
  },
  [LootRarity.EPIC]: {
    color: '#A855F7',
    glowColor: '#C084FC',
    text: 'EPIC DROP!',
    screenDarken: 0.5,
    dramaticPause: 300,
    hasScreenShake: true,
    particleCount: 40,
    spotlight: true,
  },
  [LootRarity.LEGENDARY]: {
    color: '#F97316',
    glowColor: '#FDBA74',
    text: 'LEGENDARY!',
    screenDarken: 1,
    dramaticPause: 800,
    hasScreenShake: true,
    particleCount: 60,
    spotlight: true,
  },
};

export const RareLootDropCeremony: React.FC<RareLootDropCeremonyProps> = ({
  payload,
  onComplete,
}) => {
  const { theme } = useTheme();
  const rarity = payload.rarity;
  const config = RARITY_CONFIG[rarity];
  const isLegendary = rarity === LootRarity.LEGENDARY;
  const isEpic = rarity === LootRarity.EPIC;
  const isSignificant = isLegendary || isEpic || rarity === LootRarity.RARE;

  const [phase, setPhase] = useState<'intro' | 'dramatic-pause' | 'reveal' | 'complete'>('intro');
  const [showTapToContinue, setShowTapToContinue] = useState(false);

  // Animation values
  const screenDarken = useSharedValue(0);
  const itemScale = useSharedValue(0);
  const itemGlow = useSharedValue(0);
  const itemFloat = useSharedValue(100);
  const textScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const sparkleTrail = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const spotlightOpacity = useSharedValue(0);

  useEffect(() => {
    runCeremony();
  }, []);

  const runCeremony = async () => {
    // Phase 1: Intro - darken screen for Epic/Legendary
    setPhase('intro');

    if (config.screenDarken > 0) {
      screenDarken.value = withTiming(config.screenDarken, { duration: 400 });
    }

    await delay(config.screenDarken > 0 ? 400 : 100);

    // Phase 2: Dramatic pause (Epic/Legendary only)
    if (config.dramaticPause > 0) {
      setPhase('dramatic-pause');
      await delay(config.dramaticPause);
    }

    // Phase 3: Reveal
    setPhase('reveal');

    // Screen brightens back
    if (config.screenDarken > 0) {
      screenDarken.value = withTiming(0, { duration: 300 });
    }

    // Spotlight for Rare+
    if (config.spotlight) {
      spotlightOpacity.value = withTiming(0.3, { duration: 300 });
    }

    // Item animates in
    itemScale.value = withSpring(1.2, { damping: 10, stiffness: 100 });
    itemFloat.value = withSpring(0, { damping: 12, stiffness: 80 });

    await delay(200);

    // Text appears
    textScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    textOpacity.value = withTiming(1, { duration: 300 });

    // Screen shake (Epic/Legendary)
    if (config.hasScreenShake) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 100 })
      );
    }

    // Glow pulse
    itemGlow.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0.5, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );

    // Sparkle trail
    sparkleTrail.value = withTiming(1, { duration: 500 });

    await delay(1500);

    // Complete
    setPhase('complete');
    setShowTapToContinue(true);
  };

  const handleTap = () => {
    if (showTapToContinue) {
      onComplete();
    }
  };

  // Animated styles
  const darkenStyle = useAnimatedStyle(() => ({
    backgroundColor: isLegendary ? '#000000' : theme.colors.background.primary,
    opacity: screenDarken.value,
  }));

  const itemStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: itemScale.value },
      { translateY: itemFloat.value },
    ],
    shadowColor: config.glowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: itemGlow.value * 0.8,
    shadowRadius: 30 + itemGlow.value * 20,
    elevation: 20,
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
    opacity: textOpacity.value,
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const spotlightStyle = useAnimatedStyle(() => ({
    opacity: spotlightOpacity.value,
  }));

  const trailStyle = useAnimatedStyle(() => ({
    opacity: sparkleTrail.value,
  }));

  return (
    <Pressable onPress={handleTap} style={{ flex: 1 }}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
      <Animated.View style={[shakeStyle, { flex: 1 }]}>
        <Box
          flex={1}
          alignItems="center"
          justifyContent="center"
          bg={theme.colors.background.primary}
          style={{ position: 'relative' }}
        >
          {/* Screen darkening overlay */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
              darkenStyle,
            ]}
            pointerEvents="none"
          />

          {/* Spotlight for Rare+ */}
          {config.spotlight && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 300,
                  height: 300,
                  borderRadius: 150,
                  backgroundColor: config.glowColor,
                  top: SCREEN_HEIGHT / 2 - 150,
                  left: SCREEN_WIDTH / 2 - 150,
                },
                spotlightStyle,
              ]}
              pointerEvents="none"
            />
          )}

          {/* Sparkle trail */}
          {isSignificant && (
            <Animated.View
              style={[
                trailStyle,
                {
                  position: 'absolute',
                  top: SCREEN_HEIGHT / 2 - 100,
                },
              ]}
            >
              <SparkleTrail color={config.glowColor} />
            </Animated.View>
          )}

          {/* Item container */}
          <Animated.View style={itemStyle}>
            <Box
              width={120}
              height={120}
              borderRadius={60}
              bg={theme.colors.background.secondary}
              alignItems="center"
              justifyContent="center"
              style={{
                borderWidth: 3,
                borderColor: config.color,
              }}
            >
              <Text style={{ fontSize: 56 }}>
                {getItemIcon(payload.items[0]?.type)}
              </Text>
            </Box>
            {/* Floating particles around item */}
            {isSignificant && <FloatingParticles color={config.glowColor} count={config.particleCount} />}
          </Animated.View>

          {/* Rarity text */}
          <Animated.View style={[textStyle, { marginTop: 32 }]}>
            <Box alignItems="center">
              <Text
                variant="h1"
                color={config.color}
                style={{
                  fontSize: isLegendary ? 42 : 36,
                  textShadowColor: config.glowColor,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: isLegendary ? 30 : 20,
                }}
              >
                {config.text}
              </Text>
              {isLegendary && (
                <Text variant="body" color={theme.colors.warning.DEFAULT} mt={2}>
                  Ultra Rare Drop!
                </Text>
              )}
            </Box>
          </Animated.View>

          {/* Items list */}
          <Animated.View entering={FadeInUp.delay(400)} style={{ marginTop: 32 }}>
            <Box alignItems="center">
              <Box flexDirection="row" flexWrap="wrap" justifyContent="center" gap={3} maxWidth={300}>
                {payload.items.map((item, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInUp.delay(200 + index * 100)}
                  >
                    <Box
                      flexDirection="row"
                      alignItems="center"
                      bg={theme.colors.background.secondary}
                      px={4}
                      py={3}
                      borderRadius={12}
                      style={{
                        borderWidth: 1,
                        borderColor: config.color,
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                      <Box ml={2}>
                        <Text variant="body" color={theme.colors.text.primary} fontWeight="bold">
                          +{item.amount.toLocaleString()}
                        </Text>
                        <Text variant="caption" color={config.color}>
                          {item.name}
                        </Text>
                      </Box>
                    </Box>
                  </Animated.View>
                ))}
              </Box>
            </Box>
          </Animated.View>

          {/* Source indicator */}
          <Box mt={6}>
            <Text variant="caption" color={theme.colors.text.tertiary}>
              From: {formatSource(payload.source)}
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
      </Animated.View>
    </Pressable>
  );
};

// Sparkle trail component
const SparkleTrail: React.FC<{ color: string }> = ({ color }) => {
  return (
    <Box style={{ position: 'relative', height: 200, width: 200 }}>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 80;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        return (
          <Animated.View
            key={i}
            entering={FadeIn.delay(i * 100)}
            style={{
              position: 'absolute',
              left: 100 + x - 4,
              top: 100 + y - 4,
            }}
          >
            <Box
              width={8}
              height={8}
              borderRadius={4}
              style={{ backgroundColor: color }}
            />
          </Animated.View>
        );
      })}
    </Box>
  );
};

// Floating particles around the item
const FloatingParticles: React.FC<{ color: string; count: number }> = ({ color, count }) => {
  return (
    <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const distance = 70 + Math.random() * 30;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const size = 4 + Math.random() * 4;
        const delay = Math.random() * 1000;

        return (
          <Animated.View
            key={i}
            entering={FadeIn.delay(delay)}
            style={{
              position: 'absolute',
              left: 60 + x - size / 2,
              top: 60 + y - size / 2,
            }}
          >
            <Box
              width={size}
              height={size}
              borderRadius={size / 2}
              style={{ backgroundColor: color, opacity: 0.6 }}
            />
          </Animated.View>
        );
      })}
    </Box>
  );
};

// Helper functions
function getItemIcon(type: string): string {
  switch (type?.toLowerCase()) {
    case 'coins': return '🪙';
    case 'gems': return '💎';
    case 'xp': return '⭐';
    case 'streak_shield': return '🛡️';
    case 'cosmetic': return '🎨';
    case 'title': return '🏆';
    case 'item': return '🎁';
    default: return '✨';
  }
}

function formatSource(source: string): string {
  switch (source) {
    case 'SESSION_COMPLETE': return 'Session Complete';
    case 'BOSS_DEFEAT': return 'Boss Defeat';
    case 'MILESTONE': return 'Milestone';
    case 'CHEST': return 'Reward Chest';
    default: return source;
  }
}

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
