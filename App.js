/**
 * VEX App Entry Point for Expo
 * 
 * This file is used by Expo for all platforms (iOS, Android, Web)
 */

import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { App } from './src/app/App';

// Sentry is initialized in src/app/App.tsx via initSentry() which uses EXPO_PUBLIC_SENTRY_DSN
registerRootComponent(App);

// Enable React DevTools integration in development
if (__DEV__) {
  require('./src/app/bootstrap').bootstrapDevelopment();
}
