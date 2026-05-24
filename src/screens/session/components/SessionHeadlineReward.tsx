import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Box, Text } from '../../../components/primitives';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme';
import type { HeadlineReward } from '../../../features/session-completion/headline-reward.types';

type SessionHeadlineRewardProps = {
  headline: HeadlineReward;
};

export function SessionHeadlineReward({ headline }: SessionHeadlineRewardProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const scale = useSharedValue(isReducedMotion ? 1 : 0.96);
  const opacity = useSharedValue(isReducedMotion ? 1 : 0);

  useEffect(() => {
    scale.value = isReducedMotion ? 1 : withSpring(1, { damping: 18, stiffness: 180 });
    opacity.value = isReducedMotion ? 1 : withSpring(1, { damping: 20, stiffness: 160 });
  }, [isReducedMotion, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Box
        mx={6}
        mb={5}
        p={5}
        borderRadius={theme.borderRadius.md}
        borderWidth={1}
        borderColor={theme.colors.border.DEFAULT}
        bg={theme.colors.background.secondary}
        accessibilityRole="header"
        accessibilityLabel={`${headline.title}: ${headline.value}`}
      >
        <Text variant="label" color={theme.colors.primary[400]} textAlign="center">
          {headline.iconName}
        </Text>
        <Text variant="h2" color={theme.colors.text.primary} mt={2} textAlign="center">
          {headline.title}
        </Text>
        <Text variant="display" color={theme.colors.primary[500]} mt={3} textAlign="center">
          {headline.value}
        </Text>
        <Text variant="body" color={theme.colors.text.secondary} mt={3} textAlign="center">
          {headline.body}
        </Text>
      </Box>
    </Animated.View>
  );
}
