import React from 'react';
import { Box, Text } from '@/components/primitives';
import { Icon } from '@/icons/components/Icon';
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
            <Box alignItems="center" accessibilityLabel={`${achievement.reward.coins.toLocaleString()} coins`}>
              <Icon name="circle" size={24} color={theme.colors.warning.DEFAULT} />
              <Text variant="body" color={theme.colors.warning.DEFAULT}>
                {achievement.reward.coins.toLocaleString()}
              </Text>
            </Box>
          )}
          {achievement.reward.xp && (
            <Box alignItems="center" accessibilityLabel={`${achievement.reward.xp.toLocaleString()} experience points`}>
              <Icon name="star" size={24} color={theme.colors.text.primary} />
              <Text variant="body" color={theme.colors.text.primary}>
                {achievement.reward.xp.toLocaleString()} XP
              </Text>
            </Box>
          )}
          {achievement.reward.gems && (
            <Box alignItems="center" accessibilityLabel={`${achievement.reward.gems.toLocaleString()} gems`}>
              <Icon name="diamond" size={24} color={theme.colors.primary[500]} />
              <Text variant="body" color={theme.colors.primary[500]}>
                {achievement.reward.gems.toLocaleString()}
              </Text>
            </Box>
          )}
          {achievement.reward.badge && (
            <Box alignItems="center" accessibilityLabel="Reward badge">
              <Icon name="shield" size={24} color={theme.colors.accent.purple} />
              <Text variant="body" color={theme.colors.accent.purple}>
                Badge
              </Text>
            </Box>
          )}
          {achievement.reward.title && (
            <Box alignItems="center" accessibilityLabel="Reward title">
              <Icon name="award" size={24} color={theme.colors.warning.DEFAULT} />
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
          accessibilityLabel={`${achievement.pointValue} achievement points`}
        >
          <Icon name="trophy" size={20} color={rarityColor} />
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
