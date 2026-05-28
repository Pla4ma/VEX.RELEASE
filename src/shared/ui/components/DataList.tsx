/**
 * DataList Component
 *
 * Uses FlashList for optimal performance (60fps scrolling).
 *
 * Phase 7A.1 — FlashList migration
 *
 * Requirements:
 * - npm install @shopify/flash-list
 * - estimatedItemSize prop is REQUIRED
 */
import React, { useCallback, useRef, useState } from "react";
import { View, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { EmptyState, ErrorState, Skeleton } from "../state-components";
import { useTheme } from "../../../theme";
import { styles } from "./DataList.styles";
import { ListFooter } from "./DataList.ListFooter";
import { useItemRenderer } from "./DataList.useItemRenderer";
import type { DataListProps, DataListItem } from "./DataList.types";

export { SelectionToolbar } from "./DataList.SelectionToolbar";
export type { DataListProps, DataListItem, DataListSection } from "./DataList.types";

export function DataList<T extends Record<string, unknown>>({
  items, sections, renderItem,
  renderSectionHeader: _renderSectionHeader,
  renderEmpty, renderFooter, keyExtractor,
  loading = false, loadingMore = false, error = null, refreshing = false,
  emptyTitle = "No items found",
  emptySubtitle = "Try adjusting your filters or check back later",
  emptyIcon = "\uD83D\uDCED",
  selectionMode = "none", selectedIds = new Set(),
  onSelectionChange, onRefresh, onLoadMore, onRetry, onItemPress,
  itemHeight: _itemHeight, estimatedItemSize = 80,
  stickySectionHeadersEnabled = false, showsVerticalScrollIndicator = true,
  contentContainerStyle, style,
  maxToRenderPerBatch: _maxToRenderPerBatch = 10,
  windowSize: _windowSize = 5,
  removeClippedSubviews: _removeClippedSubviews = true,
  accessibilityLabel, getItemAccessibilityLabel,
}: DataListProps<T>) {
  const { theme } = useTheme();
  const listRef = useRef<unknown>(null);
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(
    new Set(),
  );
  const effectiveSelectedIds = onSelectionChange
    ? selectedIds
    : internalSelectedIds;
  const handleSelect = useCallback(
    (id: string) => {
      const newSet = new Set(effectiveSelectedIds);
      if (selectionMode === "single") {
        if (newSet.has(id)) { newSet.clear(); }
        else { newSet.clear(); newSet.add(id); }
      } else if (selectionMode === "multiple") {
        if (newSet.has(id)) { newSet.delete(id); }
        else { newSet.add(id); }
      }
      if (onSelectionChange) { onSelectionChange(newSet); }
      else { setInternalSelectedIds(newSet); }
    },
    [effectiveSelectedIds, selectionMode, onSelectionChange],
  );
  const handleItemPress = useCallback(
    (item: T, index: number, id: string) => {
      if (selectionMode !== "none") { handleSelect(id); }
      else if (onItemPress) { onItemPress(item, index); }
    },
    [selectionMode, handleSelect, onItemPress],
  );
  const renderItemWrapper = useItemRenderer<T>({
    renderItem, effectiveSelectedIds, handleSelect, handleItemPress,
    getItemAccessibilityLabel, theme,
  });
  const resolvedKeyExtractor = useCallback(
    (item: DataListItem<T>, index: number) =>
      keyExtractor ? keyExtractor(item.data, index) : item.id,
    [keyExtractor],
  );
  if (loading && items.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Skeleton variant="list" count={6} height={estimatedItemSize} />
      </View>
    );
  }
  if (error && items.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <ErrorState error={error} onRetry={onRetry} title="Failed to load" />
      </View>
    );
  }
  if (items.length === 0 && !loading) {
    if (renderEmpty) {
      return <View style={[styles.container, style]}>{renderEmpty()}</View>;
    }
    return (
      <View style={[styles.container, style]}>
        <EmptyState
          icon={emptyIcon} title={emptyTitle} subtitle={emptySubtitle}
          actionLabel={onRetry ? "Try Again" : undefined} onAction={onRetry}
        />
      </View>
    );
  }
  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing} onRefresh={onRefresh}
      tintColor={theme.colors.primary[500]}
      colors={[theme.colors.primary[500]]}
    />
  ) : undefined;
  return (
    <View style={[styles.container, style]} accessibilityLabel={accessibilityLabel}>
      <FlashList
        ref={listRef}
        data={items}
        renderItem={renderItemWrapper}
        keyExtractor={resolvedKeyExtractor}
        estimatedItemSize={estimatedItemSize || 80}
        refreshControl={refreshControl}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          <>
            <ListFooter loading={loadingMore} theme={theme} />
            {renderFooter?.()}
          </>
        )}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        stickyHeaderIndices={
          stickySectionHeadersEnabled && sections
            ? sections.reduce((indices: number[], section, index) => {
                const sectionStart =
                  sections.slice(0, index)
                    .reduce((sum, s) => sum + s.data.length, 0) + index;
                indices.push(sectionStart);
                return indices;
              }, [])
            : undefined
        }
      />
    </View>
  );
}

export default DataList;
