/**
 * VEX App Root Component
 *
 * Main application component that wraps all providers and renders the root navigator.
 */

import React, { useEffect, useState } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
  Urbanist_900Black,
  useFonts,
} from '@expo-google-fonts/urbanist';

import { QueryProvider } from '../api/QueryProvider';
import { initSentry, wireSentryToDebug } from '../config/sentry';
import { ErrorBoundary } from '../errors/ErrorBoundary';
import { PrivacyBlurOverlay } from '../components/primitives/PrivacyBlurOverlay';

import { RootNavigator } from '../navigation/RootNavigator';

import { ToastProvider } from '../shared/ui/components/Toast';
import { initializeDevContrastChecker } from '../shared/accessibility/contrast-checker';
import { ThemeProvider } from '../theme/ThemeContext';
import { bootstrapApp } from './bootstrap';
import { markColdStart } from './cold-start-performance';

const rootViewStyle: StyleProp<ViewStyle> = { flex: 1 };

function useAppRuntimeBootstrap(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      markColdStart('app_mounted');

      try {
        initSentry();
        wireSentryToDebug();
      } catch {
        // Sentry init failure is non-fatal; already captured by ErrorBoundary
      }

      try {
        await bootstrapApp();
      } catch {
        // Startup services must not block rendering the app shell.
      }

      try {
        initializeDevContrastChecker();
      } catch {
        // Accessibility check failure is non-fatal
      }

      setReady(true);
    };
    void init();
  }, []);

  return ready;
}

let GestureHandlerRootView: React.ComponentType<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ children }) => <>{children}</>;

if (Platform.OS !== 'web') {
  try {
    // SAFETY: require() used dynamic/native lazy loading to avoid startup crashes before native module availability is known.
    const gestureHandler = require('react-native-gesture-handler');
    GestureHandlerRootView =
      gestureHandler.GestureHandlerRootView ||
      (({ children, style }) => <View style={style}>{children}</View>);
  } catch (error: unknown) {
    GestureHandlerRootView = ({ children, style }) => (
      <View style={style}>{children}</View>
    );
  }
}

export function App() {
  const isReady = useAppRuntimeBootstrap();
  const [fontsLoaded, fontError] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    Urbanist_900Black,
  });

  // If fonts fail to load (e.g. web native module shim issue), proceed without them
  const isFontReady = fontsLoaded || fontError != null;

  if (!isReady || !isFontReady) {
    return (
      <GestureHandlerRootView style={rootViewStyle}>
        <View style={rootViewStyle} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={rootViewStyle}>
      <SafeAreaProvider>
        <QueryProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <ToastProvider position="top" maxToasts={3}>
                  <RootNavigator />
                </ToastProvider>
              </ErrorBoundary>
            </ThemeProvider>
          </QueryProvider>
        </SafeAreaProvider>
        <PrivacyBlurOverlay />
      </GestureHandlerRootView>
  );
}
