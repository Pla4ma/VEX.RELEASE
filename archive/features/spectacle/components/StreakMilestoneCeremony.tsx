import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * StreakMilestoneCeremony
 *
 * Celebration for streak milestones: 3, 7, 14, 30, 60, 100 days.
 * Each milestone has unique visual treatment from small badge to epic ceremony.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, Pressable, Share } from 'react-native';
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
} from 'react-native-reanimated';
import { Box, Text, Button } from '@/components/primitives';
import { useTheme } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { streakMilestone } from '../../../utils/haptics';
import type { StreakMilestonePayload } from '../types';
import type { ExtendedRootStackParams } from '../../../navigation/types';
// PHASE 18.3: Contextual paywall trigger
import { ContextualPaywallBanner } from '../../../shared/monetization/components/ContextualPaywallBanner';

// PHASE 17.4: VictoryCard imports for sharing
import { generateShareCaption, type VictoryCardData } from '../../social/components/VictoryCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type MilestoneTier = 3 | 7 | 14 | 30 | 60 | 100;

interface StreakMilestoneCeremonyProps {
  payload: StreakMilestonePayload;
  onComplete: () => void;
}

interface MilestoneConfig {
  title: string;
  flameCount: number;
  flameSize: number;
  badgeSize: number;
  hasVoiceLine: boolean;
  confetti: boolean;
  glowColor: string;
}

const MILESTONE_CONFIGS: Record<MilestoneTier, MilestoneConfig> = {
  3: {
    title: '3-Day Streak!',
    flameCount: 1,
    flameSize: 80,
    badgeSize: 120,
    hasVoiceLine: false,
    confetti: false,
    glowColor: '#EAB308', // amber
  },
  7: {
    title: 'WEEK WARRIOR',
    flameCount: 2,
    flameSize: 100,
    badgeSize: 140,
    hasVoiceLine: false,
    confetti: true,
    glowColor: '#F97316', // orange
  },
  14: {
    title: 'FORTNIGHT CHAMPION',
    flameCount: 3,
    flameSize: 110,
    badgeSize: 160,
    hasVoiceLine: false,
    confetti: true,
    glowColor: '#EC4899', // pink
  },
  30: {
    title: 'LEGENDARY 30 DAYS',
    flameCount: 5,
    flameSize: 120,
    badgeSize: 180,
    hasVoiceLine: true,
    confetti: true,
    glowColor: '#8B5CF6', // purple
  },
  60: {
    title: 'HALL OF FAME',
    flameCount: 7,
    flameSize: 130,
    badgeSize: 200,
    hasVoiceLine: true,
    confetti: true,
    glowColor: '#14B8A6', // teal
  },
  100: {
    title: 'CENTURY MASTER',
    flameCount: 10,
    flameSize: 150,
    badgeSize: 220,
    hasVoiceLine: true,
    confetti: true,
    glowColor: '#F59E0B', // gold
  },
};

