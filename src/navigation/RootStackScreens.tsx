import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthNavigator } from './AuthNavigator';

import type { ExtendedRootStackParams } from './types';
import { RootStackAuthenticatedRoutes } from './root-stack-authenticated-routes';
import type { FeatureAccessMap } from '../features/liveops-config';

interface RootStackScreensProps {
  hasCompletedOnboarding: boolean;
  canShowHomePreview: boolean;
  features: FeatureAccessMap;
  isAuthenticated: boolean;
}

const Stack = createNativeStackNavigator<ExtendedRootStackParams>();
const SessionNavigator = React.lazy(() => import('./SessionNavigator'));

export const RootStackScreens: React.FC<RootStackScreensProps> = ({
  hasCompletedOnboarding,
  canShowHomePreview,
  features,
  isAuthenticated,
}) => {
  const showApp =
    isAuthenticated && (hasCompletedOnboarding || canShowHomePreview);

  const navigatorKey = isAuthenticated
    ? showApp
      ? 'app'
      : 'onboarding'
    : 'auth';

  return (
    <Stack.Navigator
      key={navigatorKey}
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        <>
          {RootStackAuthenticatedRoutes({
            features,
            hasCompletedOnboarding,
            canShowHomePreview,
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
              <React.Suspense fallback={null}>
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
