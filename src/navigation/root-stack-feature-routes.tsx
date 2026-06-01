import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { canRegisterFeatureRoute } from './feature-route-registry';

import type { ExtendedRootStackParams } from './types';
import type { FeatureAccessMap } from '../features/liveops-config';

type RootStack = ReturnType<
  typeof createNativeStackNavigator<ExtendedRootStackParams>
>;

const CompanionDetailScreen = React.lazy(
  () => import('../screens/companion/CompanionDetailScreen'),
);
const BossScreen = React.lazy(() => import('../screens/boss/BossScreen'));
const NotificationsScreen = React.lazy(
  () => import('../screens/notifications/NotificationsScreen'),
);
const ChallengesScreen = React.lazy(
  () => import('../screens/challenges/ChallengesScreen'),
);
const CoachScreen = React.lazy(() =>
  import('../features/ai-coach/components/CoachScreen').then((module) => ({
    default: module.CoachScreen,
  })),
);
const MasteryScreen = React.lazy(
  () => import('../screens/profile/MasteryScreen'),
);
const ContentStudyNavigator = React.lazy(
  () => import('./ContentStudyNavigator'),
);

interface RootStackFeatureRoutesProps {
  features: FeatureAccessMap;
  Stack: RootStack;
}

export function RootStackFeatureRoutes({
  features,
  Stack,
}: RootStackFeatureRoutesProps): React.JSX.Element {
  return (
    <>
      {canRegisterFeatureRoute(features, 'CompanionDetail') ? (
        <Stack.Screen name="CompanionDetail">
          {() => (
            <React.Suspense fallback={null}>
              <CompanionDetailScreen />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}

      {canRegisterFeatureRoute(features, 'Boss') ? (
        <Stack.Screen name="Boss">
          {() => (
            <React.Suspense fallback={null}>
              <BossScreen />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}

      <Stack.Screen name="Notifications">
        {() => (
          <React.Suspense fallback={null}>
            <NotificationsScreen />
          </React.Suspense>
        )}
      </Stack.Screen>

      {canRegisterFeatureRoute(features, 'Challenges') ? (
        <Stack.Screen name="Challenges">
          {() => (
            <React.Suspense fallback={null}>
              <ChallengesScreen />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}

      {canRegisterFeatureRoute(features, 'AICoach') ? (
        <Stack.Screen name="AICoach">
          {() => (
            <React.Suspense fallback={null}>
              <CoachScreen />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}

      {canRegisterFeatureRoute(features, 'Mastery') ? (
        <Stack.Screen name="Mastery" component={MasteryScreen} />
      ) : null}

      {canRegisterFeatureRoute(features, 'ContentStudy') ? (
        <Stack.Screen name="ContentStudy">
          {() => (
            <React.Suspense fallback={null}>
              <ContentStudyNavigator />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}
    </>
  );
}

export default RootStackFeatureRoutes;
