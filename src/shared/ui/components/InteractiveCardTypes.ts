import type { ViewStyle } from 'react-native';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';
export type CardSize = 'sm' | 'md' | 'lg';

export interface InteractiveCardProps {
  children: React.ReactNode;
  onPress?: () => Promise<void> | void;
  onLongPress?: () => void;
  variant?: CardVariant;
  size?: CardSize;
  style?: ViewStyle;
  state?: 'default' | 'loading' | 'disabled' | 'error' | 'success';
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
  disabled?: boolean;
}

export const variantStyles: Record<CardVariant, ViewStyle> = {
  default: { backgroundColor: 'transparent', borderWidth: 0 },
  elevated: { backgroundColor: 'transparent', borderWidth: 0 },
  outlined: { backgroundColor: 'transparent', borderWidth: 1 },
  ghost: { backgroundColor: 'transparent', borderWidth: 0 },
};

export const sizeStyles: Record<CardSize, ViewStyle> = {
  sm: { padding: 12, borderRadius: 12 },
  md: { padding: 16, borderRadius: 16 },
  lg: { padding: 20, borderRadius: 20 },
};

// Theme-dependent variant styles that need theme access
export function getThemeVariantStyles(theme: { colors: { background: Record<string, string>; text: Record<string, string>; border: Record<string, string> } }): Record<CardVariant, ViewStyle> {
  return {
    default: { backgroundColor: theme.colors.background.secondary, borderWidth: 0 },
    elevated: {
      backgroundColor: theme.colors.background.secondary,
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border.DEFAULT,
    },
    ghost: { backgroundColor: 'transparent', borderWidth: 0 },
  };
}
