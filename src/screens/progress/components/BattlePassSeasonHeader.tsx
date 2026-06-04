/**
 * BattlePassSeasonHeader Component
 *
 * Season header with name and days remaining countdown.
 *
 * @phase 0A.3
 */

import React from 'react';
import { Box, Text } from '@/components/primitives';
import { useTheme } from '@/theme';
import { lightColors } from '@/theme/tokens/colors';


interface BattlePassSeasonHeaderProps {
  seasonName: string;
  daysRemaining: number;
}

export function BattlePassSeasonHeader({
  seasonName,
  daysRemaining,
}: BattlePassSeasonHeaderProps): JSX.Element {
  const { theme } = useTheme();
  const isUrgent = daysRemaining <= 7;

  return (
    <Box p="lg" bg={theme.colors.background.secondary}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Text variant="caption" color={theme.colors.text.tertiary} mb="xs">
            CURRENT SEASON
          </Text>
          <Text variant="h2" color={theme.colors.text.primary}>
            {seasonName}
          </Text>
        </Box>

        <Box
          px="md"
          py="xs"
          borderRadius="lg"
          bg={isUrgent ? theme.colors.error.DEFAULT : theme.colors.primary[500]}
        >
          <Text
            variant="caption"
            color={lightColors.text.inverse}
            fontWeight="bold"
          >
            {isUrgent ? '⏰ ' : ''}
            {daysRemaining} days left
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