export const StreakMilestoneCeremony: React.FC<StreakMilestoneCeremonyProps> = ({
  payload,
  onComplete,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const milestone = payload.milestone as MilestoneTier;
  const config = MILESTONE_CONFIGS[milestone];

  const [showTapToContinue, setShowTapToContinue] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  // Animation values
  const badgeScale = useSharedValue(0);
  const badgeRotate = useSharedValue(180);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const flameScale = useSharedValue(0);
  const glowIntensity = useSharedValue(0);
  const screenPulse = useSharedValue(0);

  useEffect(() => {
    runCeremony();
  }, []);

  const runCeremony = async () => {
    // Trigger streak milestone haptic on mount
    void streakMilestone(milestone);

    // Initial delay
    await delay(200);

    // Badge flips in from back
    badgeRotate.value = withSpring(0, { damping: 15, stiffness: 100 });
    badgeScale.value = withSpring(1, { damping: 12, stiffness: 80 });

    await delay(600);

    // Glow effect
    glowIntensity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0.6, { duration: 500 })
    );

    // Flame animation
    flameScale.value = withDelay(
      300,
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    // Title slides up
    await delay(400);
    titleOpacity.value = withTiming(1, { duration: 400 });
    titleTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });

    // Screen pulse for major milestones
    if (milestone >= 30) {
      screenPulse.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 300 }),
        withTiming(0.8, { duration: 200 }),
        withTiming(0, { duration: 300 })
      );
    }

    await delay(800);

    // Show rewards
    setShowRewards(true);

    await delay(1500);

    // Show tap to continue
    setShowTapToContinue(true);
  };

  const handleTap = () => {
    if (showTapToContinue) {
      onComplete();
    }
  };

  // PHASE 17.4: Streak milestone share handler
  const handleShareStreak = useCallback(async () => {
    try {
      const shareMessage = generateShareCaption({
        type: 'STREAK',
        username: payload.userId || 'VEX User',
        timestamp: Date.now(),
        milestoneDays: milestone,
        streakDays: payload.streakDays,
      } as VictoryCardData);

      await Share.share({
        message: shareMessage,
      });
    } catch (error) { captureSilentFailure(error, { feature: 'spectacle', operation: 'ui-fallback', type: 'ui' });
      // Silent fail - don't disrupt the ceremony
    }
  }, [milestone, payload.streakDays, payload.userId]);

  // Animated styles
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotateY: `${badgeRotate.value}deg` },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(screenPulse.value, [0, 1], [0, 0.3]),
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
        {/* Screen pulse overlay */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: config.glowColor,
            },
            pulseStyle,
          ]}
          pointerEvents="none"
        />

        {/* Glow background */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: config.badgeSize * 1.5,
              height: config.badgeSize * 1.5,
              borderRadius: (config.badgeSize * 1.5) / 2,
              backgroundColor: config.glowColor,
            },
            glowStyle,
          ]}
          pointerEvents="none"
        />

        {/* Flame circles */}
        <Box style={{ position: 'absolute' }} pointerEvents="none">
          {Array.from({ length: config.flameCount }).map((_, index) => {
            const angle = (index / config.flameCount) * 2 * Math.PI - Math.PI / 2;
            const radius = config.badgeSize * 0.6;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <Animated.View
                key={index}
                style={[
                  flameStyle,
                  {
                    position: 'absolute',
                    left: SCREEN_WIDTH / 2 - config.flameSize / 2 + x,
                    top: -config.flameSize / 2 + y,
                  },
                ]}
              >
                <Box
                  width={config.flameSize}
                  height={config.flameSize}
                  borderRadius={config.flameSize / 2}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text style={{ fontSize: config.flameSize * 0.6 }}>🔥</Text>
                </Box>
              </Animated.View>
            );
          })}
        </Box>

        {/* Badge */}
        <Animated.View style={badgeStyle}>
          <Box
            width={config.badgeSize}
            height={config.badgeSize}
            borderRadius={config.badgeSize / 2}
            bg={theme.colors.background.secondary}
            alignItems="center"
            justifyContent="center"
            style={{
              borderWidth: 4,
              borderColor: config.glowColor,
              shadowColor: config.glowColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <Text
              variant="hero"
              color={config.glowColor}
              style={{ fontSize: config.badgeSize * 0.5 }}
            >
              {milestone}
            </Text>
            <Text variant="caption" color={theme.colors.text.secondary}>
              DAYS
            </Text>
          </Box>
        </Animated.View>

        {/* Title */}
        <Animated.View style={titleStyle}>
          <Box alignItems="center" mt={8}>
            <Text
              variant="h1"
              color={config.glowColor}
              style={{
                textShadowColor: config.glowColor,
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 10,
              }}
            >
              {config.title}
            </Text>
            <Text variant="bodyLarge" color={theme.colors.text.secondary} mt={2}>
              Streak milestone reached!
            </Text>
          </Box>
        </Animated.View>

        {/* AI Coach Voice Line (for 30+ days) */}
        {config.hasVoiceLine && (
          <Animated.View entering={FadeInUp.delay(1000)}>
            <Box
              mt={6}
              px={6}
              py={4}
              borderRadius={16}
              bg={theme.colors.background.secondary}
              style={{
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.primary[500],
              }}
            >
              <Text variant="body" color={theme.colors.text.primary}>
                "Incredible dedication! {milestone} days of focus is no small feat."
              </Text>
              <Text variant="caption" color={theme.colors.text.tertiary} mt={1}>
                — Your AI Coach
              </Text>
            </Box>
          </Animated.View>
        )}

        {/* Rewards */}
        {showRewards && (
          <Animated.View entering={FadeInUp} style={{ marginTop: 32 }}>
            <Box alignItems="center">
              <Text variant="h4" color={theme.colors.text.primary} mb={4}>
                Milestone Rewards
              </Text>
              <Box flexDirection="row" flexWrap="wrap" justifyContent="center" gap={3} maxWidth={300}>
                {(payload.rewards ?? []).map((reward, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInUp.delay(index * 100)}
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
                        borderColor: theme.colors.border.DEFAULT,
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>
                        {getRewardIcon(reward.type)}
                      </Text>
                      <Box ml={2}>
                        <Text variant="bodySmall" color={theme.colors.text.primary} fontWeight="bold">
                          {reward.amount ? `+${reward.amount}` : reward.itemId}
                        </Text>
                        <Text variant="caption" color={theme.colors.text.tertiary} style={{ textTransform: 'capitalize' }}>
                          {reward.type.toLowerCase()}
                        </Text>
                      </Box>
                    </Box>
                  </Animated.View>
                ))}
              </Box>
            </Box>
          </Animated.View>
        )}

        {/* Tap to continue with share button */}
        {showTapToContinue && (
          <Box position="absolute" bottom={40} alignItems="center" gap="md">
            {/* PHASE 17.4: Share Button */}
            <Animated.View entering={FadeInUp.delay(200)}>
              <Button variant="ghost" size="md" onPress={handleShareStreak}
  accessibilityLabel="Share Milestone button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                Share Milestone
              </Button>
            </Animated.View>
            <Animated.View entering={FadeIn}>
              <Text variant="caption" color={theme.colors.text.tertiary}>
                Tap anywhere to continue
              </Text>
            </Animated.View>
          </Box>
        )}

        {/* PHASE 18.3: Contextual paywall banner after 30+ day streak milestone */}
        {milestone >= 30 && (
          <ContextualPaywallBanner
            trigger="STREAK_MILESTONE"
            streakDays={milestone}
            onOpenPaywall={() => navigation.navigate('Paywall', { source: 'streak_milestone', gatedFeature: 'streak_insurance' })}
          />
        )}
      </Box>
    </Pressable>
  );
};

// Helper function to get reward icons
function getRewardIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'coins': return '🪙';
    case 'gems': return '💎';
    case 'title': return '🏆';
    case 'cosmetic': return '🎨';
    case 'streak_shield': return '🛡️';
    case 'item': return '🎁';
    default: return '✨';
  }
}

// Utility delay function
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
