export interface StatusFeedbackProps {
    status: AsyncStatus;
    message?: string;
    description?: string;
    onRetry?: () => void;
    onDismiss?: () => void;
    variant?: 'inline' | 'banner' | 'card';
    style?: ViewStyle;
    autoDismissSuccess?: boolean;
    autoDismissDelay?: number;
    showIcon?: boolean;
    actionLabel?: string;
    onAction?: () => void;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error' | 'retrying' | 'offline';
