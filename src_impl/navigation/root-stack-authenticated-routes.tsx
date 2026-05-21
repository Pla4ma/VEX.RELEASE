import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { MainNavigator } from "./MainNavigator";
import { OnboardingNavigator } from "./OnboardingNavigator";
import { SettingsNavigator } from "./SettingsNavigator";
import { PaywallScreen } from "../screens/paywall/PaywallScreen";
import StreakFuneralScreen from "../screens/streaks/StreakFuneralScreen";
import ComebackScreen from "../screens/ComebackScreen";
import { RootStackFeatureRoutes } from "./root-stack-feature-routes";
import type { ExtendedRootStackParams } from "./types";
import type { FeatureAccessMap } from "../features/liveops-config";
import type { RootExposureFlags } from "./feature-exposure";

type RootStack = ReturnType<
  typeof createNativeStackNavigator<ExtendedRootStackParams>
>;

export function RootStackAuthenticatedRoutes({
  hasCompletedOnboarding,
  features,
  show,
  Stack,
}: {
  hasCompletedOnboarding: boolean;
  features: FeatureAccessMap;
  show: RootExposureFlags;
  Stack: RootStack;
}): React.JSX.Element {
  if (!hasCompletedOnboarding) {
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

      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ animation: "slide_from_bottom", presentation: "modal" }}
      />
      <Stack.Screen
        name="StreakFuneral"
        component={StreakFuneralScreen}
        options={{
          animation: "slide_from_bottom",
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="Comeback"
        component={ComebackScreen}
        options={{
          animation: "slide_from_bottom",
          presentation: "fullScreenModal",
        }}
      />

      <RootStackFeatureRoutes features={features} Stack={Stack} />
    </>
  );
}
