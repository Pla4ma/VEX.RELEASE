import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainNavigator } from './MainNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { SettingsNavigator } from './SettingsNavigator';
import { renderRootStackFeatureRoutes } from './root-stack-feature-routes';
import { type FeatureAccessMap } from '../features/liveops-config';
import type { ExtendedRootStackParams } from './types';
import { canRegisterPremiumPaywallRoute } from './premium-route-gating';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import StreakFuneralScreen from '../screens/streaks/StreakFuneralScreen';
import ComebackScreen from '../screens/ComebackScreen';
import { FocusScoreDashboard } from '../features/focus-identity/FocusScoreDashboard';
import AchievementsScreen from '../screens/profile/AchievementsScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import { VexFieldGuideScreenWithBoundary } from '../screens/guides/VexFieldGuideScreen';

const PaywallScreen = React.lazy(() => import('../screens/paywall/PaywallScreen'));
const VipPaywallScreen = React.lazy(
  () => import('../shared/monetization/components/VipPaywallScreen'),
);

type RootStack = ReturnType<typeof createNativeStackNavigator<ExtendedRootStackParams>>;

export function RootStackAuthenticatedRoutes({
  hasCompletedOnboarding,
  features,
  Stack,
}: {
  hasCompletedOnboarding: boolean;
  features: FeatureAccessMap;
  Stack: RootStack;
}): React.JSX.Element {
  if (!hasCompletedOnboarding) {
    return <Stack.Screen name="Onboarding" component={OnboardingNavigator} />;
  }
  const canRegisterPaywall = canRegisterPremiumPaywallRoute(features);
  return (
    <>
      <Stack.Screen name="Main" component={MainNavigator} />
      <Stack.Screen name="Settings" component={SettingsNavigator} options={{ animation: 'slide_from_bottom' }} />
      {canRegisterPaywall ? (
        <Stack.Screen name="Paywall" options={{ animation: 'slide_from_bottom', presentation: 'modal' }}>
          {() => (
            <React.Suspense fallback={<RouteLoadingFallback label="Paywall" />}>
              <PaywallScreen />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}
      {canRegisterPaywall ? (
        <Stack.Screen name="VipPaywall" options={{ animation: 'slide_from_bottom', presentation: 'modal' }}>
          {() => (
            <React.Suspense fallback={<RouteLoadingFallback label="Premium" />}>
              <VipPaywallScreen />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}
      <Stack.Screen name="StreakFuneral" component={StreakFuneralScreen} options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
      <Stack.Screen name="Comeback" component={ComebackScreen} options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
      <Stack.Screen name="FocusScoreDashboard" component={FocusScoreDashboard} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Guide" component={VexFieldGuideScreenWithBoundary} />
      {renderRootStackFeatureRoutes({ features, Stack })}
    </>
  );
}
