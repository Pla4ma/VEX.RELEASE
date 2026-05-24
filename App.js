/**
 * VEX App Entry Point for Expo
 * 
 * This file is used by Expo for all platforms (iOS, Android, Web)
 */

import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { App } from './src/app/App';
registerRootComponent(App);

// Enable React DevTools integration in development
if (__DEV__) {
  require('./src/app/bootstrap').bootstrapDevelopment();
}
