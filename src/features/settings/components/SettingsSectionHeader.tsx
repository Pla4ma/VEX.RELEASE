import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';

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
        <ActivityIndicator size="small" color={launchColors.hex_6366f1} />
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
    backgroundColor: launchColors.hex_ffffff,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: launchColors.hex_111827,
  },
});
