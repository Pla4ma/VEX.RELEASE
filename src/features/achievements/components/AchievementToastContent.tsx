import React from 'react';
import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import type { Achievement } from '../types';
import { getAchievementDisplayInfo, getRarityColor } from '../definitions';

interface AchievementToastContentProps {
  achievement: Achievement;
  isHighRarity: boolean;
}

export function AchievementToastContent({
  achievement,
  isHighRarity,
}: AchievementToastContentProps): React.ReactNode {
  const { theme } = useTheme();
  const display = getAchievementDisplayInfo(achievement, true);
  const rarityColor = getRarityColor(achievement.rarity);

  return (
    <Box
      p={isHighRarity ? 5 : 4}
      borderRadius={16}
      bg={theme.colors.background.secondary}
      style={{
        borderWidth: 2,
        borderColor: rarityColor,
        boxShadow: `0px 4px 12px ${rarityColor} / 0.3`,
      }}
    >
      <Box flexDirection="row" alignItems="center" gap={3}>
        <Box
          width={isHighRarity ? 56 : 48}
          height={isHighRarity ? 56 : 48}
          borderRadius={isHighRarity ? 28 : 24}
          bg={`${rarityColor}25`}
          alignItems="center"
          justifyContent="center"
          style={{ borderWidth: 2, borderColor: rarityColor }}
        >
          <Text style={{ fontSize: isHighRarity ? 32 : 28 }}>
            {display.icon}
          </Text>
        </Box>

        <Box flex={1}>
          <Text
            variant="caption"
            color={rarityColor}
            fontWeight="bold"
            mb={1}
          >
            🏆 ACHIEVEMENT UNLOCKED
          </Text>
          <Text
            variant={isHighRarity ? 'h4' : 'body'}
            color={theme.colors.text.primary}
            fontWeight="semibold"
            numberOfLines={1}
          >
            {display.title}
          </Text>
        </Box>

        <Box
          px={3}
          py={1}
          borderRadius={8}
          style={{ backgroundColor: `${rarityColor}30` }}
        >
          <Text variant="caption" color={rarityColor} fontWeight="bold">
            {achievement.rarity}
          </Text>
        </Box>
      </Box>

      {achievement.rarity === 'LEGENDARY' && (
        <Box mt={3} alignItems="center">
          <Text variant="caption" color={theme.colors.warning.DEFAULT}>
            ✨ LEGENDARY RARITY ✨
          </Text>
        </Box>
      )}
    </Box>
  );
}
