import React, { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import type { InputTab } from '../types';

interface InputTypeSelectorProps {
  activeTab: InputTab;
  onTabChange: (tab: InputTab) => void;
  disabled?: boolean;
  hasDrafts?: Partial<Record<InputTab, boolean>>;
}

const TABS: { key: InputTab; label: string; icon: string }[] = [
  { key: 'paste', label: 'Paste', icon: 'file' },
  { key: 'pdf', label: 'PDF', icon: 'file' },
  { key: 'youtube', label: 'Video', icon: 'play' },
];

export const InputTypeSelector = memo(function InputTypeSelector({
  activeTab,
  onTabChange,
  disabled,
  hasDrafts,
}: InputTypeSelectorProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: theme.spacing[2],
        padding: theme.spacing[1],
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.colors.semantic.backgroundMuted,
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const hasDraft = hasDrafts?.[tab.key];
        return (
          <Pressable
            accessibilityHint={`Switches to ${tab.label} study input`}
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive, disabled }}
            disabled={disabled}
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 44,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing[1],
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: isActive ? theme.colors.semantic.primary : theme.colors.semantic.border,
              backgroundColor: isActive ? theme.colors.semantic.primary : theme.colors.semantic.surfaceGlass,
              opacity: disabled ? 0.56 : pressed ? 0.86 : 1,
              paddingHorizontal: theme.spacing[2],
            })}
          >
            <Icon
              color={isActive ? theme.colors.text.inverse : theme.colors.text.secondary}
              name={tab.icon}
              size="sm"
            />
            <Text color={isActive ? 'text.inverse' : 'text.secondary'} variant="caption">{tab.label}</Text>
            {hasDraft ? (
              <View
                style={{
                  width: theme.spacing[2],
                  height: theme.spacing[2],
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: theme.colors.semantic.warning,
                }}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
});
