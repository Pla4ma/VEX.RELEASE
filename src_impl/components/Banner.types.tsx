export interface BannerProps {
    /** Banner title */
    title: string;
    /** Banner description */
    description?: string;
    /** Visual variant */
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gradient';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Icon name (left side) */
    icon?: string;
    /** Background image */
    backgroundImage?: ImageSourcePropType;
    /** Primary action button text */
    actionText?: string;
    /** Primary action handler */
    onAction?: () => void;
    /** Secondary action text */
    secondaryActionText?: string;
    /** Secondary action handler */
    onSecondaryAction?: () => void;
    /** Close/dismiss handler */
    onDismiss?: () => void;
    /** Full width */
    fullWidth?: boolean;
    /** Custom styles */
    style?: StyleProp<ViewStyle>;
}
