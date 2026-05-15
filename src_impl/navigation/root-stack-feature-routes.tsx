import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CompanionDetailScreen from "../screens/companion/CompanionDetailScreen";
import BossScreen from "../screens/boss/BossScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import SearchScreen from "../screens/search/SearchScreen";
import { SquadRouteHub } from "../features/squads/components";
import BattlePassScreen from "../screens/progress/BattlePassScreen";
import AnalyticsScreen from "../screens/analytics/AnalyticsScreen";
import { MonthlyFocusReportScreen } from "../features/monthly-report/components";
import ChallengesScreen from "../screens/challenges/ChallengesScreen";
import { CoachScreen } from "../features/ai-coach/components/CoachScreen";
import MasteryScreen from "../screens/profile/MasteryScreen";
import InventoryScreen from "../screens/profile/InventoryScreen";
import VaultScreen from "../screens/rewards/VaultScreen";
import { ContentStudyNavigator } from "./ContentStudyNavigator";
import { ShopScreen } from "../features/shop";
import { useAuthStore } from "../store";
import { useProgressionSummary } from "../features/progression/hooks";

import type { ExtendedRootStackParams } from "./types";
import type { RootExposureFlags } from "./feature-exposure";

type RootStack = ReturnType<
  typeof createNativeStackNavigator<ExtendedRootStackParams>
>;

interface RootStackFeatureRoutesProps {
  show: RootExposureFlags;
  Stack: RootStack;
}

function ShopRouteScreen(): JSX.Element {
  const userId = useAuthStore((state) => state.user?.id ?? "guest-user");
  const progressionQuery = useProgressionSummary(userId || "guest-user");
  const userLevel = progressionQuery.data?.level ?? 1;

  return <ShopScreen userId={userId} userLevel={userLevel} />;
}

function VaultRouteScreen(): JSX.Element {
  const userId = useAuthStore((state) => state.user?.id ?? "guest-user");
  return <VaultScreen userId={userId} />;
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

      {show.advanced ? (
        <Stack.Screen name="Search" component={SearchScreen} />
      ) : null}

      {show.guild ? (
        <Stack.Screen name="Guild" component={SquadRouteHub} />
      ) : null}

      {show.battlePass ? (
        <Stack.Screen name="BattlePass" component={BattlePassScreen} />
      ) : null}

      {show.shop ? (
        <Stack.Screen name="Shop" component={ShopRouteScreen} />
      ) : null}

      {show.inventory ? (
        <Stack.Screen name="Inventory" component={InventoryScreen} />
      ) : null}

      {show.advanced ? (
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      ) : null}

      {show.monthly ? (
        <Stack.Screen
          name="MonthlyFocusReport"
          component={MonthlyFocusReportScreen}
        />
      ) : null}

      {show.challenges ? (
        <Stack.Screen name="Challenges" component={ChallengesScreen} />
      ) : null}

      {show.coach ? (
        <Stack.Screen name="AICoach" component={CoachScreen} />
      ) : null}

      {show.vault ? (
        <Stack.Screen name="Vault" component={VaultRouteScreen} />
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
