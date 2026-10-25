import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { canRegisterFeatureRoute } from './feature-route-registry';
import type { ExtendedRootStackParams } from './types';
import type { FeatureAccessMap } from '../features/liveops-config';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import CoachScreen from '../features/ai-coach/components/CoachScreen';
import CompanionDetailScreen from '../screens/companion/CompanionDetailScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ChallengesScreen from '../screens/challenges/ChallengesScreen';
import MasteryScreen from '../screens/profile/MasteryScreen';
import MemoryConsoleScreen from '../screens/profile/MemoryConsoleScreen';

const BossScreen = React.lazy(() => import('../screens/boss/BossScreen'));
const ContentStudyNavigator = React.lazy(() => import('./ContentStudyNavigator'));

type RootStack = ReturnType<typeof createNativeStackNavigator<ExtendedRootStackParams>>;

interface RenderRootStackFeatureRoutesProps {
  features: FeatureAccessMap;
  Stack: RootStack;
}

export function renderRootStackFeatureRoutes({ features, Stack }: RenderRootStackFeatureRoutesProps): React.JSX.Element {
  return (
    <>
      {canRegisterFeatureRoute(features, 'CompanionDetail') ? <Stack.Screen name="CompanionDetail" component={CompanionDetailScreen} /> : null}
      {canRegisterFeatureRoute(features, 'Boss') ? (
        <Stack.Screen name="Boss">
          {() => (
            <React.Suspense fallback={<RouteLoadingFallback label="Boss" />}>
              <BossScreen />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      {canRegisterFeatureRoute(features, 'Challenges') ? <Stack.Screen name="Challenges" component={ChallengesScreen} /> : null}
      {canRegisterFeatureRoute(features, 'Mastery') ? <Stack.Screen name="Mastery" component={MasteryScreen} /> : null}
      {canRegisterFeatureRoute(features, 'ContentStudy') ? (
        <Stack.Screen name="ContentStudy">
          {() => (
            <React.Suspense fallback={<RouteLoadingFallback label="Study" />}>
              <ContentStudyNavigator />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}
      {canRegisterFeatureRoute(features, 'AICoach') ? <Stack.Screen name="AICoach" component={CoachScreen} /> : null}
      {canRegisterFeatureRoute(features, 'MemoryConsole') ? <Stack.Screen name="MemoryConsole" component={MemoryConsoleScreen} /> : null}
    </>
  );
}
