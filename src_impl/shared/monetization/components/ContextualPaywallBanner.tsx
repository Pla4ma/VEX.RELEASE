import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * ContextualPaywallBanner
 *
 * PHASE 18.3: Non-intrusive paywall triggers that appear after key moments.
 * Maximum 1 suggestion per 48 hours per user.
 *
 * Trigger points:
 * - After boss defeat: "Get Premium to unlock the next boss tier immediately"
 * - After 30-day streak: "Premium users get Streak Insurance — protect this streak"
 * - After S grade: "Premium users get 1.1× XP on every session"
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { MMKVStorageAdapter } from '../../../persistence/MMKVStorageAdapter';
import { useTheme } from '../../../theme';
import { usePremiumStatus } from '../use-revenuecat';

/** Rate limit: 48 hours in milliseconds */
const RATE_LIMIT_MS = 48 * 60 * 60 * 1000;

/** Storage key for last shown timestamp */
const STORAGE_KEY = 'vex_contextual_paywall_last_shown';
const paywallStorage = new MMKVStorageAdapter('contextual-paywall');

export type PaywallTriggerType = 'BOSS_DEFEAT' | 'STREAK_MILESTONE' | 'S_GRADE';

interface ContextualPaywallBannerProps {
  trigger: PaywallTriggerType;
  /** Boss tier to unlock (for BOSS_DEFEAT trigger) */
  nextBossTier?: number;
  /** Streak days (for STREAK_MILESTONE trigger) */
  streakDays?: number;
  /** XP that would have been earned with premium (for S_GRADE trigger) */
  bonusXp?: number;
  /** Callback when user taps to open paywall */
  onOpenPaywall: () => void;
  /** Callback when user dismisses the banner */
  onDismiss?: () => void;
}

interface TriggerMessage {
  emoji: string;
  headline: string;
  subtext: string;
}

function getTriggerMessage(
  trigger: PaywallTriggerType,
  nextBossTier?: number,
  streakDays?: number,
  bonusXp?: number
): TriggerMessage {
  switch (trigger) {
    case 'BOSS_DEFEAT':
      return {
        emoji: '⚔️',
        headline: 'Unlock the next boss tier immediately',
        subtext: `Premium users skip the wait and face Tier ${nextBossTier ?? '++'} bosses right away.`,
      };
    case 'STREAK_MILESTONE':
      return {
        emoji: '🛡️',
        headline: 'Protect this streak with Premium',
        subtext: `Streak Insurance covers ${streakDays ?? 'your'} days — one rough day won't erase your progress.`,
      };
    case 'S_GRADE':
      return {
        emoji: '⚡',
        headline: 'Premium users earn 1.1× XP every session',
        subtext: bonusXp
          ? `That session would have earned ${bonusXp} more XP with Premium.`
          : 'Multiply every focus session reward.',
      };
    default:
      return {
        emoji: '⭐',
        headline: 'Unlock Premium features',
        subtext: 'Get the most out of your focus sessions.',
      };
  }
}

/**
 * Check if banner can be shown based on rate limit (48h)
 */
async function canShowBanner(): Promise<boolean> {
  try {
    const lastShown = await paywallStorage.getItem(STORAGE_KEY);
    if (!lastShown) {return true;}

    const lastTimestamp = parseInt(lastShown, 10);
    const now = Date.now();
    return now - lastTimestamp >= RATE_LIMIT_MS;
  } catch (error) { captureSilentFailure(error, { feature: 'shared', operation: 'ui-fallback', type: 'ui' });
    // If storage fails, allow showing (graceful degradation)
    return true;
  }
}

/**
 * Record that banner was shown
 */
async function recordBannerShown(): Promise<void> {
  try {
    await paywallStorage.setItem(STORAGE_KEY, Date.now().toString());
  } catch (error) { captureSilentFailure(error, { feature: 'shared', operation: 'ui-fallback', type: 'ui' });
    // Silently fail - don't block UX if storage fails
  }
}

export function ContextualPaywallBanner({
  trigger,
  nextBossTier,
  streakDays,
  bonusXp,
  onOpenPaywall,
  onDismiss,
}: ContextualPaywallBannerProps): JSX.Element | null {
  const { theme } = useTheme();
  const { isPremium } = usePremiumStatus();
  const [visible, setVisible] = useState(false);
  const [canShow, setCanShow] = useState(false);

  // Check rate limit on mount
  useEffect(() => {
    const checkRateLimit = async () => {
      const allowed = await canShowBanner();
      setCanShow(allowed);
    };
    void checkRateLimit();
  }, []);

  // Show banner after a short delay if allowed and not premium
  useEffect(() => {
    if (isPremium || !canShow) {return;}

    const timer = setTimeout(() => {
      setVisible(true);
      void recordBannerShown();
    }, 1500); // Show after 1.5s to not interrupt the moment

    return () => clearTimeout(timer);
  }, [isPremium, canShow]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  const handleOpenPaywall = useCallback(() => {
    setVisible(false);
    onOpenPaywall();
  }, [onOpenPaywall]);

  // Don't render if premium or not visible
  if (isPremium || !visible) {return null;}

  const message = getTriggerMessage(trigger, nextBossTier, streakDays, bonusXp);

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      exiting={FadeOutUp.duration(300)}
      style={{
        position: 'absolute',
        bottom: 80,
        left: 16,
        right: 16,
        zIndex: 100,
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: `${theme.colors.primary[500]}40`,
          padding: 16,
          shadowColor: theme.colors.primary[500],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Pressable onPress={handleOpenPaywall}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Text fontSize={28}>{message.emoji}</Text>
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                variant="bodySmall"
                color={theme.colors.text.primary}
                fontWeight="700"
              >
                {message.headline}
              </Text>
              <Text variant="caption" color={theme.colors.text.secondary}>
                {message.subtext}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: theme.colors.primary[500],
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Text variant="caption" color={theme.colors.text.inverse} fontWeight="700">
                Go Premium
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Dismiss button */}
        <Pressable
          onPress={handleDismiss}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: 4,
          }}

        accessibilityLabel="✕ button"
        accessibilityRole="button"
        accessibilityHint="Activates this control">
          <Text fontSize={12} color={theme.colors.text.tertiary}>
            ✕
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default ContextualPaywallBanner;
