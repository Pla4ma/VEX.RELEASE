/**
 * App Providers
 *
 * Centralized provider composition for the VEX app stack.
 * Integrates: Expo SDK 54, TanStack Query, React Navigation, Reanimated, NetInfo, Secure Store, MMKV
 */

import React, { useEffect } from "react";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { QueryProvider } from "../../api";
import { ThemeProvider } from "../../theme";
import { ErrorBoundary } from "../../errors";
import { getNetInfoAdapter } from "../../network";
import { getSecureStorage } from "../../persistence";
import { addBreadcrumb, captureException } from "../../config/sentry";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Initialize core services
 */
const initializeServices = async (): Promise<() => void> => {
  try {
    const netInfo = getNetInfoAdapter();
    await netInfo.initialize();
    getSecureStorage();

    addBreadcrumb("Core providers initialized", "app.providers");

    return () => {};
  } catch (error) {
    captureException(
      error instanceof Error
        ? error
        : new Error("Failed to initialize app providers"),
      { area: "AppProviders.initializeServices" },
    );
    return () => {}; // Return empty cleanup function on error
  }
};

/**
 * Root provider component
 *
 * Provider order (important):
 1. GestureHandlerRootView - gesture system
 2. SafeAreaProvider - safe area insets
 3. QueryProvider - data fetching with network awareness
 4. ThemeProvider - styling
 5. ErrorBoundary - error handling
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let disposed = false;

    void initializeServices().then((nextCleanup) => {
      if (disposed) {
        nextCleanup();
        return;
      }
      cleanup = nextCleanup;
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  // Web doesn't need GestureHandlerRootView
  const Container = Platform.OS === "web" ? View : GestureHandlerRootView;
  const containerProps = Platform.OS === "web" ? {} : { style: { flex: 1 } };

  return (
    <Container {...containerProps}>
      <SafeAreaProvider>
        <QueryProvider>
          <ThemeProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </ThemeProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </Container>
  );
};
