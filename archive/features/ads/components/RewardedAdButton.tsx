/**
 * Rewarded Ad Button Component
 *
 * Optional rewarded ads with clear value exchange.
 * Users choose to watch ads for gems — never forced.
 *
 * Features:
 * - Daily limit enforcement
 * - Clear reward preview
 * - Cooldown between ads
 * - Remove ads purchase option for VIP
 *
 * Passes the test: "Would a free user feel like they're missing out?"
 * Answer: NO — because it's optional. Free users can still progress without ads.
 * But users who WANT gems will appreciate the option.
 *
 * This is ETHICAL monetization: value exchange, not coercion.
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { createDebugger } from '@/utils/debug';

const debug = createDebugger('ads:rewarded-button');

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import { capture } from '../../../shared/analytics';
import { EconomyEvents } from '../../../shared/analytics/analytics-events';
import { triggerHaptic } from '../../../utils/haptics';
import { usePremiumStatus } from '../../../shared/monetization';
import { createSheet } from '@/shared/ui/create-sheet';

// Rewarded ad configuration
const REWARDED_AD_CONFIG = {
  gemReward: 5,
  dailyLimit: 5,
  cooldownMinutes: 5,
} as const;

interface RewardedAdButtonProps {
  /** Number of ads watched today */
  adsWatchedToday: number;
  /** Timestamp of last ad watched */
  lastAdTimestamp?: Date;
  /** Callback when user chooses to watch ad */
  onWatchAd: () => Promise<boolean>;
  /** Callback to open remove ads paywall */
  onRemoveAds?: () => void;
  /** Optional compact mode for inline display */
  compact?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

