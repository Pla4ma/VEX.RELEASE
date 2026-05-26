import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { MainNavigator } from "./MainNavigator";
import { OnboardingNavigator } from "./OnboardingNavigator";
import { SettingsNavigator } from "./SettingsNavigator";
import { RootStackFeatureRoutes } from "./root-stack-feature-routes";
import {
  type FeatureAccessMap,
} from "../features/liveops-config";
import type { ExtendedRootStackParams } from "./types";
import { canRegisterPremiumPaywallRoute } from "./premium-route-gating";

type RootStack = ReturnType<
  typeof createNativeStackNavigator<ExtendedRootStackParams>
>;

const PaywallScreen = React.lazy(() => import("../screens/paywall/PaywallScreen"));
const VipPaywallScreen = React.lazy(
  () => import("../shared/monetization/components/VipPaywallScreen"),
);
const StreakFuneralScreen = React.lazy(
  () => import("../screens/streaks/StreakFuneralScreen"),
);
const ComebackScreen = React.lazy(() => import("../screens/ComebackScreen"));

export function RootStackAuthenticatedRoutes({
  hasCompletedOnboarding,
  canShowHomePreview,
  features,
  Stack,
}: {
  hasCompletedOnboarding: boolean;
  canShowHomePreview: boolean;
  features: FeatureAccessMap;
  Stack: RootStack;
}): React.JSX.Element {
  const showApp = hasCompletedOnboarding || canShowHomePreview;
  const canRegisterPaywall = canRegisterPremiumPaywallRoute(features);

  if (!showApp) {
    return <Stack.Screen name="Onboarding" component={OnboardingNavigator} />;
  }

  return (
    <>
      <Stack.Screen name="Main" component={MainNavigator} />
      <Stack.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{ animation: "slide_from_bottom" }}
      />

      {canRegisterPaywall ? (
        <Stack.Screen
          name="Paywall"
          options={{ animation: "slide_from_bottom", presentation: "modal" }}
        >
          {() => (
            <React.Suspense fallback={null}>
              <PaywallScreen />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}
      {canRegisterPaywall ? (
        <Stack.Screen
          name="VipPaywall"
          options={{ animation: "slide_from_bottom", presentation: "modal" }}
        >
          {() => (
            <React.Suspense fallback={null}>
              <VipPaywallScreen />
            </React.Suspense>
          )}
        </Stack.Screen>
      ) : null}
      <Stack.Screen
        name="StreakFuneral"
        options={{
          animation: "slide_from_bottom",
          presentation: "fullScreenModal",
        }}
      >
        {() => (
          <React.Suspense fallback={null}>
            <StreakFuneralScreen />
          </React.Suspense>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Comeback"
        options={{
          animation: "slide_from_bottom",
          presentation: "fullScreenModal",
        }}
      >
        {() => (
          <React.Suspense fallback={null}>
            <ComebackScreen />
          </React.Suspense>
        )}
      </Stack.Screen>

      <RootStackFeatureRoutes features={features} Stack={Stack} />
    </>
  );
}
