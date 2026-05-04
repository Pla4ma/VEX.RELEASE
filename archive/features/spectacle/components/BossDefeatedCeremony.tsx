import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * BossDefeatedCeremony
 *
 * Full-screen celebration for boss defeat.
 * 5-phase animated ceremony with boss defeat animation,
 * victory text, reward explosion, and contributor board.
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
  runOnJS,
  FadeInUp,
} from 'react-native-reanimated';
import { Box, Text, Button } from '@/components/primitives';
import { useTheme } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { bossDefeated } from '../../../utils/haptics';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import type { BossDefeatedPayload } from '../types';
import type { ExtendedRootStackParams } from '../../../navigation/types';

// PHASE 17.3: VictoryCard imports for sharing
import { generateShareCaption, type VictoryCardData } from '../../social/components/VictoryCard';
// PHASE 18.3: Contextual paywall trigger
import { ContextualPaywallBanner } from '../../../shared/monetization/components/ContextualPaywallBanner';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type CeremonyPhase = 'boss-defeat' | 'victory-text' | 'rewards' | 'contributors' | 'complete';

interface BossDefeatedCeremonyProps {
  payload: BossDefeatedPayload;
  onComplete: () => void;
}

export const BossDefeatedCeremony: React.FC<BossDefeatedCeremonyProps> = ({
  payload,
  onComplete,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const { isReducedMotion } = useReducedMotion();
  const [phase, setPhase] = useState<CeremonyPhase>('boss-defeat');
  const [tapToContinueVisible, setTapToContinueVisible] = useState(false);

  // Animation values
  const bossScale = useSharedValue(1);
  const bossShake = useSharedValue(0);
  const bossOpacity = useSharedValue(1);
  const victoryScale = useSharedValue(0);
  const victoryOpacity = useSharedValue(0);
  const rewardsContainerOpacity = useSharedValue(0);
  const contributorsOpacity = useSharedValue(0);
  const screenFlash = useSharedValue(0);

  // Phase timings (in milliseconds)
  const PHASE_DURATION = {
    'boss-defeat': 1500,
    'victory-text': 1500,
    'rewards': 1500,
    'contributors': 1500,
    'complete': 500,
  };

  useEffect(() => {
    void runCeremony();
  }, [isReducedMotion]);

  const runCeremony = async (): Promise<void> => {
    if (isReducedMotion) {
      setPhase('complete');
      bossScale.value = 1;
      bossShake.value = 0;
      bossOpacity.value = 0;
      victoryScale.value = 1;
      victoryOpacity.value = 0;
      rewardsContainerOpacity.value = 0;
      contributorsOpacity.value = 0;
      screenFlash.value = 0;
      setTapToContinueVisible(true);
      return;
    }

    // Phase 1: Boss defeat animation (0-1.5s)
    setPhase('boss-defeat');

    // Boss shake animation
    bossShake.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    // Flash effect
    screenFlash.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 300 })
    );

    // Boss scale down and fade
    await delay(800);
    bossScale.value = withSpring(0.3, { damping: 10 });
    bossOpacity.value = withTiming(0, { duration: 400 });

    await delay(700);

    // Phase 2: Victory text (1.5-3s)
    setPhase('victory-text');
    // Trigger boss defeated haptic at phase transition
    void bossDefeated();
    victoryScale.value = withSpring(1.2, { damping: 8, stiffness: 100 });
    victoryOpacity.value = withTiming(1, { duration: 300 });

    await delay(PHASE_DURATION['victory-text']);

    // Phase 3: Reward explosion (3-4.5s)
    setPhase('rewards');
    victoryScale.value = withTiming(0.8, { duration: 300 });
    rewardsContainerOpacity.value = withTiming(1, { duration: 500 });

    await delay(PHASE_DURATION.rewards);

    // Phase 4: Contributors (4.5-6s)
    setPhase('contributors');
    victoryOpacity.value = withTiming(0, { duration: 300 });
    rewardsContainerOpacity.value = withTiming(0.3, { duration: 300 });
    contributorsOpacity.value = withTiming(1, { duration: 500 });

    await delay(PHASE_DURATION.contributors);

    // Phase 5: Complete
    setPhase('complete');
    setTapToContinueVisible(true);
  };

  const handleTap = (): void => {
    if (phase === 'complete') {
      onComplete();
    }
  };

  // PHASE 17.3: Boss defeat share handler
  const handleShareBossDefeat = useCallback(async () => {
    try {
      const userContribution = payload.contributors.find(c => c.damageContribution > 0);
      const shareMessage = generateShareCaption({
        type: 'BOSS',
        username: userContribution?.displayName || 'VEX User',
        timestamp: Date.now(),
        bossName: payload.bossName,
        damageDealt: userContribution?.damageContribution || payload.damageDealt,
      } as VictoryCardData);

      await Share.share({
        message: shareMessage,
      });
    } catch (error) { captureSilentFailure(error, { feature: 'spectacle', operation: 'ui-fallback', type: 'ui' });
      // Silent fail - don't disrupt the ceremony
    }
  }, [payload.bossName, payload.contributors, payload.damageDealt]);

  // Animated styles
  const bossAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bossScale.value },
      { translateX: bossShake.value },
    ],
    opacity: bossOpacity.value,
  }));

  const victoryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: victoryScale.value }],
    opacity: victoryOpacity.value,
  }));

  const rewardsStyle = useAnimatedStyle(() => ({
    opacity: rewardsContainerOpacity.value,
  }));

  const contributorsStyle = useAnimatedStyle(() => ({
    opacity: contributorsOpacity.value,
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: screenFlash.value,
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
        {/* Flash overlay */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.colors.warning.DEFAULT,
            },
            flashStyle,
          ]}
          pointerEvents="none"
        />

        {/* Phase 1: Boss Character */}
        {phase === 'boss-defeat' && (
          <Animated.View style={bossAnimatedStyle}>
            <Box alignItems="center" justifyContent="center">
              {/* Boss representation */}
              <Box
                width={160}
                height={160}
                borderRadius={80}
                bg={theme.colors.error.DEFAULT}
                alignItems="center"
                justifyContent="center"
                style={{
                  borderWidth: 4,
                  borderColor: theme.colors.error.dark,
                }}
              >
                <Text variant="hero" color={theme.colors.text.inverse}>
                  👹
                </Text>
              </Box>
              <Box mt={4}>
                <Text variant="h2" color={theme.colors.text.primary}>
                  {payload.bossName}
                </Text>
              </Box>
            </Box>
          </Animated.View>
        )}

        {/* Phase 2: Victory Text */}
        {(phase === 'victory-text' || phase === 'rewards') && (
          <Animated.View style={victoryStyle}>
            <Box alignItems="center">
              <Text
                variant="hero"
                color={theme.colors.warning.DEFAULT}
                style={{
                  fontSize: 56,
                  textShadowColor: 'rgba(234, 179, 8, 0.5)',
                  textShadowOffset: { width: 0, height: 4 },
                  textShadowRadius: 20,
                }}
              >
                BOSS DEFEATED!
              </Text>
              <Text variant="h3" color={theme.colors.text.secondary} mt={2}>
                Victory is yours!
              </Text>
            </Box>
          </Animated.View>
        )}

        {/* Phase 3: Rewards Explosion */}
        {(phase === 'rewards' || phase === 'contributors') && (
          <Animated.View style={[rewardsStyle, { position: 'absolute' }]}>
            <Box alignItems="center" gap={4}>
              <Text variant="h3" color={theme.colors.text.primary}>
                Rewards Earned
              </Text>
              <Box flexDirection="row" flexWrap="wrap" justifyContent="center" gap={3} maxWidth={300}>
                {payload.rewards.map((reward, index) => (
                  <RewardItem
                    key={index}
                    type={reward.type}
                    amount={reward.amount}
                    rarity={reward.rarity}
                    delay={index * 150}
                  />
                ))}
              </Box>

              {/* PHASE 12.3: Boss Drop */}
              {payload.bossDrop && (
                <Box mt={6} alignItems="center">
                  <BossDropItem drop={payload.bossDrop} delay={payload.rewards.length * 150} />
                </Box>
              )}
            </Box>
          </Animated.View>
        )}

        {/* Phase 4: Contributors Board */}
        {phase === 'contributors' && (
          <Animated.View style={[contributorsStyle, { position: 'absolute', bottom: 100 }]}>
            <Box alignItems="center" width={SCREEN_WIDTH - 48}>
              <Text variant="h4" color={theme.colors.text.primary} mb={4}>
                Damage Contributors
              </Text>
              <Box flexDirection="column" gap={2} width="100%">
                {payload.contributors.map((contributor, index) => (
                  <ContributorRow
                    key={contributor.userId}
                    contributor={contributor}
                    delay={index * 200}
                    theme={theme}
                  />
                ))}
              </Box>
              <Box mt={6} alignItems="center">
                <Text variant="bodySmall" color={theme.colors.text.tertiary}>
                  Total Damage: {payload.damageDealt.toLocaleString()}
                </Text>
              </Box>
            </Box>
          </Animated.View>
        )}

        {/* Phase 5: Tap to continue with share button */}
        {tapToContinueVisible && (
          <Box position="absolute" bottom={40} alignItems="center" gap="md">
            {/* PHASE 17.3: Share Button */}
            <Animated.View entering={isReducedMotion ? undefined : FadeInUp.delay(200)}>
              <Button variant="ghost" size="md" onPress={handleShareBossDefeat}
  accessibilityLabel="Share Victory button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                Share Victory
              </Button>
            </Animated.View>
            <Text variant="caption" color={theme.colors.text.tertiary}>
              Tap anywhere to continue
            </Text>
          </Box>
        )}

        {/* PHASE 18.3: Contextual paywall banner after boss defeat */}
        <ContextualPaywallBanner
          trigger="BOSS_DEFEAT"
          nextBossTier={payload.nextBossTier}
          onOpenPaywall={() => navigation.navigate('Paywall', { source: 'boss_defeat', gatedFeature: 'next_boss_tier' })}
        />
      </Box>
    </Pressable>
  );
};

