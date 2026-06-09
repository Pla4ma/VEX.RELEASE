/**
 * BattlePassXPProgress Component
 *
 * XP progress bar with animated fill showing current tier progress.
 *
 * @phase 0A.3
 */

import React from 'react';

import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Box, Text } from '@/components/primitives';
import { useTheme } from '@/theme';

interface BattlePassXPProgressProps {
  currentXP: number;
  tierXP: number;
  currentTier: number;
  totalTiers: number;
}

export function BattlePassXPProgress({
  currentXP,
  tierXP,
  currentTier,
  totalTiers,
}: BattlePassXPProgressProps): JSX.Element {
  const { theme } = useTheme();

  const progress = tierXP > 0 ? (currentXP / tierXP) * 100 : 0;
  const animatedWidth = useSharedValue(0);

  React.useEffect(() => {
    animatedWidth.value = withSpring(progress, { damping: 15, stiffness: 100 });
  }, [progress, animatedWidth]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <Box p="lg" bg={theme.colors.background.secondary}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb="sm"
      >
        <Text variant="h3" color={theme.colors.text.primary}>
          Tier {currentTier}
        </Text>
        <Text variant="body" color={theme.colors.text.secondary}>
          {currentXP.toLocaleString()} / {tierXP.toLocaleString()} XP
        </Text>
      </Box>

      {/* Progress bar background */}
      <Box
        height={12}
        borderRadius="md"
        bg={theme.colors.background.tertiary}
        style={{ overflow: 'hidden' }}
      >
        {/* Animated fill */}
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: 6,
              backgroundColor: theme.colors.primary[500],
            },
            progressStyle,
          ]}
        />
      </Box>

      <Text
        variant="caption"
        color={theme.colors.text.tertiary}
        mt="sm"
        textAlign="center"
      >
        {totalTiers - currentTier} tiers until max rank
      </Text>
    </Box>
  );
}
