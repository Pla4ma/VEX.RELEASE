/**
 * VEX App Root Component
 *
 * Main application component that wraps all providers and renders the root navigator.
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../theme';
import { RootNavigator } from '../navigation/RootNavigator';
import { ErrorBoundary } from '../errors/ErrorBoundary';
import { ToastProvider } from '../shared/ui/components/Toast';
import { QueryProvider } from '../api';
import { initSentry } from '../config/sentry';
import { initializeRevenueCat } from '../shared/monetization/revenuecat-service';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { initializeNotifications } from '../features/ai-coach/services';
import { bootstrapApp } from './bootstrap';
import { initializeDevContrastChecker } from '../shared/accessibility/contrast-checker';
import { SpectacleOverlay } from '../features/spectacle/components/SpectacleOverlay';

// Initialize Sentry immediately
initSentry();

// Initialize RevenueCat (pass null for userId - will be set after login)
initializeRevenueCat(null);
initializeNotifications();
bootstrapApp();
initializeDevContrastChecker();

// Conditionally import GestureHandler for native only
let GestureHandlerRootView: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({ children }) => <>{children}</>;

if (Platform.OS !== 'web') {
  try {
    const gestureHandler = require('react-native-gesture-handler');
    GestureHandlerRootView = gestureHandler.GestureHandlerRootView || (({ children, style }) => <View style={style}>{children}</View>);
  } catch (e) {
    // Fallback to View wrapper if not available
    GestureHandlerRootView = ({ children, style }) => <View style={style}>{children}</View>;
  }
}

/**
 * Root App component
 */
export const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <ToastProvider position="top" maxToasts={3}>
                <SpectacleOverlay>
                  <RootNavigator />
                </SpectacleOverlay>
              </ToastProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
