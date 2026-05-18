import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CompanionDetailScreen from "../screens/companion/CompanionDetailScreen";
import BossScreen from "../screens/boss/BossScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import ChallengesScreen from "../screens/challenges/ChallengesScreen";
import { CoachScreen } from "../features/ai-coach/components/CoachScreen";
import MasteryScreen from "../screens/profile/MasteryScreen";
import { ContentStudyNavigator } from "./ContentStudyNavigator";

import type { ExtendedRootStackParams } from "./types";
import type { RootExposureFlags } from "./feature-exposure";

type RootStack = ReturnType<
  typeof createNativeStackNavigator<ExtendedRootStackParams>
>;

interface RootStackFeatureRoutesProps {
  show: RootExposureFlags;
  Stack: RootStack;
}

export function RootStackFeatureRoutes({
  show,
  Stack,
}: RootStackFeatureRoutesProps): React.JSX.Element {
  return (
    <>
      {show.companion ? (
        <Stack.Screen
          name="CompanionDetail"
          component={CompanionDetailScreen}
        />
      ) : null}

      {show.boss ? <Stack.Screen name="Boss" component={BossScreen} /> : null}

      <Stack.Screen name="Notifications" component={NotificationsScreen} />

      {show.challenges ? (
        <Stack.Screen name="Challenges" component={ChallengesScreen} />
      ) : null}

      {show.coach ? (
        <Stack.Screen name="AICoach" component={CoachScreen} />
      ) : null}

      {show.mastery ? (
        <Stack.Screen name="Mastery" component={MasteryScreen} />
      ) : null}

      {show.study ? (
        <Stack.Screen name="ContentStudy" component={ContentStudyNavigator} />
      ) : null}
    </>
  );
}

export default RootStackFeatureRoutes;
