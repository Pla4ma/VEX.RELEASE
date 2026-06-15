import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthNavigator } from './AuthNavigator';

import type { ExtendedRootStackParams } from './types';
import { RootStackAuthenticatedRoutes } from './root-stack-authenticated-routes';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import type { FeatureAccessMap } from '../features/liveops-config';
import { lightColors } from '../theme/tokens/colors';

interface RootStackScreensProps {
  hasCompletedOnboarding: boolean;
  features: FeatureAccessMap;
  isAuthenticated: boolean;
}

const Stack = createNativeStackNavigator<ExtendedRootStackParams>();
const SessionNavigator = React.lazy(() => import('./SessionNavigator'));

export const RootStackScreens: React.FC<RootStackScreensProps> = ({
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
        contentStyle: { backgroundColor: lightColors.background.primary },
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
            options={{
              animation: 'slide_from_bottom',
              presentation: 'fullScreenModal',
            }}
          >
            {() => (
              <React.Suspense
                fallback={<RouteLoadingFallback label="Session" />}
              >
                <SessionNavigator />
              </React.Suspense>
            )}
          </Stack.Screen>
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
