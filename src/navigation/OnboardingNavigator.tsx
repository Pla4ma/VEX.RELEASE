/**
 * Onboarding Navigator
 *
 * Navigation stack for onboarding flow.
 */

import React from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingFlowScreen from '../screens/onboarding/OnboardingFlowScreen';

import type { RootStackParams } from './types';

type OnboardingStackParams = {
  OnboardingFlow: RootStackParams['Onboarding'];
};

const Stack = createNativeStackNavigator<OnboardingStackParams>();

/**
 * Onboarding navigator component
 */
export const OnboardingNavigator: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParams, 'Onboarding'>>();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="OnboardingFlow"
        initialParams={route.params}
        component={OnboardingFlowScreen}
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
