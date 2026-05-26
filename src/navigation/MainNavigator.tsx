/**
 * Main Navigator - Launch Structure (V2)
 *
 * Bottom tab navigator: Home / Focus / Progress / Profile
 */

import React from "react";
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";

import { HomeScreen } from "../screens/home/HomeScreen";
import { VexTabBar } from "./components/VexTabBar";
import type { MainTabParams } from "./types";

const Tab = createBottomTabNavigator<MainTabParams>();
const FocusScreen = React.lazy(() => import("../screens/home/FocusScreen"));
const ProgressScreen = React.lazy(() => import("../screens/progress/ProgressScreen"));
const ProfileTabRoute = React.lazy(() => import("./ProfileTabRoute"));

function renderVexTabBar(props: BottomTabBarProps): React.JSX.Element {
  return <VexTabBar {...props} />;
}

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={renderVexTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Focus"
        options={{ title: "Focus" }}
      >
        {() => (
          <React.Suspense fallback={null}>
            <FocusScreen />
          </React.Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Progress"
        options={{ title: "Progress" }}
      >
        {() => (
          <React.Suspense fallback={null}>
            <ProgressScreen />
          </React.Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{ title: "Profile" }}
        initialParams={{ userId: undefined, tab: "stats" }}
      >
        {() => (
          <React.Suspense fallback={null}>
            <ProfileTabRoute />
          </React.Suspense>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainNavigator;
