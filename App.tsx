/**
 * VEX App Entry Point for Expo
 */

import 'react-native-gesture-handler';
import React from 'react';
import { registerRootComponent } from 'expo';
import { App } from './src/app/App';

registerRootComponent(App);

// Metro dead-code-eliminates this block in production builds
if (__DEV__) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { bootstrapDevelopment } = require('./src/app/bootstrap');
    bootstrapDevelopment();
  } catch (error: unknown) {
    console.error('[VEX dev bootstrap failed]', error);
  }
}
