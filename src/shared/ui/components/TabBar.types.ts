import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import type { IconProps } from '../../../icons';

export interface TabItem {
  id: string;
  label: string;
  icon?: IconProps['name'];
  badge?: string | number;
  disabled?: boolean;
  disabledReason?: string;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  scrollable?: boolean;
  style?: ViewStyle;
}

export interface TabItemProps {
  item: TabItem;
  isActive: boolean;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
  variant: NonNullable<TabBarProps['variant']>;
  size: NonNullable<TabBarProps['size']>;
  showLabels: boolean;
}

export interface BreadcrumbProps {
  items: Array<{ label: string; onPress?: () => void }>;
  separator?: string;
  style?: ViewStyle;
}

export const sizeConfig = {
  sm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 12 },
  md: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
  lg: { paddingVertical: 14, paddingHorizontal: 20, fontSize: 16 },
} as const;
