/**
 * Loading props
 */
export interface LoadingProps {
    /** Loading variant */
    variant?: LoadingVariant;
    /** Loading size */
    size?: LoadingSize;
    /** Loading text */
    text?: string;
    /** Whether to show full screen overlay */
    fullScreen?: boolean;
    /** Custom style */
    style?: ViewStyle;
    /** Whether loading is visible */
    visible?: boolean;
    /** Accessibility label */
    accessibilityLabel?: string;
}