// Reward item component with animation
interface RewardItemProps {
  type: string;
  amount: number;
  rarity: string;
  delay: number;
}

const RewardItem: React.FC<RewardItemProps> = ({ type, amount, rarity, delay }) => {
  const { theme } = useTheme();
  const scale = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 100 })
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 12, stiffness: 100 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const getRarityColor = (r: string) => {
    switch (r) {
      case 'LEGENDARY': return '#F97316'; // orange
      case 'EPIC': return '#A855F7'; // purple
      case 'RARE': return '#3B82F6'; // blue
      case 'UNCOMMON': return '#22C55E'; // green
      default: return theme.colors.text.secondary;
    }
  };

  const getIcon = (t: string) => {
    switch (t.toLowerCase()) {
      case 'xp': return '⭐';
      case 'coins': return '🪙';
      case 'gems': return '💎';
      default: return '🎁';
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Box
        flexDirection="row"
        alignItems="center"
        bg={theme.colors.background.secondary}
        px={4}
        py={3}
        borderRadius={12}
        style={{
          borderWidth: 2,
          borderColor: getRarityColor(rarity),
        }}
      >
        <Text style={{ fontSize: 24 }}>{getIcon(type)}</Text>
        <Box ml={2}>
          <Text variant="body" color={theme.colors.text.primary} fontWeight="bold">
            +{amount.toLocaleString()}
          </Text>
          <Text variant="caption" color={getRarityColor(rarity)} style={{ textTransform: 'capitalize' }}>
            {rarity.toLowerCase()}
          </Text>
        </Box>
      </Box>
    </Animated.View>
  );
};

