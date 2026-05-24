import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CompanionDetailScreen from "../screens/companion/CompanionDetailScreen";
import BossScreen from "../screens/boss/BossScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import ChallengesScreen from "../screens/challenges/ChallengesScreen";
import { CoachScreen } from "../features/ai-coach/components/CoachScreen";
import MasteryScreen from "../screens/profile/MasteryScreen";
import { ContentStudyNavigator } from "./ContentStudyNavigator";
import { canRegisterFeatureRoute } from "./feature-route-registry";

import type { ExtendedRootStackParams } from "./types";
import type { FeatureAccessMap } from "../features/liveops-config";

type RootStack = ReturnType<
  typeof createNativeStackNavigator<ExtendedRootStackParams>
>;

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
      {canRegisterFeatureRoute(features, "CompanionDetail") ? (
        <Stack.Screen
          name="CompanionDetail"
          component={CompanionDetailScreen}
        />
      ) : null}

      {canRegisterFeatureRoute(features, "Boss") ? <Stack.Screen name="Boss" component={BossScreen} /> : null}

      <Stack.Screen name="Notifications" component={NotificationsScreen} />

      {canRegisterFeatureRoute(features, "Challenges") ? (
        <Stack.Screen name="Challenges" component={ChallengesScreen} />
      ) : null}

      {canRegisterFeatureRoute(features, "AICoach") ? (
        <Stack.Screen name="AICoach" component={CoachScreen} />
      ) : null}

      {canRegisterFeatureRoute(features, "Mastery") ? (
        <Stack.Screen name="Mastery" component={MasteryScreen} />
      ) : null}

      {canRegisterFeatureRoute(features, "ContentStudy") ? (
        <Stack.Screen name="ContentStudy" component={ContentStudyNavigator} />
      ) : null}
    </>
  );
}

export default RootStackFeatureRoutes;
