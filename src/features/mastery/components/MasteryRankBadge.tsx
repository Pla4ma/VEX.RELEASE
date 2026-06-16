import React from 'react';
import { View } from 'react-native';
import { Box } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { MasteryRank } from '../types';
import { lightColors } from '@/theme/tokens/colors';

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
    color: lightColors.text.muted,
    label: 'Apprentice',
  },
  ADEPT: { icon: '', color: lightColors.accent.blue, label: 'Adept' },
  EXPERT: { icon: '', color: lightColors.accent.purple, label: 'Expert' },
  MASTER: { icon: '', color: lightColors.semantic.primary, label: 'Master' },
  GRANDMASTER: {
    icon: '',
    color: lightColors.semantic.warning,
    label: 'Grandmaster',
  },
};

export function MasteryRankBadge({
  rank,
  totalPoints,
  size = 'md',
}: Props): React.ReactNode {
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
        boxShadow: `0px 0px 0px ${size === 'lg' ? config.color : undefined}`,
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
