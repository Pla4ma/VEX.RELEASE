/**
 * Toast props
 */
export interface ToastProps {
    /** Toast message */
    message: string;
    /** Toast type */
    type?: ToastType;
    /** Toast position */
    position?: ToastPosition;
    /** Whether toast is visible */
    visible: boolean;
    /** Auto hide duration (ms) */
    duration?: number;
    /** Called when toast hides */
    onHide?: () => void;
    /** Custom icon */
    icon?: IconName;
    /** Custom style */
    style?: ViewStyle;
}
