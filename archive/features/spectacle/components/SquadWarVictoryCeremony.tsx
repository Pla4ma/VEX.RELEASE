/**
 * SquadWarVictoryCeremony
 *
 * Full-screen celebration when squad wins a war.
 * Shows squad vs opponent, victory animation, contributors, and loot.
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
import type { SquadWarVictoryPayload } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SquadWarVictoryCeremonyProps {
  payload: SquadWarVictoryPayload;
  onComplete: () => void;
}

export const SquadWarVictoryCeremony: React.FC<SquadWarVictoryCeremonyProps> = ({
  payload,
  onComplete,
}) => {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<'intro' | 'versus' | 'victory' | 'contributors' | 'loot'>('intro');
  const [showSkipHint, setShowSkipHint] = useState(false);
  const [autoDismissTimer, setAutoDismissTimer] = useState(6);

  // Animation values
  const squadFlagY = useSharedValue(100);
  const opponentFlagY = useSharedValue(-100);
  const vsScale = useSharedValue(0);
  const vsRotate = useSharedValue(-180);
  const victoryScale = useSharedValue(0);
  const victoryOpacity = useSharedValue(0);
  const contributorsOpacity = useSharedValue(0);
  const lootOpacity = useSharedValue(0);
  const screenFlash = useSharedValue(0);
  const confettiBurst = useSharedValue(0);

  useEffect(() => {
    runCeremony();

    // Auto-dismiss countdown
    const timer = setInterval(() => {
      setAutoDismissTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const runCeremony = async () => {
    // Phase 1: Intro
    setPhase('intro');
    await delay(500);

    // Phase 2: VS display with flags
    setPhase('versus');
    vsScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    vsRotate.value = withSpring(0, { damping: 10, stiffness: 80 });

    // Flags animate
    squadFlagY.value = withSpring(0, { damping: 15, stiffness: 80 });
    opponentFlagY.value = withSpring(0, { damping: 15, stiffness: 80 });

    await delay(1500);

    // Phase 3: Victory announcement
    setPhase('victory');

    // Screen flash
    screenFlash.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 250 }),
      withTiming(0.8, { duration: 150 }),
      withTiming(0, { duration: 250 })
    );

    // Confetti burst
    confettiBurst.value = withTiming(1, { duration: 500 });

    // Victory text scales in
    victoryScale.value = withSpring(1.2, { damping: 10, stiffness: 100 });
    victoryOpacity.value = withTiming(1, { duration: 300 });

    // VS fades out
    vsScale.value = withTiming(0.5, { duration: 300 });
    vsRotate.value = withTiming(90, { duration: 300 });

    await delay(1500);

    // Phase 4: Contributors
    setPhase('contributors');
    victoryScale.value = withTiming(0.8, { duration: 300 });
    contributorsOpacity.value = withTiming(1, { duration: 500 });

    setShowSkipHint(true);
    await delay(2000);

    // Phase 5: Loot
    setPhase('loot');
    lootOpacity.value = withTiming(1, { duration: 500 });

    await delay(2000);
  };

  const handleTap = () => {
    onComplete();
  };

  // Animated styles
  const squadFlagStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: squadFlagY.value }],
  }));

  const opponentFlagStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: opponentFlagY.value }],
  }));

  const vsStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: vsScale.value },
      { rotateZ: `${vsRotate.value}deg` },
    ],
  }));

  const victoryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: victoryScale.value }],
    opacity: victoryOpacity.value,
  }));

  const contributorsStyle = useAnimatedStyle(() => ({
    opacity: contributorsOpacity.value,
  }));

  const lootStyle = useAnimatedStyle(() => ({
    opacity: lootOpacity.value,
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: interpolate(screenFlash.value, [0, 1], [0, 0.4]),
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
        bg={theme.colors.background.primary}
        style={{ position: 'relative' }}
      >
        {/* Screen flash effect */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.colors.success.DEFAULT,
            },
            flashStyle,
          ]}
          pointerEvents="none"
        />

        {/* Confetti burst */}
        {phase === 'victory' || phase === 'contributors' || phase === 'loot' ? (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
            ]}
            pointerEvents="none"
          >
            <ConfettiExplosion />
          </Animated.View>
        ) : null}

        {/* Phase 2: VS Display */}
        {(phase === 'versus' || phase === 'victory') && (
          <Box flexDirection="row" alignItems="center" justifyContent="center" gap={4}>
            {/* Squad flag */}
            <Animated.View style={squadFlagStyle}>
              <Box alignItems="center">
                <Box
                  width={80}
                  height={100}
                  borderRadius={8}
                  bg={theme.colors.primary[500]}
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    borderWidth: 3,
                    borderColor: theme.colors.primary[300],
                  }}
                >
                  <Text style={{ fontSize: 40 }}>🏴</Text>
                </Box>
                <Text
                  variant="body"
                  color={theme.colors.primary[500]}
                  fontWeight="bold"
                  mt={2}
                  numberOfLines={1}
                  style={{ maxWidth: 100 }}
                >
                  {payload.squadName}
                </Text>
              </Box>
            </Animated.View>

            {/* VS badge */}
            <Animated.View style={vsStyle}>
              <Box
                width={60}
                height={60}
                borderRadius={30}
                bg={theme.colors.background.secondary}
                alignItems="center"
                justifyContent="center"
                style={{
                  borderWidth: 2,
                  borderColor: theme.colors.border.DEFAULT,
                }}
              >
                <Text variant="h3" color={theme.colors.text.primary}>
                  VS
                </Text>
              </Box>
            </Animated.View>

            {/* Opponent flag */}
            <Animated.View style={opponentFlagStyle}>
              <Box alignItems="center">
                <Box
                  width={80}
                  height={100}
                  borderRadius={8}
                  bg={theme.colors.error.DEFAULT}
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    borderWidth: 3,
                    borderColor: theme.colors.error.light,
                    opacity: 0.5,
                  }}
                >
                  <Text style={{ fontSize: 40 }}>🏳️</Text>
                </Box>
                <Text
                  variant="body"
                  color={theme.colors.text.tertiary}
                  mt={2}
                  numberOfLines={1}
                  style={{ maxWidth: 100 }}
                >
                  {payload.opponentSquadName}
                </Text>
              </Box>
            </Animated.View>
          </Box>
        )}

        {/* Phase 3: Victory announcement */}
        {(phase === 'victory' || phase === 'contributors' || phase === 'loot') && (
          <Animated.View style={[victoryStyle, { position: 'absolute', top: SCREEN_HEIGHT * 0.15 }]}>
            <Box alignItems="center">
              <Text style={{ fontSize: 60 }}>🏆</Text>
              <Text
                variant="hero"
                color={theme.colors.success.DEFAULT}
                style={{
                  textShadowColor: theme.colors.success.DEFAULT,
                  textShadowOffset: { width: 0, height: 4 },
                  textShadowRadius: 20,
                }}
              >
                VICTORY!
              </Text>
              <Text variant="h3" color={theme.colors.text.secondary} mt={2}>
                Your squad won the war!
              </Text>
            </Box>
          </Animated.View>
        )}

        {/* Phase 4: Contributors board */}
        {(phase === 'contributors' || phase === 'loot') && (
          <Animated.View style={[contributorsStyle, { position: 'absolute', bottom: SCREEN_HEIGHT * 0.25, width: SCREEN_WIDTH - 48 }]}>
            <Box alignItems="center">
              <Text variant="h4" color={theme.colors.text.primary} mb={4}>
                Top Contributors
              </Text>
              <Box flexDirection="column" gap={2} width="100%">
                {payload.contributors
                  .sort((a, b) => b.contributionScore - a.contributionScore)
                  .slice(0, 5)
                  .map((contributor, index) => (
                    <Animated.View
                      key={contributor.userId}
                      entering={FadeInUp.delay(index * 100)}
                    >
                      <Box
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        bg={theme.colors.background.secondary}
                        px={4}
                        py={3}
                        borderRadius={12}
                      >
                        <Box flexDirection="row" alignItems="center" gap={3}>
                          {/* Rank medal */}
                          <Box width={32} alignItems="center">
                            {index === 0 && <Text style={{ fontSize: 24 }}>🥇</Text>}
                            {index === 1 && <Text style={{ fontSize: 24 }}>🥈</Text>}
                            {index === 2 && <Text style={{ fontSize: 24 }}>🥉</Text>}
                            {index > 2 && (
                              <Text variant="body" color={theme.colors.text.tertiary}>
                                #{index + 1}
                              </Text>
                            )}
                          </Box>

                          {/* Avatar */}
                          <Box
                            width={40}
                            height={40}
                            borderRadius={20}
                            bg={theme.colors.primary[500]}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text variant="body" color={theme.colors.text.inverse} fontWeight="bold">
                              {contributor.displayName.charAt(0).toUpperCase()}
                            </Text>
                          </Box>

                          {/* Name */}
                          <Text variant="body" color={theme.colors.text.primary}>
                            {contributor.displayName}
                          </Text>
                        </Box>

                        {/* Contribution score */}
                        <Text variant="body" color={theme.colors.primary[500]} fontWeight="bold">
                          {contributor.contributionScore.toLocaleString()}
                        </Text>
                      </Box>
                    </Animated.View>
                  ))}
              </Box>
            </Box>
          </Animated.View>
        )}

        {/* Phase 5: Loot rewards */}
        {phase === 'loot' && (
          <Animated.View style={[lootStyle, { position: 'absolute', bottom: 80 }]}>
            <Box alignItems="center">
              <Box flexDirection="row" gap={3}>
                {payload.rewards.map((reward, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInUp.delay(index * 150)}
                  >
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
                      <Text style={{ fontSize: 24 }}>
                        {getRewardIcon(reward.type)}
                      </Text>
                      <Box ml={2}>
                        <Text variant="body" color={theme.colors.text.primary} fontWeight="bold">
                          +{reward.amount.toLocaleString()}
                        </Text>
                        <Text variant="caption" color={theme.colors.warning.DEFAULT}>
                          {reward.type}
                        </Text>
                      </Box>
                    </Box>
                  </Animated.View>
                ))}
              </Box>
            </Box>
          </Animated.View>
        )}

        {/* Skip hint with timer */}
        {showSkipHint && (
          <Box position="absolute" bottom={24} alignItems="center">
            <Animated.View entering={FadeIn}>
              <Text variant="caption" color={theme.colors.text.tertiary}>
                Tap to skip • Auto-continuing in {autoDismissTimer}s
              </Text>
            </Animated.View>
          </Box>
        )}
      </Box>
    </Pressable>
  );
};

