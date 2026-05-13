export interface BadgeProps {
    /** Badge text */
    children: string;
    /** Visual variant */
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'outline';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Left icon name */
    leftIcon?: string;
    /** Right icon name */
    rightIcon?: string;
    /** Click handler */
    onPress?: () => void;
    /** Remove handler (shows X icon) */
    onRemove?: () => void;
    /** Disabled state */
    disabled?: boolean;
    /** Full width */
    fullWidth?: boolean;
    /** Custom styles */
    style?: StyleProp<ViewStyle>;
    /** Text style */
    textStyle?: StyleProp<TextStyle>;
}
