/**
 * Input Type Selector Component
 * Tab navigation for Paste/PDF/YouTube inputs with draft indicators
 */

import React, { memo } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { Icon } from '../../../icons';
import type { InputTab } from '../types';
import { CONTENT_STATUS_CONFIG } from '../constants';
import { createSheet } from '@/shared/ui/create-sheet';

interface InputTypeSelectorProps {
  activeTab: InputTab;
  onTabChange: (tab: InputTab) => void;
  disabled?: boolean;
  hasDrafts?: Partial<Record<InputTab, boolean>>;
}

const TABS: { key: InputTab; label: string; icon: string }[] = [
  { key: 'paste', label: 'Paste Text', icon: 'file-text' },
  { key: 'pdf', label: 'Upload PDF', icon: 'file' },
  { key: 'youtube', label: 'YouTube', icon: 'video' },
];

export const InputTypeSelector: React.FC<InputTypeSelectorProps> = memo(
  ({ activeTab, onTabChange, disabled, hasDrafts }) => {
    const { theme } = useTheme();

    return (
      <View style={styles.container}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const hasDraft = hasDrafts?.[tab.key];

          return (
            <Pressable
              key={tab.key}
              style={({ pressed }) => [
                styles.tab,
                isActive && {
                  backgroundColor: theme.colors.primary[500],
                },
                disabled && styles.tabDisabled,
                pressed && !disabled && { opacity: 0.8 },
              ]}
              onPress={() => !disabled && onTabChange(tab.key)}
              disabled={disabled}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
              accessibilityHint="Activates this control">
              <Icon
                name={tab.icon}
                size="sm"
                color={isActive ? theme.colors.background.primary : theme.colors.text.secondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive
                      ? theme.colors.background.primary
                      : theme.colors.text.secondary,
                  },
                ]}
              >
                {tab.label}
              </Text>
              {hasDraft && (
                <View
                  style={[
                    styles.draftIndicator,
                    { backgroundColor: theme.colors.warning[500] },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    );
  }
);

InputTypeSelector.displayName = 'InputTypeSelector';

const styles = createSheet({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  tabDisabled: {
    opacity: 0.5,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  draftIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
});
