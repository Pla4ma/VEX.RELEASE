import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { SettingItem } from './SettingItem';
import { eventBus } from '../../../events';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


interface SettingsDataControlSectionProps {
  userId: string;
}

export function SettingsDataControlSection({
  userId,
}: SettingsDataControlSectionProps) {
  return (
    <View style={styles.settingsGroup}>
      <SettingItem label="Data Retention" value="standard" onPress={() => {}} />
      <SettingItem
        label="Auto Export"
        value="disabled"
        onPress={() => {}}
      />
      <Pressable
        style={({ pressed }) => [
          styles.actionRow,
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => {
          eventBus.publish('analytics:export_requested', {
            jobId: `export_${Date.now()}`,
            userId,
            format: 'json',
          });
        }}
        accessibilityLabel="Export data"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <View>
          <Text style={styles.actionRowText}>Export Data</Text>
          <Text style={styles.actionRowSubtext}>
            Download your data →
          </Text>
        </View>
        <Text style={styles.actionRowArrow}>→</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.actionRow,
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => {
          Alert.alert(
            'Import Data',
            'Import data from a previous export file.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Select File', style: 'default' },
            ],
          );
        }}
        accessibilityLabel="Import data"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <View>
          <Text style={styles.actionRowText}>Import Data</Text>
          <Text style={styles.actionRowSubtext}>
            Restore from backup →
          </Text>
        </View>
        <Text style={styles.actionRowArrow}>→</Text>
      </Pressable>
      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <Pressable
          style={({ pressed }) => [
            styles.dangerAction,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => {
            Alert.alert(
              'Delete All Data?',
              'This will permanently delete all your data. This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert(
                      'Final Confirmation',
                      'Type "DELETE" to permanently delete all data.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete Forever', style: 'destructive' },
                      ],
                    );
                  },
                },
              ],
            );
          }}
          accessibilityLabel="Delete all my data"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text style={styles.dangerActionText}>Delete All My Data</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = createSheet({
  settingsGroup: {
    backgroundColor: lightColors.text.inverse,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.surface.button,
  },
  actionRowText: { fontSize: 16, color: lightColors.semantic.primary },
  actionRowSubtext: {
    fontSize: 12,
    color: lightColors.text.muted,
    marginTop: 2,
  },
  actionRowArrow: { fontSize: 18, color: lightColors.semantic.primary },
  dangerZone: {
    marginTop: 24,
    padding: 16,
    backgroundColor: lightColors.error[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightColors.error.light,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.semantic.danger,
    marginBottom: 12,
  },
  dangerAction: {
    backgroundColor: lightColors.semantic.danger,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerActionText: {
    color: lightColors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
});
