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

// Initialize Sentry immediately — wrapped in try/catch since Sentry uses
// native PlatformConstants which may not be registered in Expo Go.
try {
  initSentry();
} catch (e) {
  // Sentry unavailable in Expo Go — continue without it
}

// Initialize RevenueCat (pass null for userId - will be set after login)
// react-native-purchases is shimmed in Expo Go, so this is safe but no-op.
void initializeRevenueCat(null);

try {
  initializeNotifications();
} catch (e) {
  // Notifications may not be fully available in Expo Go
}

bootstrapApp();

try {
  initializeDevContrastChecker();
} catch (e) {
  // Accessibility checker unavailable — non-critical
}


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
