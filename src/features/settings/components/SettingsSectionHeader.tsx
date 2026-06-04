import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
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
        <ActivityIndicator size="small" color={lightColors.semantic.primary} />
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
