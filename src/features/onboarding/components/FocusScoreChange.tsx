/**
 * FocusScoreChange Component
 *
 * Focus Score change indicator for first result screen.
 * Shows before/after scores with visual feedback.
 *
 * @phase 4
 */

import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

interface FocusScoreChangeProps {
  before: number;
  after: number;
}

/**
 * Focus Score change indicator
 */
export function FocusScoreChange({
  before,
  after,
}: FocusScoreChangeProps): React.ReactNode {
  const { theme } = useTheme();
  const change = after - before;
  const isIncrease = change > 0;

  return (
    <Box
      px="lg"
      py="md"
      borderRadius="lg"
      bg={
        isIncrease
          ? `${theme.colors.success[500]}15`
          : `${theme.colors.warning[500]}15`
      }
      borderWidth={1}
      borderColor={isIncrease ? 'success.300' : 'warning.300'}
      alignItems="center"
      gap="sm"
    >
      <Text variant="h3" color="text.primary" fontWeight="700">
        {before} → {after}
      </Text>
      <Box flexDirection="row" alignItems="center" gap="xs">
        <Text fontSize={16}>{isIncrease ? '📈' : '📊'}</Text>
        <Text variant="body" color={isIncrease ? 'success.600' : 'warning.600'}>
          {isIncrease ? `+${change} points` : `${change} points`}
        </Text>
      </Box>
    </Box>
  );
}

export default FocusScoreChange;
