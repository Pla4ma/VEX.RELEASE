import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { Box } from '@/components/primitives/Box'
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';

export const AchievementsHeader: React.ComponentType<{
  total: number;
  unlocked: number;
  totalPoints: number;
  pointsEarned: number;
}> = ({ total, unlocked, totalPoints, pointsEarned }) => {
  const { theme: _theme } = useTheme();
  const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
  return (
    <Box p={4} bg={vexFire.panel} mb={4}>
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box>
          <Text variant="h2" color={vexFire.cream}>
            {unlocked} / {total}
          </Text>
          <Text variant="caption" color={vexFire.textSecondary}>
            Achievements Unlocked
          </Text>
        </Box>

        <Box alignItems="flex-end">
          <Box flexDirection="row" alignItems="center" gap={2}>
            <Text style={{ fontSize: 24 }}>⭐</Text>
            <Text variant="h3" color={vexFire.amber}>
              {pointsEarned.toLocaleString()}
            </Text>
          </Box>
          <Text variant="caption" color={vexFire.textSecondary}>
            / {totalPoints.toLocaleString()} Points
          </Text>
        </Box>
      </Box>

      <Box mt={4}>
        <Box
          height={8}
          borderRadius={4}
          bg={vexFire.backgroundSoft}
          style={{ overflow: 'hidden' }}
        >
          <Box
            height="100%"
            borderRadius={4}
            bg={vexFire.success}
            style={{ width: `${percentage}%` }}
          />
        </Box>
        <Text
          variant="caption"
          color={vexFire.textMuted}
          mt={1}
          textAlign="center"
        >
          {percentage}% Complete
        </Text>
      </Box>
    </Box>
  );
};
