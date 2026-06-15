import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassProgressBar } from '../../../components/glass/GlassProgressBar';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { Icon } from '../../../icons/components/Icon';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import {
  type AtRiskBannerProps,
  getUrgencyMessage,
  usePulseAnimation,
} from './at-risk-banner-urgency';

export type { AtRiskBannerProps } from './at-risk-banner-urgency';

export function AtRiskBanner({
  hoursRemaining,
  currentStreak,
  onStartSession,
  isLoading = false,
}: AtRiskBannerProps): JSX.Element | null {
  const { headline, subtext, tone } = useMemo(
    () => getUrgencyMessage(hoursRemaining, currentStreak),
    [hoursRemaining, currentStreak],
  );

  const isCritical = tone === 'critical';
  const pulseStyle = usePulseAnimation(isCritical);

  if (
    hoursRemaining === null ||
    hoursRemaining === undefined ||
    hoursRemaining >= 12 ||
    currentStreak === 0
  ) {
    return null;
  }

  if (isLoading) {
    return (
      <GlassCard variant="subtle" padding={16} radius={20}>
        <View
          style={{
            backgroundColor: 'rgba(16, 35, 31, 0.10)',
            borderRadius: 8,
            height: 16,
            width: '80%',
          }}
        />
        <View
          style={{
            backgroundColor: 'rgba(16, 35, 31, 0.06)',
            borderRadius: 8,
            height: 12,
            marginTop: 8,
            width: '60%',
          }}
        />
      </GlassCard>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={pulseStyle}>
      <Pressable
        onPress={onStartSession}
        accessibilityLabel="Streak at risk banner"
        accessibilityRole="button"
        accessibilityHint="Double tap to protect your streak"
      >
        <GlassCard
          variant="warning"
          padding={16}
          radius={22}
        >
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <LiquidGlassSphere
              color={isCritical ? 'coral' : 'amber'}
              icon={
                <Icon
                  color={isCritical ? vexLightGlass.semantic.danger : vexLightGlass.semantic.warning}
                  name="alarm"
                  size="md"
                  variant="solid"
                />
              }
              intensity={0.88}
              size={44}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 14,
                  fontWeight: '700',
                }}
                numberOfLines={1}
              >
                {headline}
              </Text>
              <Text
                style={{
                  color: vexLightGlass.text.secondary,
                  fontSize: 12,
                  fontWeight: '500',
                  marginTop: 2,
                }}
              >
                {subtext}
              </Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: isCritical ? vexLightGlass.semantic.danger : vexLightGlass.mint[500],
                borderRadius: 999,
                flexDirection: 'row',
                gap: 4,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  color: vexLightGlass.text.inverse,
                  fontSize: 12,
                  fontWeight: '800',
                  letterSpacing: 0.4,
                }}
              >
                START
              </Text>
              <Icon color="#FFFFFF" name="arrowRight" size="xs" variant="solid" />
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <GlassProgressBar
              value={Math.max(0, Math.min(1, hoursRemaining / 12))}
              height={6}
              variant="warning"
            />
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

export default AtRiskBanner;
