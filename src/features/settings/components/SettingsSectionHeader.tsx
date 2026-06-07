import React from 'react';
import { View, Text } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


interface SettingsSectionHeaderProps {
  title: string;
  isSyncing: boolean;
}

export function SettingsSectionHeader({
  title,
  isSyncing,
}: SettingsSectionHeaderProps) {
  return (
    <View style={styles.categoryHeader}>
      <Text style={styles.categoryTitle}>{title}</Text>
      {isSyncing && (
        <Skeleton width={16} height={16} variant="circular" />
      )}
    </View>
  );
}

const styles = createSheet({
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: lightColors.text.inverse,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: lightColors.semantic.backgroundMuted,
  },
});
