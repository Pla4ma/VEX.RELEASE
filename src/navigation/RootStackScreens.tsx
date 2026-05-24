import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthNavigator } from "./AuthNavigator";
import { SessionNavigator } from "./SessionNavigator";

import { useFeatureAccess } from "../features/liveops-config";
import { useFeatureFlags } from "../hooks/useFeatureFlags";

import { buildRootExposureFlags } from "./feature-exposure";
import type { ExtendedRootStackParams } from "./types";
import { RootStackAuthenticatedRoutes } from "./root-stack-authenticated-routes";

interface RootStackScreensProps {
  hasCompletedOnboarding: boolean;
  canShowHomePreview: boolean;
  isAuthenticated: boolean;
}

const Stack = createNativeStackNavigator<ExtendedRootStackParams>();

export const RootStackScreens: React.FC<RootStackScreensProps> = ({
  hasCompletedOnboarding,
  canShowHomePreview,
  isAuthenticated,
}) => {
  const { features } = useFeatureAccess();
  const { isEnabled } = useFeatureFlags();
  const show = buildRootExposureFlags({ features, isEnabled });

  const showApp = isAuthenticated && (hasCompletedOnboarding || canShowHomePreview);

  const navigatorKey = isAuthenticated
    ? showApp
      ? "app"
      : "onboarding"
    : "auth";

  return (
    <Stack.Navigator
      key={navigatorKey}
      screenOptions={{
        animation: "slide_from_right",
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        <>
          <RootStackAuthenticatedRoutes
            features={features}
            hasCompletedOnboarding={hasCompletedOnboarding}
            canShowHomePreview={canShowHomePreview}
            show={show}
            Stack={Stack}
          />

          <Stack.Screen
            name="SessionStack"
            component={SessionNavigator}
            options={{
              animation: "slide_from_bottom",
              presentation: "fullScreenModal",
            }}
          />

        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
