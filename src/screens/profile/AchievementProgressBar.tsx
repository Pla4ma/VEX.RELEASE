import React from 'react';
import { Box, Text } from '@/components/primitives';
import { useTheme } from '@/theme';

export const AchievementsHeader: React.FC<{
  total: number;
  unlocked: number;
  totalPoints: number;
  pointsEarned: number;
}> = ({ total, unlocked, totalPoints, pointsEarned }) => {
  const { theme } = useTheme();
  const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
  return (
    <Box p={4} bg={theme.colors.background.secondary} mb={4}>
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box>
          <Text variant="h2" color={theme.colors.text.primary}>
            {unlocked} / {total}
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Achievements Unlocked
          </Text>
        </Box>

        <Box alignItems="flex-end">
          <Box flexDirection="row" alignItems="center" gap={2}>
            <Text style={{ fontSize: 24 }}>⭐</Text>
            <Text variant="h3" color={theme.colors.warning.DEFAULT}>
              {pointsEarned.toLocaleString()}
            </Text>
          </Box>
          <Text variant="caption" color={theme.colors.text.secondary}>
            / {totalPoints.toLocaleString()} Points
          </Text>
        </Box>
      </Box>

      <Box mt={4}>
        <Box
          height={8}
          borderRadius={4}
          bg={theme.colors.background.tertiary}
          style={{ overflow: 'hidden' }}
        >
          <Box
            height="100%"
            borderRadius={4}
            bg={theme.colors.success.DEFAULT}
            style={{ width: `${percentage}%` }}
          />
        </Box>
        <Text
          variant="caption"
          color={theme.colors.text.tertiary}
          mt={1}
          textAlign="center"
        >
          {percentage}% Complete
        </Text>
      </Box>
    </Box>
  );
};
