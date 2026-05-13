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

export interface BreadcrumbProps {
    items: Array<{ label: string; onPress?: () => void }>;
    separator?: string;
    style?: ViewStyle;
}
