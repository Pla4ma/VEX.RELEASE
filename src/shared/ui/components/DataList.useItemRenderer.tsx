/**
 * DataList — renderItemWrapper hook
 */
import React, { useCallback } from 'react';
import { View, ActivityIndicator, Pressable } from 'react-native';
import { styles } from './DataList.styles';
import type { DataListItem } from './DataList.types';
import type { Theme } from '../../../theme';

interface UseItemRendererOptions<T> {
  renderItem: (
    item: T,
    index: number,
    context: { isSelected: boolean; isDragging: boolean; onSelect: () => void },
  ) => React.ReactElement;
  effectiveSelectedIds: Set<string>;
  handleSelect: (id: string) => void;
  handleItemPress: (item: T, index: number, id: string) => void;
  getItemAccessibilityLabel?: (item: T) => string;
  theme: Theme;
}

export function useItemRenderer<T extends Record<string, unknown>>({
  renderItem,
  effectiveSelectedIds,
  handleSelect,
  handleItemPress,
  getItemAccessibilityLabel,
  theme,
}: UseItemRendererOptions<T>) {
  return useCallback(
    ({ item, index }: { item: DataListItem<T>; index: number }) => {
      const isSelected = effectiveSelectedIds.has(item.id);
      const context = {
        isSelected,
        isDragging: false,
        onSelect: () => handleSelect(item.id),
      };
      return (
        <Pressable
          onPress={() => handleItemPress(item.data, index, item.id)}
          disabled={item.disabled}
          accessibilityLabel={getItemAccessibilityLabel?.(item.data)}
          accessibilityState={{ selected: isSelected, disabled: item.disabled }}
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <View style={[item.loading && styles.itemLoading]}>
            {renderItem(item.data, index, context)}
            {item.loading && (
              <View style={styles.itemLoadingOverlay}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary[500]}
                />
              </View>
            )}
          </View>
        </Pressable>
      );
    },
    [
      renderItem,
      effectiveSelectedIds,
      handleSelect,
      handleItemPress,
      getItemAccessibilityLabel,
      theme,
    ],
  );
}
