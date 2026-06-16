import React from 'react';

import { Box } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { RewardPrioritySummary } from '../../../features/session-completion/reward-priority';

type SessionRewardPriorityRowsProps = {
  priority: RewardPrioritySummary;
};

export function SessionRewardPriorityRows({
  priority,
}: SessionRewardPriorityRowsProps): JSX.Element | null {
  const { theme } = useTheme();

  if (priority.secondaryRewards.length === 0) {
    return null;
  }

  return (
    <Box mx={6} mb={5}>
      {priority.secondaryRewards.map((reward) => (
        <Box
          key={`${reward.kind}-${reward.label}`}
          mb={2}
          px={4}
          py={3}
          borderRadius={theme.borderRadius.sm}
          borderWidth={1}
          borderColor={theme.colors.border.DEFAULT}
          bg={theme.colors.background.secondary}
          accessibilityLabel={`${reward.label}: ${reward.detail}`}
        >
          <Text variant="label" color={theme.colors.text.primary}>
            {reward.label}
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary} mt={1}>
            {reward.detail}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
