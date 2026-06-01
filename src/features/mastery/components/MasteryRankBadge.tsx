import React from 'react';
import { View } from 'react-native';
import { Box, Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';
import type { MasteryRank } from '../types';

type Props = {
  rank: MasteryRank;
  totalPoints: number;
  size?: 'sm' | 'md' | 'lg';
};

const rankConfig: Record<
  MasteryRank,
  { icon: string; color: string; label: string }
> = {
  APPRENTICE: {
    icon: '',
    color: '#9ca3af',
    label: 'Apprentice',
  },
  ADEPT: { icon: '', color: '#3b82f6', label: 'Adept' },
  EXPERT: { icon: '', color: '#8b5cf6', label: 'Expert' },
  MASTER: { icon: '', color: '#4f46e5', label: 'Master' },
  GRANDMASTER: {
    icon: '',
    color: '#f59e0b',
    label: 'Grandmaster',
  },
};

export function MasteryRankBadge({
  rank,
  totalPoints,
  size = 'md',
}: Props): JSX.Element {
  const { theme } = useTheme();
  const config = rankConfig[rank];
  const sizeMap = {
    sm: {
      icon: 14,
      title: 'caption' as const,
      points: 'caption' as const,
      px: theme.spacing[2],
      py: theme.spacing[1],
      radius: 999,
    },
    md: {
      icon: 18,
      title: 'body' as const,
      points: 'bodySmall' as const,
      px: theme.spacing[3],
      py: theme.spacing[3],
      radius: 18,
    },
    lg: {
      icon: 28,
      title: 'h3' as const,
      points: 'body' as const,
      px: theme.spacing[5],
      py: theme.spacing[4],
      radius: 24,
    },
  };
  const current = sizeMap[size];

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      gap={size === 'sm' ? 6 : 10}
      px={current.px}
      py={current.py}
      borderRadius={current.radius}
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderWidth: size === 'lg' ? 2 : 1,
        borderColor: `${config.color}${size === 'lg' ? 'AA' : '55'}`,
        shadowColor: size === 'lg' ? config.color : undefined,
        shadowOpacity: size === 'lg' ? 0.35 : 0,
        shadowRadius: size === 'lg' ? 18 : 0,
        shadowOffset: size === 'lg' ? { width: 0, height: 0 } : undefined,
        elevation: size === 'lg' ? 10 : 0,
      }}
    >
      <Text fontSize={current.icon}>{config.icon}</Text>
      <View style={{ flex: size === 'sm' ? 0 : 1 }}>
        <Text
          variant={current.title}
          color={theme.colors.text.primary}
          fontWeight="700"
        >
          {config.label}
        </Text>
        {size !== 'sm' ? (
          <Text variant={current.points} color={config.color}>
            {totalPoints} points
          </Text>
        ) : null}
      </View>
      {size === 'sm' ? (
        <Text variant="caption" color={config.color}>
          {totalPoints}
        </Text>
      ) : null}
    </Box>
  );
}