// PHASE 12.3: Boss Drop component
interface BossDropItemProps {
  drop: {
    itemId: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
    type: 'CONSUMABLE' | 'COSMETIC' | 'BADGE';
  };
  delay: number;
}

const BossDropItem: React.FC<BossDropItemProps> = ({ drop, delay }) => {
  const { theme } = useTheme();
  const scale = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 100 })
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 12, stiffness: 100 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const getRarityColor = (r: string) => {
    switch (r) {
      case 'LEGENDARY': return '#F97316'; // orange
      case 'EPIC': return '#A855F7'; // purple
      case 'RARE': return '#3B82F6'; // blue
      case 'UNCOMMON': return '#22C55E'; // green
      default: return theme.colors.text.secondary;
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Box alignItems="center">
        <Text variant="caption" color={theme.colors.text.tertiary} mb={2}>
          ⚔️ BOSS DROP
        </Text>
        <Box
          flexDirection="row"
          alignItems="center"
          bg={theme.colors.background.secondary}
          px={6}
          py={4}
          borderRadius={16}
          style={{
            borderWidth: 3,
            borderColor: getRarityColor(drop.rarity),
            shadowColor: getRarityColor(drop.rarity),
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 40 }}>{drop.icon}</Text>
          <Box ml={4}>
            <Text variant="h4" color={theme.colors.text.primary} fontWeight="bold">
              {drop.name}
            </Text>
            <Text variant="caption" color={getRarityColor(drop.rarity)} style={{ textTransform: 'capitalize' }}>
              {drop.rarity} {drop.type}
            </Text>
            <Box maxWidth={200}>
              <Text variant="caption" color={theme.colors.text.secondary} mt={1}>
                {drop.description}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
};

// Contributor row component
interface ContributorRowProps {
  contributor: {
    userId: string;
    displayName: string;
    avatarUrl?: string;
    damageContribution: number;
  };
  delay: number;
  theme: ReturnType<typeof useTheme>['theme'];
}

const ContributorRow: React.FC<ContributorRowProps> = ({ contributor, delay, theme }) => {
  const translateX = useSharedValue(-50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(
      delay,
      withSpring(0, { damping: 12, stiffness: 100 })
    );
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
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
          <Text variant="body" color={theme.colors.text.primary}>
            {contributor.displayName}
          </Text>
        </Box>
        <Text variant="body" color={theme.colors.primary[500]} fontWeight="bold">
          {contributor.damageContribution.toLocaleString()} DMG
        </Text>
      </Box>
    </Animated.View>
  );
};

// Utility function for delays
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
