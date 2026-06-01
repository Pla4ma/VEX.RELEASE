import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
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
  const { theme } = useTheme();

  const { headline, subtext, tone } = useMemo(
    () => getUrgencyMessage(hoursRemaining, currentStreak),
    [hoursRemaining, currentStreak],
  );

  const isCritical = tone === 'critical';
  const isUrgent = tone === 'urgent';

  const pulseStyle = usePulseAnimation(isCritical);

  const backgroundColor = isCritical
    ? theme.colors.error.DEFAULT
    : isUrgent
      ? theme.colors.error.light
      : theme.colors.warning.DEFAULT;

  const textColor =
    isCritical || isUrgent
      ? theme.colors.text.inverse
      : theme.colors.text.primary;

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
      <Box
        mx="lg"
        mb="md"
        p="md"
        borderRadius="lg"
        bg={theme.colors.background.tertiary}
      >
        <Box
          height={20}
          width="80%"
          bg={theme.colors.background.secondary}
          borderRadius="sm"
        />
        <Box
          height={16}
          width="60%"
          bg={theme.colors.background.secondary}
          borderRadius="sm"
          mt="xs"
        />
      </Box>
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
        <Box
          mx="lg"
          mb="md"
          p="md"
          borderRadius="lg"
          bg={backgroundColor}
          style={{
            shadowColor: isCritical
              ? theme.colors.error[500]
              : theme.colors.warning[500],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Box flexDirection="row" alignItems="center" gap="md">
            <Box
              width={40}
              height={40}
              borderRadius="full"
              bg={
                isCritical
                  ? `${theme.colors.error.dark}40`
                  : `${theme.colors.warning.dark}40`
              }
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize={24}>{isCritical ? '🚨' : '🔥'}</Text>
            </Box>

            <Box flex={1}>
              <Text
                variant="body"
                color={textColor}
                fontWeight="700"
                numberOfLines={1}
              >
                {headline}
              </Text>
              <Text
                variant="caption"
                color={
                  isCritical || isUrgent
                    ? `${textColor}90`
                    : theme.colors.text.secondary
                }
              >
                {subtext}
              </Text>
            </Box>

            <Box
              px="sm"
              py="xs"
              borderRadius="md"
              bg={
                isCritical
                  ? theme.colors.error.dark
                  : theme.colors.background.primary
              }
            >
              <Text
                variant="caption"
                color={
                  isCritical
                    ? theme.colors.text.inverse
                    : theme.colors.primary[500]
                }
                fontWeight="700"
              >
                START →
              </Text>
            </Box>
          </Box>

          {/* Progress bar showing time draining */}
          <Box
            mt="md"
            height={4}
            borderRadius="full"
            bg={`${textColor}30`}
            overflow="hidden"
          >
            <Box
              width={`${(hoursRemaining / 12) * 100}%`}
              height="100%"
              borderRadius="full"
              bg={textColor}
            />
          </Box>
        </Box>
      </Pressable>
    </Animated.View>
  );
}

export default AtRiskBanner;
