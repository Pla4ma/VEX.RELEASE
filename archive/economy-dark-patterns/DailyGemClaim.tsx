/**
 * Daily Gem Claim Component
 *
 * VIP-only daily gem collection component for home screen.
 * Features pulsing gem animation, claim interaction, and
 * visual feedback when gems are claimed.
 *
 * FOMO Engineering:
 * - Shows "CLAIM" prominently before claiming
 * - Animated gem flies to wallet after claim
 * - "Come back tomorrow" creates anticipation
 * - Missing a day = lost gems = FOMO
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('monetization:daily-gem-claim');
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { capture } from '../../analytics';
import { EconomyEvents } from '../../analytics/analytics-events';
import { triggerHaptic } from '../../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Daily gem amount for VIP
const DAILY_GEM_AMOUNT = 10;

interface DailyGemClaimProps {
  /** VIP status - only shown when true */
  isVip: boolean;
  /** Whether today's gems have been claimed */
  hasClaimedToday: boolean;
  /** Timestamp of last claim */
  lastClaimTime?: Date;
  /** Callback when gems are claimed */
  onClaim: () => Promise<boolean>;
  /** Callback to trigger wallet animation (gem fly) */
  onGemFly?: (startX: number, startY: number) => void;
  /** Current gem count for display */
  currentGemCount?: number;
  /** Loading state */
  isLoading?: boolean;
}

