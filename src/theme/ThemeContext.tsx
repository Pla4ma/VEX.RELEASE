/**
 * Theme Context Provider
 *
 * React Context and Provider for theme management.
 * Handles theme mode state and provides theme to the component tree.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import type { Theme, ThemeContextValue, ThemeMode, ThemeConfig } from './types';
export type { ThemeMode } from './types';
import { createTheme } from './createTheme';
import { ThemeService } from './ThemeService';
import { defaultThemeConfig } from './config';
import { captureException } from '../config/sentry';

/**
 * Theme context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: ReactNode;
  config?: Partial<ThemeConfig>;
  initialMode?: ThemeMode;
}

/**
 * Theme Provider Component
 *
 * Wraps the app and provides theme context to all children.
 */
export function ThemeProvider({
  children,
  config: userConfig,
  initialMode,
}: ThemeProviderProps): React.ReactNode {
  // Merge with default config
  const config = useMemo(
    () => ({ ...defaultThemeConfig, ...userConfig }),
    [userConfig],
  );

  // Get system color scheme
  const systemColorScheme = useColorScheme();

  // Initialize theme service
  const themeService = useMemo(() => new ThemeService(), []);

  // State for theme mode
  const [mode, setModeState] = useState<ThemeMode>(() => {
    // Try to restore from storage or use initialMode/default
    if (initialMode) {
      return initialMode;
    }

    // Try to get from service/storage
    const storedMode = themeService.getStoredMode();
    if (storedMode) {
      return storedMode;
    }

    return config.defaultMode;
  });

  // Determine effective mode (handle 'system' option)
  const effectiveMode = useMemo((): 'light' | 'dark' => {
    if (mode === 'system') {
      return (systemColorScheme as 'light' | 'dark') ?? 'light';
    }
    return mode === 'dark' ? 'dark' : 'light';
  }, [mode, systemColorScheme]);

  // Create theme object
  const theme = useMemo(() => createTheme(effectiveMode), [effectiveMode]);

  // Set mode handler with persistence
  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setModeState(newMode);

      if (config.persistThemePreference) {
        themeService.persistMode(newMode);
      }

      // Emit theme change event
      themeService.emitThemeChange(newMode, effectiveMode);
    },
    [config.persistThemePreference, themeService, effectiveMode],
  );

  // Toggle between light and dark
  const toggleMode = useCallback(() => {
    const newMode: ThemeMode =
      mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark')
        ? 'light'
        : 'dark';
    setMode(newMode);
  }, [mode, systemColorScheme, setMode]);

  // Sync with system preference if enabled
  useEffect(() => {
    if (config.respectSystemPreference && mode === 'system') {
      themeService.emitThemeChange('system', effectiveMode);
    }
  }, [effectiveMode, mode, config.respectSystemPreference, themeService]);

  // Initialize theme service
  useEffect(() => {
    try {
      themeService.initialize();
    } catch (error) {
      captureException(
        error instanceof Error
          ? error
          : new Error('Theme service initialization failed'),
        { area: 'ThemeProvider.initialize' },
      );
    }
  }, [themeService]);

  // Context value
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      setMode,
      toggleMode,
      isDark: effectiveMode === 'dark',
      isSystem: mode === 'system',
    }),
    [theme, mode, setMode, toggleMode, effectiveMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 *
 * @throws {Error} If used outside of ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    const defaultTheme = createTheme('dark');
    return {
      theme: defaultTheme,
      mode: 'dark',
      setMode: () => undefined,
      toggleMode: () => undefined,
      isDark: false,
      isSystem: false,
    };
  }

  return context;
}

/**
 * Hook to access just the theme object
 */
export function useThemeObject(): Theme {
  return useTheme().theme;
}

/**
 * Hook to check if current theme is dark mode
 */
export function useIsDarkMode(): boolean {
  return useTheme().isDark;
}

/**
 * Export the context for advanced use cases
 */
export { ThemeContext };
