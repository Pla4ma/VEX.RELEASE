/**
 * Modal props
 */
export interface ModalProps {
    /** Whether modal is visible */
    visible: boolean;
    /** Modal content */
    children: ReactNode;
    /** Modal title */
    title?: string;
    /** Called when modal should close */
    onClose: () => void;
    /** Whether to show close button */
    showCloseButton?: boolean;
    /** Whether to close on backdrop press */
    closeOnBackdropPress?: boolean;
    /** Whether to close on back button (Android) */
    closeOnBackButton?: boolean;
    /** Custom header content */
    header?: ReactNode;
    /** Custom footer content */
    footer?: ReactNode;
    /** Modal animation type */
    animation?: 'fade' | 'slide' | 'scale';
    /** Custom styles */
    style?: ViewStyle;
    /** Content container style */
    contentStyle?: ViewStyle;
    /** Test ID */
    testID?: string;
}
