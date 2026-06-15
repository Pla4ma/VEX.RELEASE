import React from 'react';
import { Box } from '../../../../components/primitives/Box';
import { Text } from '../../../../components/primitives/Text';
import { Button } from '../../../../components/primitives/Button';
import { useTheme } from '../../../../theme/ThemeContext';
import { calculateRestoreCost } from './helpers';

interface RestoreStreakCardProps {
  brokenStreakDays: number;
  gemsBalance: number;
  onRestore: () => void;
  isRestoring: boolean;
}

export function RestoreStreakCard({
  brokenStreakDays,
  gemsBalance = 0,
  onRestore,
  isRestoring,
}: RestoreStreakCardProps): JSX.Element | null {
  const { theme } = useTheme();
  const cost = calculateRestoreCost(brokenStreakDays);
  const canAfford = gemsBalance >= cost;
  return (
    <Box
      p="lg"
      borderRadius="xl"
      bg={`${theme.colors.primary[500]}15`}
      borderWidth={1}
      borderColor="primary.DEFAULT"
      gap="sm"
    >
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Text fontSize={24}>💎</Text>
        <Text variant="h4" color="primary.DEFAULT">
          Restore Your Streak
        </Text>
      </Box>
      <Text variant="body" color="text.secondary">
        Don't lose your {brokenStreakDays}-day progress!
      </Text>
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        mt="sm"
      >
        <Box>
          <Text variant="caption" color="text.tertiary">
            COST
          </Text>
          <Text
            variant="h4"
            color={canAfford ? 'primary.DEFAULT' : 'error.DEFAULT'}
          >
            {cost} 💎
          </Text>
        </Box>
        <Box alignItems="flex-end">
          <Text variant="caption" color="text.tertiary">
            BALANCE
          </Text>
          <Text
            variant="body"
            color={canAfford ? 'text.secondary' : 'error.DEFAULT'}
          >
            {gemsBalance} 💎
          </Text>
        </Box>
      </Box>
      <Button
        variant={canAfford ? 'primary' : 'secondary'}
        size="md"
        fullWidth
        onPress={onRestore}
        isLoading={isRestoring}
        disabled={!canAfford || isRestoring}
        style={{ marginTop: theme.spacing[2] }}
        accessibilityLabel="Use gems to restore streak"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        {canAfford ? '💎 Restore Streak' : `Need ${cost} gems`}
      </Button>
      {!canAfford && (
        <Text variant="caption" color="error.DEFAULT" textAlign="center">
          Not enough gems to restore
        </Text>
      )}
    </Box>
  );
}
