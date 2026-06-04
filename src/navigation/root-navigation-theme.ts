import type { Theme as NavigationTheme } from '@react-navigation/native';
import type { Theme } from '../theme';

export function createRootNavigationTheme(
  theme: Theme,
  isDark: boolean,
): NavigationTheme {
  return {
    dark: isDark,
    colors: {
      primary: theme.colors.primary[500],
      background: theme.colors.semantic.background,
      card: theme.colors.semantic.surface,
      text: theme.colors.text.primary,
      border: theme.colors.semantic.border,
      notification: theme.colors.error.DEFAULT,
    },
  };
}
