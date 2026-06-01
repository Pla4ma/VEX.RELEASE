import type { ViewStyle, PressableProps } from 'react-native';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';
export type CardSize = 'sm' | 'md' | 'lg';
export type CardState = 'default' | 'loading' | 'disabled' | 'error' | 'selected';

export interface InteractiveCardProps extends Omit<
  PressableProps,
  'onPress' | 'style'
> {
  children: React.ReactNode;
  onPress?: () => void | Promise<void>;
  onLongPress?: () => void;
  variant?: CardVariant;
  size?: CardSize;
  style?: ViewStyle;
  state?: CardState;
  loadingMessage?: string;
  disabledReason?: string;
  errorMessage?: string;
  onRetry?: () => void;
  icon?: string;
  badge?: string | number;
  badgeColor?: string;
  selected?: boolean;
  selectionIcon?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  hapticOnPress?: boolean;
  scaleOnPress?: number;
  fullWidth?: boolean;
  aspectRatio?: number;
}