export function RewardedAdButton({
  adsWatchedToday,
  lastAdTimestamp,
  onWatchAd,
  onRemoveAds,
  compact = false,
  isLoading = false,
}: RewardedAdButtonProps): JSX.Element | null {
  const { theme } = useTheme();
  const { colors } = theme;
  const { isPremium } = usePremiumStatus();

  const [isWatching, setIsWatching] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Pulsing animation for availability
  const pulseScale = useSharedValue(1);
  const shimmerTranslate = useSharedValue(-100);

  // Check if user is on cooldown
  const isOnCooldown = useMemo(() => {
    if (!lastAdTimestamp) {return false;}
    const cooldownEnd = new Date(
      lastAdTimestamp.getTime() + REWARDED_AD_CONFIG.cooldownMinutes * 60 * 1000
    );
    return new Date() < cooldownEnd;
  }, [lastAdTimestamp]);

  // Check if daily limit reached
  const isLimitReached = adsWatchedToday >= REWARDED_AD_CONFIG.dailyLimit;

  // Calculate remaining ads
  const remainingAds = Math.max(0, REWARDED_AD_CONFIG.dailyLimit - adsWatchedToday);

  // Update countdown timer
  useEffect(() => {
    if (!isOnCooldown || !lastAdTimestamp) {
      setTimeUntilNext(null);
      return;
    }

    const updateTimer = () => {
      const cooldownEnd = new Date(
        lastAdTimestamp.getTime() + REWARDED_AD_CONFIG.cooldownMinutes * 60 * 1000
      );
      const diff = cooldownEnd.getTime() - new Date().getTime();

      if (diff <= 0) {
        setTimeUntilNext(null);
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilNext(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOnCooldown, lastAdTimestamp]);

  // Animation when available
  useEffect(() => {
    if (!isLimitReached && !isOnCooldown && !isWatching && !showSuccess) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
      shimmerTranslate.value = withRepeat(
        withTiming(300, { duration: 2000 }),
        -1,
        false
      );
    } else {
      pulseScale.value = 1;
    }
  }, [isLimitReached, isOnCooldown, isWatching, showSuccess, pulseScale, shimmerTranslate]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslate.value }],
  }));

  // Premium users don't see ads
  if (isPremium) {
    return null;
  }

  const handleWatchAd = async () => {
    if (isLimitReached || isOnCooldown || isWatching) {return;}

    setIsWatching(true);
    triggerHaptic('impactMedium');

    capture(EconomyEvents.PURCHASE_STARTED, {
      source: 'rewarded_ad',
      currency_type: 'gems',
      amount: REWARDED_AD_CONFIG.gemReward,
    });

    try {
      const success = await onWatchAd();

      if (success) {
        setShowSuccess(true);
        triggerHaptic('success');

        capture(EconomyEvents.CURRENCY_EARNED, {
          source: 'rewarded_ad',
          currency_type: 'gems',
          amount: REWARDED_AD_CONFIG.gemReward,
        });

        // Hide success after delay
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      } else {
        triggerHaptic('error');
      }
    } catch (error) {
      triggerHaptic('error');
      debug.error('Rewarded ad failed', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsWatching(false);
    }
  };

  // Compact inline version
  if (compact) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={pulseStyle}>
        <Pressable
          onPress={handleWatchAd}
          disabled={isLimitReached || isOnCooldown || isWatching}
          style={[
            styles.compactButton,
            {
              backgroundColor: isLimitReached
                ? colors.background.tertiary
                : isOnCooldown
                  ? colors.background.secondary
                  : 'rgba(59, 130, 246, 0.15)',
              borderColor: isLimitReached
                ? colors.border.DEFAULT
                : isOnCooldown
                  ? colors.border.DEFAULT
                  : '#3B82F6',
              borderWidth: 1.5,
              opacity: isLimitReached ? 0.6 : isOnCooldown ? 0.7 : 1,
            },
          ]}

        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control">
          {/* Shimmer effect when available */}
          {!isLimitReached && !isOnCooldown && !isWatching && (
            <Animated.View style={[styles.shimmer, shimmerStyle]}>
              <View
                style={[
                  styles.shimmerGradient,
                  { backgroundColor: 'rgba(255,255,255,0.3)' },
                ]}
              />
            </Animated.View>
          )}

          <View style={styles.compactContent}>
            <Text style={styles.adIcon}>📺</Text>
            <View style={styles.compactText}>
              {showSuccess ? (
                <Text variant="bodySmall" fontWeight="700" color="success.DEFAULT">
                  ✓ +{REWARDED_AD_CONFIG.gemReward} gems!
                </Text>
              ) : isWatching ? (
                <Text variant="bodySmall" color="text.secondary">
                  Playing ad...
                </Text>
              ) : isLimitReached ? (
                <Text variant="bodySmall" color="text.tertiary">
                  Daily limit reached
                </Text>
              ) : isOnCooldown ? (
                <Text variant="bodySmall" color="text.secondary">
                  Wait {timeUntilNext}
                </Text>
              ) : (
                <>
                  <Text variant="bodySmall" fontWeight="700" color="#3B82F6">
                    Watch ad: +{REWARDED_AD_CONFIG.gemReward} 💎
                  </Text>
                  <Text variant="caption" color="text.tertiary">
                    {remainingAds} remaining today
                  </Text>
                </>
              )}
            </View>
            {!isLimitReached && !isOnCooldown && !isWatching && !showSuccess && (
              <Text style={styles.playIcon}>▶</Text>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // Full card version
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <Animated.View style={[styles.card, pulseStyle]}>
        {/* Shimmer effect when available */}
        {!isLimitReached && !isOnCooldown && !isWatching && !showSuccess && (
          <Animated.View style={[styles.cardShimmer, shimmerStyle]}>
            <View
              style={[
                styles.cardShimmerGradient,
                { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
            />
          </Animated.View>
        )}

        <View
          style={[
            styles.cardInner,
            {
              backgroundColor: isLimitReached
                ? colors.background.secondary
                : isOnCooldown
                  ? colors.background.secondary
                  : 'rgba(59, 130, 246, 0.08)',
              borderColor: isLimitReached
                ? colors.border.DEFAULT
                : isOnCooldown
                  ? colors.border.DEFAULT
                  : '#3B82F6',
              borderWidth: isLimitReached ? 1 : 2,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.headerIcon}>📺</Text>
            </View>
            <View style={styles.headerText}>
              <Text variant="h4" fontSize={18} color="text.primary">
                {showSuccess ? 'Gems Earned!' : 'Free Gems'}
              </Text>
              <Text variant="bodySmall" color="text.secondary">
                {showSuccess
                  ? `+${REWARDED_AD_CONFIG.gemReward} gems added!`
                  : isLimitReached
                    ? 'Come back tomorrow for more'
                    : isOnCooldown
                      ? `Wait ${timeUntilNext}`
                      : 'Watch a short ad to earn gems'}
              </Text>
            </View>
          </View>

          {/* Progress indicator */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              {Array.from({ length: REWARDED_AD_CONFIG.dailyLimit }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor:
                        i < adsWatchedToday ? '#3B82F6' : colors.background.tertiary,
                    },
                  ]}
                />
              ))}
            </View>
            <Text variant="caption" color="text.tertiary">
              {adsWatchedToday} / {REWARDED_AD_CONFIG.dailyLimit} today
            </Text>
          </View>

          {/* Action button */}
          <View style={styles.actionSection}>
            {showSuccess ? (
              <View style={[styles.successBadge, { backgroundColor: colors.success.DEFAULT }]}>
                <Text style={styles.successText}>✓ Reward Claimed</Text>
              </View>
            ) : (
              <Button
                onPress={handleWatchAd}
                variant="primary"
                size="md"
                fullWidth
                isDisabled={isLimitReached || isOnCooldown || isWatching}
                isLoading={isWatching}
                haptic={isLimitReached || isOnCooldown ? 'none' : 'medium'}
                style={{
                  backgroundColor:
                    isLimitReached || isOnCooldown ? colors.background.tertiary : '#3B82F6',
                }}

              accessibilityLabel="` : `Watch Ad (+$ 💎)`} button"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
                {isWatching
                  ? 'Loading ad...'
                  : isLimitReached
                    ? 'Daily Limit Reached'
                    : isOnCooldown
                      ? `Wait ${timeUntilNext}`
                      : `Watch Ad (+${REWARDED_AD_CONFIG.gemReward} 💎)`}
              </Button>
            )}
          </View>

          {/* Remove ads upsell */}
          {onRemoveAds && (
            <Pressable onPress={onRemoveAds} style={styles.removeAdsRow}
  accessibilityLabel="Want unlimited gems? Upgrade to VIP → button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              <Text variant="caption" color="text.tertiary">
                Want unlimited gems?{' '}
                <Text variant="caption" fontWeight="600" color="primary.500">
                  Upgrade to VIP →
                </Text>
              </Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  cardShimmerGradient: {
    width: 100,
    height: '100%',
    transform: [{ skewX: '-20deg' }],
  },
  cardInner: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 26,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  progressSection: {
    gap: 8,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  actionSection: {
    marginTop: 4,
  },
  successBadge: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  removeAdsRow: {
    alignItems: 'center',
    paddingTop: 8,
  },

  // Compact styles
  compactButton: {
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  shimmerGradient: {
    width: 50,
    height: '100%',
    transform: [{ skewX: '-20deg' }],
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adIcon: {
    fontSize: 20,
  },
  compactText: {
    flex: 1,
    gap: 2,
  },
  playIcon: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '700',
  },
});

export default RewardedAdButton;
