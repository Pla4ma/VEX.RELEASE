import type { ViewStyle } from 'react-native';
import type { Theme } from '../../../theme';

export type AsyncStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'retrying'
  | 'offline';

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

export const STATUS_CONFIG: Record<AsyncStatus, { icon: string; title: string }> = {
  idle: { icon: '', title: '' },
  loading: { icon: '...', title: 'Loading' },
  retrying: { icon: 'R', title: 'Retrying' },
  success: { icon: '✓', title: 'Success' },
  error: { icon: '✕', title: 'Error' },
  offline: { icon: '!', title: 'Offline' },
};

export const getStatusColor = (status: AsyncStatus, theme: Theme): string => {
  switch (status) {
    case 'loading':
      return theme.colors.primary[500];
    case 'retrying':
      return theme.colors.warning.dark;
    case 'success':
      return theme.colors.success.dark;
    case 'error':
      return theme.colors.error.dark;
    case 'offline':
      return theme.colors.text.disabled;
    default:
      return 'transparent';
  }
};
