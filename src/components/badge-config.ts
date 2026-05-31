import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import type { Theme } from '../theme';

export interface BadgeProps {
  children: string;
  variant?:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'secondary'
    | 'outline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: string;
  rightIcon?: string;
  onPress?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const sizeMap = {
  sm: { paddingVertical: 2, paddingHorizontal: 6, fontSize: 10, iconSize: 10 },
  md: { paddingVertical: 4, paddingHorizontal: 8, fontSize: 12, iconSize: 12 },
  lg: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 14, iconSize: 14 },
};

export type SizeKey = keyof typeof sizeMap;

export interface VariantStyles {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

export function getVariantStyles(
  variant: BadgeProps['variant'],
  theme: Theme,
): VariantStyles {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: theme.colors.primary[100],
        borderColor: theme.colors.primary[200],
        textColor: theme.colors.primary[700],
      };
    case 'success':
      return {
        backgroundColor: theme.colors.success.light + '30',
        borderColor: theme.colors.success.DEFAULT + '40',
        textColor: theme.colors.success.dark,
      };
    case 'warning':
      return {
        backgroundColor: theme.colors.warning.light + '30',
        borderColor: theme.colors.warning.DEFAULT + '40',
        textColor: theme.colors.warning.dark,
      };
    case 'error':
      return {
        backgroundColor: theme.colors.error.light + '30',
        borderColor: theme.colors.error.DEFAULT + '40',
        textColor: theme.colors.error.dark,
      };
    case 'info':
      return {
        backgroundColor: theme.colors.info.light + '30',
        borderColor: theme.colors.info.DEFAULT + '40',
        textColor: theme.colors.info.dark,
      };
    case 'secondary':
      return {
        backgroundColor: theme.colors.background.tertiary,
        borderColor: theme.colors.border.DEFAULT,
        textColor: theme.colors.text.secondary,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderColor: theme.colors.border.strong,
        textColor: theme.colors.text.primary,
      };
    default:
      return {
        backgroundColor: theme.colors.background.secondary,
        borderColor: theme.colors.border.light,
        textColor: theme.colors.text.primary,
      };
  }
}
