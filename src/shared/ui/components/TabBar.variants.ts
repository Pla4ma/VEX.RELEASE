import type { ViewStyle, TextStyle } from 'react-native';
import type { TabBarProps } from './TabBar.types';
import { launchColors } from '@theme/tokens/launch-colors';

interface ThemeColors {
  primary: { [key: string]: string | undefined; 500: string };
  text: { secondary: string };
  background: { secondary: string; tertiary: string };
  border: { DEFAULT: string };
}

interface VariantStyleResult {
  container: ViewStyle;
  text: TextStyle;
  icon: { color: string };
}

export function getVariantStyles(
  variant: NonNullable<TabBarProps['variant']>,
  isActive: boolean,
  theme: { colors: ThemeColors },
): VariantStyleResult {
  switch (variant) {
    case 'pills':
      return {
        container: {
          backgroundColor: isActive
            ? theme.colors.primary[500]
            : 'transparent',
          borderRadius: 999,
        },
        text: {
          color: isActive
            ? launchColors.hex_ffffff
            : theme.colors.text.secondary,
        },
        icon: {
          color: isActive
            ? launchColors.hex_ffffff
            : theme.colors.text.secondary,
        },
      };
    case 'underline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderBottomWidth: 2,
          borderBottomColor: isActive
            ? theme.colors.primary[500]
            : 'transparent',
        },
        text: {
          color: isActive
            ? theme.colors.primary[500]
            : theme.colors.text.secondary,
        },
        icon: {
          color: isActive
            ? theme.colors.primary[500]
            : theme.colors.text.secondary,
        },
      };
    case 'buttons':
      return {
        container: {
          backgroundColor: isActive
            ? theme.colors.background.tertiary
            : theme.colors.background.secondary,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: isActive
            ? theme.colors.primary[500]
            : theme.colors.border.DEFAULT,
        },
        text: {
          color: isActive
            ? theme.colors.primary[500]
            : theme.colors.text.secondary,
        },
        icon: {
          color: isActive
            ? theme.colors.primary[500]
            : theme.colors.text.secondary,
        },
      };
    default:
      return {
        container: {
          backgroundColor: isActive
            ? `${theme.colors.primary[500]}20`
            : 'transparent',
          borderRadius: 8,
        },
        text: {
          color: isActive
            ? theme.colors.primary[500]
            : theme.colors.text.secondary,
        },
        icon: {
          color: isActive
            ? theme.colors.primary[500]
            : theme.colors.text.secondary,
        },
      };
  }
}
