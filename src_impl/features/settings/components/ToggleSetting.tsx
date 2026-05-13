/**
 * Toggle Setting Component
 * Setting row with a toggle switch
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';

interface ToggleSettingProps {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  description?: string;
}

export function ToggleSetting({ label, value, onToggle, description }: ToggleSettingProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Pressable
        onPress={() => onToggle(!value)}
        style={({ pressed }) => [styles.toggle, value ? styles.toggleActive : styles.toggleInactive, pressed && { opacity: 0.8 }]}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control">
        <View style={[styles.toggleKnob, value ? styles.knobActive : styles.knobInactive]} />
      </Pressable>
    </View>
  );
}

const styles = createSheet({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'theme.colors.background.primary',
    borderBottomWidth: 1,
    borderBottomColor: 'theme.colors.primary[500]',
  },
  content: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    color: 'theme.colors.primary[500]',
  },
  description: {
    fontSize: 12,
    color: 'theme.colors.primary[500]',
    marginTop: 4,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: 'theme.colors.primary[500]',
  },
  toggleInactive: {
    backgroundColor: 'theme.colors.primary[500]',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'theme.colors.background.primary',
  },
  knobActive: {
    marginLeft: 'auto',
  },
  knobInactive: {
    marginLeft: 0,
  },
});
