/**
 * DataListFlashList — type definitions
 */
import type { ReactElement } from "react";
import type { ViewStyle } from "react-native";

export interface DataListItem<T> {
  id: string;
  data: T;
  disabled?: boolean;
  loading?: boolean;
}

export interface DataListSection<T> {
  title: string;
  data: DataListItem<T>[];
  key?: string;
}

export type DataListFlashListProps<T> = {
  items: DataListItem<T>[];
  sections?: DataListSection<T>[];
  renderItem: (
    item: T,
    index: number,
    context: { isSelected: boolean; isDragging: boolean; onSelect: () => void },
  ) => ReactElement;
  renderSectionHeader?: (section: DataListSection<T>) => ReactElement;
  renderEmpty?: () => ReactElement;
  renderFooter?: () => ReactElement;
  keyExtractor?: (item: T, index: number) => string;
  loading?: boolean;
  loadingMore?: boolean;
  error?: Error | null;
  refreshing?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyIcon?: string;
  selectionMode?: "none" | "single" | "multiple";
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onRefresh?: () => void | Promise<void>;
  onLoadMore?: () => void | Promise<void>;
  onRetry?: () => void;
  onItemPress?: (item: T, index: number) => void;
  estimatedItemSize: number;
  stickySectionHeadersEnabled?: boolean;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  accessibilityLabel?: string;
  getItemAccessibilityLabel?: (item: T) => string;
};

export interface SelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onClear: () => void;
  onSelectAll: () => void;
  actions?: Array<{
    icon: string;
    label: string;
    onPress: () => void;
    destructive?: boolean;
  }>;
}
