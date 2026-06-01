import React from 'react';
import { Pressable } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { ActiveStreakWager } from './streak-widget-types';

export function MultiplierBadge({
  multiplier,
}: {
  multiplier: number;
}): JSX.Element {
  const { theme } = useTheme();
  const color =
    multiplier >= 2
      ? theme.colors.accent.purple
      : multiplier >= 1.5
        ? theme.colors.accent.blue
        : multiplier > 1
          ? theme.colors.success.DEFAULT
          : theme.colors.text.tertiary;

  return (
    <Box
      px="sm"
      py="xs"
      borderRadius="full"
      bg={multiplier > 1 ? `${color}20` : theme.colors.background.tertiary}
      borderWidth={multiplier > 1 ? 1 : 0}
      borderColor={color}
    >
      <Text
        variant="caption"
        color={color}
        fontWeight={multiplier > 1 ? '700' : undefined}
      >
        {multiplier.toFixed(1)}x{multiplier > 1 ? ' multiplier' : ''}
      </Text>
    </Box>
  );
}

export function WagerSection({
  currentDays,
  activeWager,
  onWagerPress,
}: {
  currentDays: number;
  activeWager?: ActiveStreakWager | null;
  onWagerPress?: () => void;
}): JSX.Element | null {
  const { theme } = useTheme();

  if (currentDays < 3 || !onWagerPress) {
    return null;
  }

  return (
    <Pressable
      onPress={onWagerPress}
      style={{
        alignItems: 'center',
        borderTopColor: theme.colors.border.light,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing[3],
        paddingTop: theme.spacing[3],
      }}
      accessibilityLabel={
        activeWager ? 'View active wager progress' : 'Place a streak wager'
      }
      accessibilityRole="button"
      accessibilityHint={
        activeWager
          ? 'Opens your wager progress sheet'
          : 'Bet on your streak performance for rewards'
      }
    >
      <Text variant="caption" color="text.secondary">
        {activeWager ? 'Wager active' : 'Place a wager'}
      </Text>
      <Text
        variant="caption"
        color={activeWager ? 'primary.500' : 'text.tertiary'}
        fontWeight={activeWager ? '700' : undefined}
      >
        {activeWager
          ? `${activeWager.currentProgress}/${activeWager.target} ${activeWager.progressUnit}`
          : 'Bet on your streak'}
      </Text>
    </Pressable>
  );
}
