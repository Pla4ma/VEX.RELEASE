import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';


export interface WeeklyReportCompactProps {
  totalMinutes: number;
  changePercent: number;
  onPress: () => void;
}

export function WeeklyReportCompact({
  totalMinutes,
  changePercent,
  onPress,
}: WeeklyReportCompactProps): JSX.Element {
  const isImprovement = changePercent >= 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Weekly report"
      accessibilityRole="button"
      accessibilityHint="Double tap to select"
    >
      <Box
        flexDirection="row"
        alignItems="center"
        gap="md"
        p="md"
        borderRadius="lg"
        bg="background.secondary"
        style={{
          borderLeftWidth: 4,
          borderLeftColor: isImprovement
            ? '#22c55e'
            : '#f59e0b',
        }}
      >
        <Text fontSize={24}>📊</Text>
        <Box flex={1}>
          <Text variant="body" color="text.primary" fontWeight="600">
            {totalMinutes}m this week
          </Text>
          <Text
            variant="caption"
            color={isImprovement ? 'success.DEFAULT' : 'warning.DEFAULT'}
          >
            {isImprovement ? '+' : ''}
            {changePercent}% vs last week
          </Text>
        </Box>
        <Text fontSize={20}>→</Text>
      </Box>
    </Pressable>
  );
}
