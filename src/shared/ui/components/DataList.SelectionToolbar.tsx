/**
 * DataList — SelectionToolbar component
 */
import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { styles } from './DataList.styles';
import type { SelectionToolbarProps } from './DataList.types';

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedCount,
  totalCount,
  onClear,
  onSelectAll,
  actions,
}) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.toolbar,
        { backgroundColor: theme.colors.background.secondary },
      ]}
    >
      <View style={styles.toolbarLeft}>
        <Text variant="body" color="text.primary">
          {selectedCount} selected
        </Text>
        <Pressable
          onPress={selectedCount === totalCount ? onClear : onSelectAll}
          accessibilityLabel="Selection action"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text variant="caption" color="primary.500">
            {selectedCount === totalCount ? 'Clear' : 'Select All'}
          </Text>
        </Pressable>
      </View>
      {actions && (
        <View style={styles.toolbarActions}>
          {actions.map((action, index) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={[
                styles.toolbarAction,
                action.destructive && {
                  backgroundColor: theme.colors.error.DEFAULT + '20',
                },
              ]}
              accessibilityLabel="Selection action"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <Text
                variant="caption"
                color={action.destructive ? 'error.DEFAULT' : 'primary.500'}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};
