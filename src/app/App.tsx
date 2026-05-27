/**
 * VEX App Root Component
 *
 * Main application component that wraps all providers and renders the root navigator.
 */

import React, { useEffect } from "react";
import { Platform, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { QueryProvider } from "../api";
import { initSentry } from "../config/sentry";
import { ErrorBoundary } from "../errors/ErrorBoundary";

import { RootNavigator } from "../navigation/RootNavigator";

import { ToastProvider } from "../shared/ui/components/Toast";
import { initializeDevContrastChecker } from "../shared/accessibility/contrast-checker";
import { ThemeProvider } from "../theme";
import { bootstrapApp } from "./bootstrap";
import { markColdStart } from "./cold-start-performance";

const rootViewStyle: StyleProp<ViewStyle> = { flex: 1 };

function useAppRuntimeBootstrap(): void {
  useEffect(() => {
    markColdStart("app_mounted");

    try {
      initSentry();
    } catch (error: unknown) {
      // Sentry unavailable in Expo Go.
    }

    bootstrapApp();

    try {
      initializeDevContrastChecker();
    } catch (error: unknown) {
      // Accessibility checker unavailable — non-critical.
    }
  }, []);
}

let GestureHandlerRootView: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ children }) => <>{children}</>;

if (Platform.OS !== "web") {
  try {
    const gestureHandler = require("react-native-gesture-handler");
    GestureHandlerRootView =
      gestureHandler.GestureHandlerRootView ||
      (({ children, style }) => <View style={style}>{children}</View>);
  } catch (error: unknown) {
    GestureHandlerRootView = ({ children, style }) => (
      <View style={style}>{children}</View>
    );
  }
}

export const App: React.FC = () => {
  useAppRuntimeBootstrap();

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
    </GestureHandlerRootView>
  );
};

export default App;
