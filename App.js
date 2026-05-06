/**
 * VEX App Entry Point for Expo
 * 
 * This file is used by Expo for all platforms (iOS, Android, Web)
 */

import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { App } from './src/app_root/App';

// Sentry is initialized in src/app_root/App.tsx via initSentry() which uses EXPO_PUBLIC_SENTRY_DSN
registerRootComponent(App);

// Enable React DevTools integration in development
if (__DEV__) {
  require('./src/app_root/bootstrap').bootstrapDevelopment();
}
