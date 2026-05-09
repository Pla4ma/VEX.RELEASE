/**
 * AtRiskBanner Component
 *
 * Red banner shown on home screen when streak is at critical risk (< 4 hours remaining).
 * Creates urgency to start a session immediately.
 *
 * @phase 2.1
 */

import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

export interface AtRiskBannerProps {
  /** Hours remaining until streak breaks (null if not at risk) */
  hoursRemaining: number | null;
  /** Current streak days */
  currentStreak: number;
  /** Called when user taps to start session */
  onStartSession: () => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Get urgency message based on hours remaining
 */
function getUrgencyMessage(
  hoursRemaining: number | null,
  streakDays: number,
): {
  headline: string;
  subtext: string;
  tone: 'critical' | 'urgent' | 'warning';
} {
  if (hoursRemaining === null || hoursRemaining === undefined) {
    return {
      headline: 'Streak Safe',
      subtext: 'No urgent action needed',
      tone: 'warning',
    };
  }
  if (hoursRemaining <= 1) {
    return {
      headline: `⚠️ FINAL HOUR — ${streakDays}-Day Streak!`,
      subtext: 'Start a session NOW to save your streak',
      tone: 'critical',
    };
  }
  if (hoursRemaining <= 4) {
    return {
      headline: `🔥 ${hoursRemaining}h Left to Save ${streakDays}-Day Streak`,
      subtext: 'Your streak expires soon — start a focus session',
      tone: 'urgent',
    };
  }
  if (hoursRemaining <= 8) {
    return {
      headline: `⏰ ${hoursRemaining} Hours Remaining`,
      subtext: `Protect your ${streakDays}-day streak before bed`,
      tone: 'warning',
    };
  }
  return {
    headline: 'Streak at Risk',
    subtext: `${hoursRemaining} hours remaining`,
    tone: 'warning',
  };
}

/**
 * Animated pulse for critical urgency
 */
function usePulseAnimation(isCritical: boolean) {
  return useAnimatedStyle(() => ({
    transform: isCritical
      ? [
          {
            scale: withRepeat(withSequence(withTiming(1.02, { duration: 800 }), withTiming(1, { duration: 800 })), -1, true),
          },
        ]
      : [],
  }));
}

export function AtRiskBanner({ hoursRemaining, currentStreak, onStartSession, isLoading = false }: AtRiskBannerProps): JSX.Element | null {
  const { theme } = useTheme();

  // Only show when streak is at risk (< 12 hours) and hoursRemaining is known
  if (hoursRemaining === null || hoursRemaining === undefined || hoursRemaining >= 12 || currentStreak === 0) {
    return null;
  }

  const { headline, subtext, tone } = useMemo(() => getUrgencyMessage(hoursRemaining, currentStreak), [hoursRemaining, currentStreak]);

  const isCritical = tone === 'critical';
  const isUrgent = tone === 'urgent';

  const pulseStyle = usePulseAnimation(isCritical);

  const backgroundColor = isCritical ? theme.colors.error.DEFAULT : isUrgent ? theme.colors.error.light : theme.colors.warning.DEFAULT;

  const textColor = isCritical || isUrgent ? theme.colors.text.inverse : theme.colors.text.primary;

  if (isLoading) {
    return (
      <Box mx="lg" mb="md" p="md" borderRadius="lg" bg={theme.colors.background.tertiary}>
        <Box height={20} width="80%" bg={theme.colors.background.secondary} borderRadius="sm" />
        <Box height={16} width="60%" bg={theme.colors.background.secondary} borderRadius="sm" mt="xs" />
      </Box>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={pulseStyle}>
      <Pressable onPress={onStartSession} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box
          mx="lg"
          mb="md"
          p="md"
          borderRadius="lg"
          bg={backgroundColor}
          style={{
            shadowColor: isCritical ? theme.colors.error[500] : theme.colors.warning[500],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Box flexDirection="row" alignItems="center" gap="md">
            <Box width={40} height={40} borderRadius="full" bg={isCritical ? `${theme.colors.error.dark}40` : `${theme.colors.warning.dark}40`} justifyContent="center" alignItems="center">
              <Text fontSize={24}>{isCritical ? '🚨' : '🔥'}</Text>
            </Box>

            <Box flex={1}>
              <Text variant="body" color={textColor} fontWeight="700" numberOfLines={1}>
                {headline}
              </Text>
              <Text variant="caption" color={isCritical || isUrgent ? `${textColor}90` : theme.colors.text.secondary}>
                {subtext}
              </Text>
            </Box>

            <Box px="sm" py="xs" borderRadius="md" bg={isCritical ? theme.colors.error.dark : theme.colors.background.primary}>
              <Text variant="caption" color={isCritical ? theme.colors.text.inverse : theme.colors.primary[500]} fontWeight="700">
                START →
              </Text>
            </Box>
          </Box>

          {/* Progress bar showing time draining */}
          <Box mt="md" height={4} borderRadius="full" bg={`${textColor}30`} overflow="hidden">
            <Box width={`${(hoursRemaining / 12) * 100}%`} height="100%" borderRadius="full" bg={textColor} />
          </Box>
        </Box>
      </Pressable>
    </Animated.View>
  );
}

export default AtRiskBanner;
