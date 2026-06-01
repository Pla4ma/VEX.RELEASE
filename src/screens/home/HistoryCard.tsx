import React from 'react';
import { View } from 'react-native';

import { Text } from '../../components/primitives/Text';
import { getPremiumCardStyle } from '../../components/premiumStyles';
import { useTheme } from '../../theme';
import type { SessionHistoryEntry } from '../../session/types';
import { styles } from './homeScreenCardStyles';

export function HistoryCard({ entry }: { entry: SessionHistoryEntry }) {
  const { theme } = useTheme();
  const minutes = Math.max(
    1,
    Math.round((entry.summary?.actualDuration ?? entry.config.duration) / 60),
  );
  return (
    <View
      style={[
        styles.card,
        getPremiumCardStyle('medium'),
        {
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.light,
          padding: theme.spacing[4],
          gap: theme.spacing[2],
        },
      ]}
    >
      <View style={styles.row}>
        <Text variant="label" color={theme.colors.text.primary}>
          {entry.config.customName || 'Focus Session'}
        </Text>
        <Text variant="caption" color={theme.colors.text.secondary}>
          {entry.endedAt
            ? new Date(entry.endedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            : 'In progress'}
        </Text>
      </View>
      <Text
        variant="bodySmall"
        color={theme.colors.text.secondary}
      >{`${minutes} min | ${entry.status.replace('_', ' ')}${entry.summary ? ` | +${entry.summary.xpEarned} XP` : ''}`}</Text>
    </View>
  );
}
