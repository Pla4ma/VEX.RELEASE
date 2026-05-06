/**
 * Onboarding Navigator
 *
 * Navigation stack for onboarding flow.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParams } from './types';

const Stack = createNativeStackNavigator<RootStackParams>();

/**
 * Onboarding navigator component
 */
export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Onboarding"
        getComponent={() => require('../screens/onboarding/OnboardingFlowScreen').OnboardingFlowScreen}
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