// Confetti explosion component
const ConfettiExplosion: React.FC = () => {
  const { theme } = useTheme();

  const colors = [
    theme.colors.primary[500],
    theme.colors.success.DEFAULT,
    theme.colors.warning.DEFAULT,
    theme.colors.accent.purple,
    theme.colors.accent.pink,
  ];

  return (
    <Box style={{ position: 'relative' }} pointerEvents="none">
      {Array.from({ length: 40 }).map((_, i) => {
        const angle = (Math.random() * Math.PI) - Math.PI / 2; // Upward arc
        const velocity = 200 + Math.random() * 200;
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity - 100;
        const rotation = Math.random() * 360;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const delay = Math.random() * 200;

        return (
          <ConfettiPiece
            key={i}
            x={x}
            y={y}
            rotation={rotation}
            color={color}
            delay={delay}
          />
        );
      })}
    </Box>
  );
};

// Individual confetti piece
interface ConfettiPieceProps {
  x: number;
  y: number;
  rotation: number;
  color: string;
  delay: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ x, y, rotation, color, delay }) => {
  const translateX = useSharedValue(SCREEN_WIDTH / 2);
  const translateY = useSharedValue(SCREEN_HEIGHT / 2);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const startAnimation = () => {
      opacity.value = withTiming(1, { duration: 100 });

      translateX.value = withTiming(SCREEN_WIDTH / 2 + x, {
        duration: 1500,
        easing: Easing.out(Easing.quad),
      });

      translateY.value = withTiming(SCREEN_HEIGHT / 2 + y + 300, {
        duration: 1500,
        easing: Easing.in(Easing.quad),
      });

      rotate.value = withTiming(rotation + 720, { duration: 1500 });

      opacity.value = withDelay(1000, withTiming(0, { duration: 500 }));
    };

    const timeoutId = setTimeout(startAnimation, delay);
    return () => clearTimeout(timeoutId);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateZ: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 8,
          height: 12,
          backgroundColor: color,
          borderRadius: 2,
        },
        animatedStyle,
      ]}
    />
  );
};

// Helper functions
function getRewardIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'coins': return '🪙';
    case 'gems': return '💎';
    case 'squad_xp': return '⭐';
    case 'multiplier': return '⚡';
    default: return '🎁';
  }
}

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Reanimated imports
import { Easing } from 'react-native-reanimated';
