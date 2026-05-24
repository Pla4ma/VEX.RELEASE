import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../../theme';
import { createSheet } from '@/shared/ui/create-sheet';

const LOADING_STAT_PLACEHOLDERS = ['first', 'second', 'third'] as const;

export const RootLoadingShell: React.FC = () => {
  const { theme } = useTheme();
  const surfaceStyle = {
    backgroundColor: theme.colors.semantic.surfaceGlass,
    borderColor: theme.colors.semantic.border,
  };

  return (
    <View
      style={[
        styles.loadingShell,
        {
          backgroundColor: theme.colors.semantic.background,
          paddingHorizontal: theme.spacing[5],
          gap: theme.spacing[4],
        },
      ]}
    >
      <View
        style={[
          styles.loadingHero,
          surfaceStyle,
          {
            height: theme.spacing[16] + theme.spacing[16],
            borderRadius: theme.borderRadius['3xl'],
          },
        ]}
      />
      <View style={[styles.loadingStats, { gap: theme.spacing[3] }]}>
        {LOADING_STAT_PLACEHOLDERS.map((item) => (
          <View
            key={item}
            style={[
              styles.loadingStat,
              surfaceStyle,
              {
                height: theme.spacing[20] + theme.spacing[2],
                borderRadius: theme.borderRadius['2xl'],
              },
            ]}
          />
        ))}
      </View>
      <View
        style={[
          styles.loadingCard,
          surfaceStyle,
          {
            height: theme.spacing[20] + theme.spacing[20] + theme.spacing[5],
            borderRadius: theme.borderRadius['2xl'],
          },
        ]}
      />
    </View>
  );
};

const styles = createSheet({
  loadingShell: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingHero: {
    borderWidth: 1,
  },
  loadingStats: {
    flexDirection: 'row',
  },
  loadingStat: {
    flex: 1,
    borderWidth: 1,
  },
  loadingCard: {
    borderWidth: 1,
  },
});
