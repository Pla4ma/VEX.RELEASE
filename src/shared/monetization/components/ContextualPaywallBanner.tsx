import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { usePremiumStatus } from '../use-revenuecat';
import {
  type PaywallTriggerType,
  getTriggerMessage,
  canShowBanner,
  recordBannerShown,
} from './paywall-banner-helpers';

interface ContextualPaywallBannerProps {
  trigger: PaywallTriggerType;
  nextBossTier?: number;
  streakDays?: number;
  bonusXp?: number;
  onOpenPaywall: () => void;
  onDismiss?: () => void;
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
  useEffect(() => {
    const checkRateLimit = async () => {
      const allowed = await canShowBanner();
      setCanShow(allowed);
    };
    checkRateLimit();
  }, []);
  useEffect(() => {
    if (isPremium || !canShow) {
      return;
    }
    const timer = setTimeout(() => {
      setVisible(true);
      recordBannerShown();
    }, 1500);
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
  if (isPremium || !visible) {
    return null;
  }
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
        <Pressable
          onPress={handleOpenPaywall}
          accessibilityLabel="Paywall action"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
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
              <Text
                variant="caption"
                color={theme.colors.text.inverse}
                fontWeight="700"
              >
                Go Premium
              </Text>
            </View>
          </View>
        </Pressable>

        {}
        <Pressable
          onPress={handleDismiss}
          style={{ position: 'absolute', top: 8, right: 8, padding: 4 }}
          accessibilityLabel="✕ button"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text fontSize={12} color={theme.colors.text.tertiary}>
            ✕
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
export default ContextualPaywallBanner;
