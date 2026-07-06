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
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      bold: { fontFamily: 'System', fontWeight: '700' as const },
      heavy: { fontFamily: 'System', fontWeight: '900' as const },
    },
  };
}
