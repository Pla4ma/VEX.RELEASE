/**
 * VEX App Entry Point for Expo
 *
 * This file is used by Expo for all platforms (iOS, Android, Web)
 */

import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { App } from './src/app/App';

registerRootComponent(App);

// Metro dead-code-eliminates this block in production builds
if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { bootstrapDevelopment } = require('./src/app/bootstrap');
  bootstrapDevelopment();
}
