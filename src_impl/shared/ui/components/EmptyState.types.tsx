export interface EmptyStateProps {
    /** Icon/illustration component or emoji string */
    icon?: React.ReactNode | string;
    /** Main heading */
    title: string;
    /** Descriptive text */
    description?: string;
    /** Primary CTA button text */
    actionLabel?: string;
    /** Primary CTA handler */
    onAction?: () => void;
    /** Secondary action text */
    secondaryLabel?: string;
    /** Secondary action handler */
    onSecondary?: () => void;
    /** Custom styles */
    style?: ViewStyle;
    /** Test ID for testing */
    testID?: string;
    /** First-use experience variant */
    variant?: 'default' | 'first-use' | 'error' | 'offline';
    /** Additional context for first-use variant */
    featureName?: string;
}