export function DailyGemClaim({
  isVip,
  hasClaimedToday,
  lastClaimTime,
  onClaim,
  onGemFly,
  currentGemCount = 0,
  isLoading = false,
}: DailyGemClaimProps): JSX.Element | null {
  const { theme } = useTheme();
  const { colors } = theme;

  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(hasClaimedToday);
  const [showClaimedSuccess, setShowClaimedSuccess] = useState(false);

  // Animations
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  const gemRotation = useSharedValue(0);
  const gemScale = useSharedValue(1);
  const gemFloat = useSharedValue(0);
  const containerScale = useSharedValue(1);
  const shimmerTranslate = useSharedValue(-SCREEN_WIDTH);

  // Initialize claim state from props
  useEffect(() => {
    setIsClaimed(hasClaimedToday);
  }, [hasClaimedToday]);

  // Pulsing animation when unclaimed
  useEffect(() => {
    if (!isClaimed && !isClaiming) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.7, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
      pulseOpacity.value = 1;
    }
  }, [isClaimed, isClaiming, pulseScale, pulseOpacity]);

  // Gem floating animation
  useEffect(() => {
    gemFloat.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [gemFloat]);

  // Shimmer effect for claim button
  useEffect(() => {
    if (!isClaimed) {
      shimmerTranslate.value = withRepeat(
        withTiming(SCREEN_WIDTH * 1.5, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [isClaimed, shimmerTranslate]);

  const handleClaim = useCallback(async () => {
    if (isClaimed || isClaiming || isLoading) {return;}

    setIsClaiming(true);

    // Haptic feedback
    await triggerHaptic('impactMedium');

    // Animate gem
    gemScale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );

    gemRotation.value = withSequence(
      withTiming(360, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 0 })
    );

    try {
      const success = await onClaim();

      if (success) {
        setIsClaimed(true);
        setShowClaimedSuccess(true);

        // Success haptic
        await triggerHaptic('success');

        // Trigger fly animation to wallet
        // We pass approximate coordinates - parent should measure actual wallet position
        onGemFly?.(SCREEN_WIDTH / 2, 100);

        // Analytics
        capture(EconomyEvents.REWARD_CLAIMED, {
          currency_type: 'gems',
          amount: DAILY_GEM_AMOUNT,
          balance_after: currentGemCount + DAILY_GEM_AMOUNT,
          source: 'vip_daily',
          item_type: 'vip_daily_gems',
        });

        // Hide success state after delay
        setTimeout(() => {
          setShowClaimedSuccess(false);
        }, 2000);
      } else {
        await triggerHaptic('error');
      }
    } catch (error) {
      await triggerHaptic('error');
      debug.error('Failed to claim daily gems', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsClaiming(false);
    }
  }, [isClaimed, isClaiming, isLoading, onClaim, onGemFly, currentGemCount, gemScale, gemRotation]);

  const handlePressIn = () => {
    containerScale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    containerScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const gemAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${gemRotation.value}deg` },
      { scale: gemScale.value },
      { translateY: gemFloat.value },
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslate.value }],
  }));

  // Don't render if not VIP
  if (!isVip) {
    return null;
  }

  // Time until next claim (for "come back tomorrow" text)
  const getTimeUntilTomorrow = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const hours = Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
    return hours;
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <Pressable
        onPress={handleClaim}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isClaimed || isClaiming || isLoading}
        style={[
          styles.card,
          {
            backgroundColor: isClaimed
              ? colors.background.secondary
              : 'rgba(255, 215, 0, 0.12)',
            borderColor: isClaimed ? colors.border.DEFAULT : '#FFD700',
            borderWidth: isClaimed ? 1 : 2,
            opacity: isClaimed ? 0.8 : 1,
          },
        ]}

      accessibilityLabel="Interactive control"
      accessibilityRole="button"
      accessibilityHint="Activates this control">
        {/* Shimmer effect for unclaimed state */}
        {!isClaimed && !isClaiming && (
          <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
            <LinearGradient
              colors={[
                'transparent',
                'rgba(255, 255, 255, 0.3)',
                'transparent',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.shimmer}
            />
          </Animated.View>
        )}

        <View style={styles.content}>
          {/* Gem Icon */}
          <Animated.View
            style={[
              styles.gemContainer,
              !isClaimed && pulseAnimatedStyle,
            ]}
          >
            <Animated.Text style={[styles.gemEmoji, gemAnimatedStyle]}>
              {showClaimedSuccess ? '✨' : '💎'}
            </Animated.Text>
            {!isClaimed && (
              <View style={styles.gemGlow}>
                <View style={[styles.glowRing, { borderColor: '#FFD700' }]} />
              </View>
            )}
          </Animated.View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            {isClaimed ? (
              // Claimed State
              <>
                <Text
                  variant="bodySmall"
                  fontWeight="600"
                  color="text.secondary"
                  style={styles.claimedLabel}
                >
                  Claimed today
                </Text>
                <Text variant="body" fontWeight="700" color="text.primary">
                  Come back in {getTimeUntilTomorrow()}h
                </Text>
                <Text variant="caption" color="text.tertiary" style={styles.dailyTotal}>
                  +{DAILY_GEM_AMOUNT} gems added to your wallet
                </Text>
              </>
            ) : isClaiming ? (
              // Claiming State
              <>
                <Text variant="body" fontWeight="700" color="#FFD700">
                  Claiming...
                </Text>
                <Text variant="bodySmall" color="text.secondary">
                  Adding {DAILY_GEM_AMOUNT} gems
                </Text>
              </>
            ) : (
              // Unclaimed State
              <>
                <View style={styles.unclaimedHeader}>
                  <Text variant="body" fontWeight="800" color="#FFD700">
                    CLAIM
                  </Text>
                  <View style={styles.vipBadge}>
                    <Text style={styles.vipBadgeText}>VIP</Text>
                  </View>
                </View>
                <Text variant="bodySmall" color="text.secondary">
                  {DAILY_GEM_AMOUNT} gems waiting
                </Text>
                <Text variant="caption" color="text.tertiary" style={styles.monthlyValue}>
                  300 gems/month = 3 premium chests
                </Text>
              </>
            )}
          </View>

          {/* Right Action Indicator */}
          <View style={styles.actionIndicator}>
            {isClaimed ? (
              <View style={[styles.checkmark, { backgroundColor: colors.success.DEFAULT }]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            ) : isClaiming ? (
              <ActivityIndicator color="#FFD700" size="small" />
            ) : (
              <View style={styles.claimArrow}>
                <Text style={[styles.arrowText, { color: '#FFD700' }]}>›</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>

      {/* FOMO warning for missed days */}
      {isClaimed && lastClaimTime && (
        <Text variant="caption" color="text.tertiary" style={styles.fomoText}>
          Don't miss tomorrow — that's {DAILY_GEM_AMOUNT} free gems
        </Text>
      )}
    </Animated.View>
  );
}

// Import LinearGradient for shimmer
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';

const styles = createSheet({
  container: {
    width: '100%',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
  },
  shimmer: {
    width: 100,
    height: '100%',
    transform: [{ skewX: '-20deg' }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  gemContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gemEmoji: {
    fontSize: 32,
    zIndex: 2,
  },
  gemGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    opacity: 0.4,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  unclaimedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vipBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vipBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },
  monthlyValue: {
    marginTop: 2,
  },
  claimedLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dailyTotal: {
    marginTop: 2,
  },
  actionIndicator: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  claimArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: -2,
  },
  fomoText: {
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default DailyGemClaim;
