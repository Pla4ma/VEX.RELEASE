import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { canRegisterFeatureRoute } from './feature-route-registry';

import type { ExtendedRootStackParams } from './types';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import type { FeatureAccessMap } from '../features/liveops-config';
import CoachScreen from '../features/ai-coach/components/CoachScreen';

type RootStack = ReturnType<
  typeof createNativeStackNavigator<ExtendedRootStackParams>
>;

// SAFETY: lazy() + dynamic import() for code-splitting; these are component references
// needed in the render function below. They must be at module scope for Suspense to work.
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
const MasteryScreen = React.lazy(
  () => import('../screens/profile/MasteryScreen'),
);
const ContentStudyNavigator = React.lazy(
  () => import('./ContentStudyNavigator'),
);
const MemoryConsoleScreen = React.lazy(
  () => import('../screens/profile/MemoryConsoleScreen'),
);

interface RenderRootStackFeatureRoutesProps {
  features: FeatureAccessMap;
  Stack: RootStack;
}

export function renderRootStackFeatureRoutes({
  features,
  Stack,
}: RenderRootStackFeatureRoutesProps): React.JSX.Element {
  return (
    <>
      {canRegisterFeatureRoute(features, 'CompanionDetail') ? (
        <Stack.Screen name="CompanionDetail">
          {() => (
            <React.Suspense
              fallback={<RouteLoadingFallback label="Companion" />}
            >
              <CompanionDetailScreen />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}

      {canRegisterFeatureRoute(features, 'Boss') ? (
        <Stack.Screen name="Boss">
          {() => (
            <React.Suspense fallback={<RouteLoadingFallback label="Boss" />}>
              <BossScreen />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}

      <Stack.Screen name="Notifications">
        {() => (
          <React.Suspense
            fallback={<RouteLoadingFallback label="Notifications" />}
          >
            <NotificationsScreen />
          </React.Suspense>
        )}
      </Stack.Screen>

      {canRegisterFeatureRoute(features, 'Challenges') ? (
        <Stack.Screen name="Challenges">
          {() => (
            <React.Suspense
              fallback={<RouteLoadingFallback label="Challenges" />}
            >
              <ChallengesScreen />
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
            <React.Suspense fallback={<RouteLoadingFallback label="Study" />}>
              <ContentStudyNavigator />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}

      {canRegisterFeatureRoute(features, 'AICoach') ? (
        <Stack.Screen name="AICoach" component={CoachScreen} />
      ) : null}

      {canRegisterFeatureRoute(features, 'MemoryConsole') ? (
        <Stack.Screen name="MemoryConsole" component={MemoryConsoleScreen} />
      ) : null}
    </>
  );
}
