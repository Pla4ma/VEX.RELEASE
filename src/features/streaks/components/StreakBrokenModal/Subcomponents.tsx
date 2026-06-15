import React from 'react';
import { Box } from '../../../../components/primitives/Box';
import { Text } from '../../../../components/primitives/Text';
import { useTheme } from '../../../../theme/ThemeContext';
import type { StreakBrokenModalProps } from './types';

interface LossStatProps {
  emoji: string;
  value: string;
  label: string;
  isLoss?: boolean;
}

export function LossStat({
  emoji,
  value,
  label,
  isLoss = false,
}: LossStatProps): React.ReactNode {
  return (
    <Box alignItems="center" gap="xs">
      <Text fontSize={32}>{emoji}</Text>
      <Text
        variant="h3"
        color={isLoss ? 'error.DEFAULT' : 'text.primary'}
        fontWeight="700"
      >
        {value}
      </Text>
      <Text variant="caption" color="text.tertiary">
        {label}
      </Text>
    </Box>
  );
}

export function WhatRemains({
  longestStreak,
}: {
  longestStreak: number;
}): React.ReactNode {
  const { theme } = useTheme();
  return (
    <Box
      p="lg"
      borderRadius="xl"
      bg={`${theme.colors.success[500]}15`}
      borderWidth={1}
      borderColor="success.DEFAULT"
      alignItems="center"
      gap="sm"
    >
      <Text fontSize={32}>🏆</Text>
      <Text variant="h4" color="text.primary">
        Your record stands
      </Text>
      <Text variant="body" color="text.secondary" textAlign="center">
        Longest streak: <Text fontWeight="700">{longestStreak} days</Text>
      </Text>
      <Text variant="caption" color="success.DEFAULT" fontWeight="600">
        Nothing can take that away!
      </Text>
    </Box>
  );
}

export function ComebackBonus({
  bonus,
}: {
  bonus: StreakBrokenModalProps['comebackBonus'];
}): React.ReactNode {
  const { theme } = useTheme();
  return (
    <Box
      p="lg"
      borderRadius="xl"
      bg={`${theme.colors.accent.orange}15`}
      borderWidth={1}
      borderColor="accent.orange"
      alignItems="center"
      gap="sm"
    >
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Text fontSize={24}>⚡</Text>
        <Text variant="h4" color="accent.orange">
          Comeback Bonus Active
        </Text>
      </Box>
      <Text variant="body" color="text.secondary" textAlign="center">
        Complete sessions in the next {bonus.duration}h to earn{' '}
        <Text color="accent.orange" fontWeight="700">
          {bonus.xpMultiplier}× XP
        </Text>
      </Text>
    </Box>
  );
}

export function CoachMessage({ message }: { message: string }): React.ReactNode {
  return (
    <Box
      flexDirection="row"
      gap="md"
      p="md"
      borderRadius="lg"
      bg="background.secondary"
      alignItems="flex-start"
    >
      <Box
        width={36}
        height={36}
        borderRadius="full"
        bg="accent.purple"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize={16}>🤖</Text>
      </Box>
      <Box flex={1}>
        <Text variant="caption" color="accent.purple" fontWeight="600" mb="xs">
          AI Coach
        </Text>
        <Text variant="body" color="text.secondary">
          {message}
        </Text>
      </Box>
    </Box>
  );
}
