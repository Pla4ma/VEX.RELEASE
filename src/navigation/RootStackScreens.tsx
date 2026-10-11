import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthNavigator } from './AuthNavigator';

import type { ExtendedRootStackParams } from './types';
import { RootStackAuthenticatedRoutes } from './root-stack-authenticated-routes';
import type { FeatureAccessMap } from '../features/liveops-config';
import { vexFire } from '../theme/tokens/vex-fire';
import { SessionNavigator } from './SessionNavigator';

interface RootStackScreensProps {
  hasCompletedOnboarding: boolean;
  features: FeatureAccessMap;
  isAuthenticated: boolean;
}

const Stack = createNativeStackNavigator<ExtendedRootStackParams>();

export const RootStackScreens: React.ComponentType<RootStackScreensProps> = ({
  hasCompletedOnboarding,
  features,
  isAuthenticated,
}) => {
  const showApp = isAuthenticated && hasCompletedOnboarding;

  const navigatorKey = isAuthenticated
    ? showApp
      ? 'app'
      : 'onboarding'
    : 'auth';

  return (
    <Stack.Navigator
      key={navigatorKey}
      screenOptions={{
        animation: 'none',
        contentStyle: { backgroundColor: vexFire.background },
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        <>
          {RootStackAuthenticatedRoutes({
            features,
            hasCompletedOnboarding,
            Stack,
          })}

          <Stack.Screen
            name="SessionStack"
            component={SessionNavigator}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'fullScreenModal',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
