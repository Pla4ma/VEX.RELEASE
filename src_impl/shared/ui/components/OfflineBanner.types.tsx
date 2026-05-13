export interface OfflineBannerProps {
    /** Custom message to display */
    message?: string;
    /** Callback when banner is dismissed */
    onDismiss?: () => void;
    /** Callback when banner reappears */
    onReappear?: () => void;
}
