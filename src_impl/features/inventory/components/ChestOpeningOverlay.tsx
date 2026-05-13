/**
 * ChestOpeningOverlay Component
 *
 * Full-screen chest opening ceremony.
 * Phase 1: Chest displayed, tap to open
 * Phase 2: Lid animation, light burst, items fly out
 * Phase 3: Items settle, revealed with name + rarity glow
 * Legendary: extra screen shake + golden particles
 *
 * @phase 3E.3
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Dimensions, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeOut, useAnimatedStyle, withSpring, withSequence, withTiming, withRepeat, withDelay, runOnJS, useSharedValue } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import type { ChestRarity } from '../../rewards/service';
import { getChestAppearance, generateChestContents } from '../../rewards/service';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
type OpeningPhase = 'READY' | 'OPENING' | 'REVEALING' | 'COMPLETE';

/**
 * Golden particle for legendary chests
 */
function GoldenParticle({ delay }: { delay: number }): JSX.Element {
  const startX = Math.random() * SCREEN_WIDTH;

  const particleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withDelay(delay, withTiming(-SCREEN_HEIGHT, { duration: 2000 })),
      },
      {
        translateX: withDelay(delay, withTiming(startX + (Math.random() - 0.5) * 200, { duration: 2000 })),
      },
    ],
    opacity: withDelay(delay, withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: 300 }), withTiming(0, { duration: 1700 }))),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: -20,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: 'theme.colors.primary[500]',
        },
        particleStyle,
      ]}
    />
  );
}

/**
 * Light burst effect
 */
function LightBurst(): JSX.Element {
  const burstStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSequence(withTiming(0, { duration: 0 }), withSpring(2, { damping: 5, stiffness: 100 }), withTiming(3, { duration: 1000 })),
      },
    ],
    opacity: withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: 200 }), withTiming(0, { duration: 1000 })),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        },
        burstStyle,
      ]}
    />
  );
}

/**
 * Chest item that flies out
 */
function FlyingItem({ emoji, value, label, delay, isItem }: { emoji: string; value: string; label: string; delay: number; isItem?: boolean }): JSX.Element {
  const { theme } = useTheme();

  const flyStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withDelay(delay, withSpring(-150, { damping: 12, stiffness: 100 })),
      },
      {
        scale: withDelay(delay, withSequence(withTiming(0, { duration: 0 }), withSpring(1.2, { damping: 8 }), withSpring(1, { damping: 12 }))),
      },
    ],
    opacity: withDelay(delay, withTiming(1, { duration: 300 })),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          alignItems: 'center',
          bottom: 150,
        },
        flyStyle,
      ]}
    >
      <Box width={80} height={80} borderRadius="xl" bg={isItem ? 'accent.purple' : 'background.secondary'} justifyContent="center" alignItems="center" borderWidth={2} borderColor={isItem ? 'accent.purple' : 'border.light'}>
        <Text fontSize={40}>{emoji}</Text>
      </Box>
      <Text variant="h4" color="text.primary" fontWeight="700" mt="sm">
        {value}
      </Text>
      <Text variant="caption" color="text.tertiary">
        {label}
      </Text>
    </Animated.View>
  );
}

/**
 * Chest lid with opening animation
 */
function ChestLid({ rarity, phase }: { rarity: ChestRarity; phase: OpeningPhase }): JSX.Element {
  const { theme } = useTheme();
  const appearance = getChestAppearance(rarity);

  const lidStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotateX: phase === 'OPENING' || phase === 'REVEALING' || phase === 'COMPLETE' ? withSpring('-110deg', { damping: 10, stiffness: 100 }) : '0deg',
      },
    ],
    opacity: phase === 'REVEALING' || phase === 'COMPLETE' ? withTiming(0, { duration: 500 }) : 1,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: appearance.color,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderWidth: 3,
          borderColor: appearance.color,
          transformOrigin: 'bottom',
          zIndex: 10,
        },
        lidStyle,
      ]}
    >
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text fontSize={24}>{appearance.emoji}</Text>
      </Box>
    </Animated.View>
  );
}

/**
 * Main chest opening overlay
 */
