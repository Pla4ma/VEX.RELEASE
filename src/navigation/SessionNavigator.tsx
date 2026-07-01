/**
 * Session Navigator
 *
 * Core Focus Loop navigation stack.
 * Manages the complete session flow: Setup → Active → Complete.
 */

import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { initializeSessionRuntime } from '../app/bootstrap';
import type { SessionStackParams } from './types';
import { lightColors } from '../theme/tokens/colors';

const Stack = createNativeStackNavigator<SessionStackParams>();

/**
 * Session navigator - Core Focus Loop
 */
export const SessionNavigator: React.ComponentType = () => {
  useEffect(() => {
    initializeSessionRuntime();
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: lightColors.background.primary },
      }}
    >
      <Stack.Screen
        name="SessionSetup"
        getComponent={() =>
          // SAFETY: require() keeps session screens lazy-loaded for navigation startup performance.
          require('../screens/session/SessionSetupScreen').SessionSetupScreen
        }
      />
      <Stack.Screen
        name="ActiveSession"
        getComponent={() =>
          // SAFETY: require() keeps session screens lazy-loaded for navigation startup performance.
          require('../screens/session/ActiveSessionScreen').ActiveSessionScreen
        }
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="SessionComplete"
        getComponent={() =>
          // SAFETY: require() keeps session screens lazy-loaded for navigation startup performance.
          require('../screens/session/SessionCompleteScreen')
            .SessionCompleteScreen
        }
      />
      <Stack.Screen
        name="SessionHistory"
        getComponent={() =>
          // SAFETY: require() keeps session screens lazy-loaded for navigation startup performance.
          require('../screens/session/SessionHistoryScreen')
            .SessionHistoryScreen
        }
      />
    </Stack.Navigator>
  );
};

export { SessionNavigator as default };
