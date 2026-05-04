/**
 * VEX App Entry Point
 * 
 * This is the main entry point for the VEX React Native application.
 * Initializes the app with all required providers and configurations.
 * 
 * @module index
 * @author VEX Engineering Team
 * @version 1.0.0
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { App } from './src/app/App';

/**
 * Register the root component with the AppRegistry.
 * This is the bridge between the JavaScript code and the native platform.
 */
AppRegistry.registerComponent(appName, () => App);

/**
 * Enable React DevTools integration in development
 */
if (__DEV__) {
  require('./src/app/bootstrap').bootstrapDevelopment();
}
