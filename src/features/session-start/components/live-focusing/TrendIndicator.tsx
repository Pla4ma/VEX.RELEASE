/**
 * Trend direction indicator with percentage.
 */
import React from 'react';
import { Box } from '../../../../components/primitives/Box';
import { Text } from '../../../../components/primitives/Text';

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  percent?: number;
}

export function TrendIndicator({
  trend,
  percent,
}: TrendIndicatorProps): JSX.Element {
  const icons = { up: '📈', down: '📉', stable: '➡️' };
  return (
    <Box flexDirection="row" alignItems="center" gap="xs">
      <Text fontSize={12}>{icons[trend]}</Text>
      {percent !== undefined && percent > 0 && (
        <Text
          fontSize={12}
          color={
            trend === 'up'
              ? 'success.DEFAULT'
              : trend === 'down'
                ? 'error.DEFAULT'
                : 'text.tertiary'
          }
        >
          {trend === 'up' ? '+' : ''}
          {percent}%
        </Text>
      )}
    </Box>
  );
}