export function ChestOpeningOverlay({ visible, rarity, onClose, onChestOpened }: ChestOpeningOverlayProps): JSX.Element {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<OpeningPhase>('READY');
  const [contents, setContents] = useState<{
    xp: number;
    coins: number;
    gems?: number;
    item?: string;
  } | null>(null);

  const appearance = getChestAppearance(rarity);
  const isLegendary = rarity === 'LEGENDARY';

  // Screen shake for legendary
  const shakeValue = useSharedValue(0);

  const handleOpenChest = useCallback(() => {
    if (phase !== 'READY') {
      return;
    }

    setPhase('OPENING');

    // Trigger screen shake for legendary
    if (isLegendary) {
      shakeValue.value = withSequence(withTiming(5, { duration: 50 }), withTiming(-5, { duration: 50 }), withTiming(5, { duration: 50 }), withTiming(-5, { duration: 50 }), withTiming(0, { duration: 50 }));
    }

    // Generate contents
    const chestContents = generateChestContents(rarity);
    setContents(chestContents);

    // Notify parent
    setTimeout(() => {
      onChestOpened(chestContents);
    }, 500);

    // Advance phases
    setTimeout(() => setPhase('REVEALING'), 600);
    setTimeout(() => setPhase('COMPLETE'), 2000);
  }, [phase, isLegendary, rarity, shakeValue, onChestOpened]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeValue.value }],
  }));

  // Reset on close
  useEffect(() => {
    if (!visible) {
      setPhase('READY');
      setContents(null);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={[
          {
            flex: 1,
            backgroundColor: `${theme.colors.background.primary}F0`,
            justifyContent: 'center',
            alignItems: 'center',
          },
          shakeStyle,
        ]}
      >
        {/* Legendary particles */}
        {isLegendary && phase === 'OPENING' && (
          <>
            {Array.from({ length: 30 }).map((_, i) => (
              <GoldenParticle key={i} delay={i * 50} />
            ))}
          </>
        )}

        {/* Chest Container */}
        <Box justifyContent="center" alignItems="center" position="relative">
          {/* Light burst on opening */}
          {(phase === 'OPENING' || phase === 'REVEALING') && <LightBurst />}

          {/* Closed/Open Chest */}
          <Pressable onPress={handleOpenChest} disabled={phase !== 'READY'} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
            <Box
              width={140}
              height={120}
              borderRadius="xl"
              bg={`${appearance.color}30`}
              borderWidth={3}
              borderColor={appearance.color}
              justifyContent="center"
              alignItems="center"
              position="relative"
              overflow="hidden"
              style={{
                shadowColor: appearance.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: appearance.glow ? 0.5 : 0.3,
                shadowRadius: appearance.glow ? 20 : 10,
                elevation: 10,
              }}
            >
              <ChestLid rarity={rarity} phase={phase} />

              {/* Chest body */}
              <Box flex={1} justifyContent="center" alignItems="center" pt="xl">
                {phase === 'READY' ? (
                  <>
                    <Text fontSize={48}>{appearance.emoji}</Text>
                    <Text variant="caption" color={appearance.color} fontWeight="700" mt="sm">
                      {appearance.label}
                    </Text>
                    <Text variant="caption" color="text.tertiary" mt="xs">
                      Tap to open
                    </Text>
                  </>
                ) : (
                  <Text fontSize={48}>✨</Text>
                )}
              </Box>
            </Box>
          </Pressable>

          {/* Flying items */}
          {phase === 'REVEALING' || phase === 'COMPLETE' ? (
            <>
              <FlyingItem emoji="✨" value={`+${contents?.xp}`} label="XP" delay={200} />
              <FlyingItem emoji="🪙" value={`+${contents?.coins}`} label="Coins" delay={400} />
              {contents?.gems && <FlyingItem emoji="💎" value={`+${contents.gems}`} label="Gems" delay={600} />}
              {contents?.item && <FlyingItem emoji="🎁" value={contents.item} label="Item" delay={800} isItem />}
            </>
          ) : null}
        </Box>

        {/* Complete screen */}
        {phase === 'COMPLETE' && (
          <Animated.View
            entering={FadeInUp.duration(500)}
            style={{
              position: 'absolute',
              bottom: 100,
              width: SCREEN_WIDTH - 40,
            }}
          >
            <Button variant="primary" size="lg" fullWidth onPress={onClose} accessibilityLabel="Awesome! → button" accessibilityRole="button" accessibilityHint="Activates this control">
              Awesome! →
            </Button>
          </Animated.View>
        )}
      </Animated.View>
    </Modal>
  );
}

export default ChestOpeningOverlay;

export * from "./ChestOpeningOverlay.types";
