import React from 'react';
import { Box, Text } from '@/components/primitives';
import { useTheme } from '@/theme';
import type { Achievement } from '../types';
import { getRarityColor } from '../definitions';

interface AchievementRewardsProps {
  achievement: Achievement;
}

export const AchievementRewards: React.FC<AchievementRewardsProps> = ({
  achievement,
}) => {
  const { theme } = useTheme();
  const rarityColor = getRarityColor(achievement.rarity);

  return (
    <>
      <Box mb={4}>
        <Text
          variant="label"
          color={theme.colors.text.tertiary}
          textAlign="center"
          mb={2}
        >
          REWARDS
        </Text>
        <Box flexDirection="row" justifyContent="center" gap={4}>
          {achievement.reward.coins && (
            <Box alignItems="center">
              <Text style={{ fontSize: 24 }}>🪙</Text>
              <Text variant="body" color={theme.colors.warning.DEFAULT}>
                {achievement.reward.coins.toLocaleString()}
              </Text>
            </Box>
          )}
          {achievement.reward.xp && (
            <Box alignItems="center">
              <Text style={{ fontSize: 24 }}>⭐</Text>
              <Text variant="body" color={theme.colors.text.primary}>
                {achievement.reward.xp.toLocaleString()} XP
              </Text>
            </Box>
          )}
          {achievement.reward.gems && (
            <Box alignItems="center">
              <Text style={{ fontSize: 24 }}>💎</Text>
              <Text variant="body" color={theme.colors.primary[500]}>
                {achievement.reward.gems.toLocaleString()}
              </Text>
            </Box>
          )}
          {achievement.reward.badge && (
            <Box alignItems="center">
              <Text style={{ fontSize: 24 }}>🏅</Text>
              <Text variant="body" color={theme.colors.accent.purple}>
                Badge
              </Text>
            </Box>
          )}
          {achievement.reward.title && (
            <Box alignItems="center">
              <Text style={{ fontSize: 24 }}>👑</Text>
              <Text variant="body" color={theme.colors.warning.DEFAULT}>
                Title
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      <Box alignItems="center" mb={6}>
        <Box
          flexDirection="row"
          alignItems="center"
          gap={2}
          px={4}
          py={2}
          borderRadius={12}
          style={{ backgroundColor: `${rarityColor}15` }}
        >
          <Text style={{ fontSize: 20 }}>🏆</Text>
          <Text variant="h3" color={rarityColor}>
            {achievement.pointValue}
          </Text>
          <Text variant="caption" color={theme.colors.text.tertiary}>
            points
          </Text>
        </Box>
      </Box>
    </>
  );
};
