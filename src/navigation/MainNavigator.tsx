/**
 * Main Navigator - Launch Structure (V2)
 *
 * Bottom tab navigator: Home / Focus / Progress / Profile
 */

import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/home/HomeScreen';
import { FocusScreen } from '../screens/home/FocusScreen';
import { ProgressScreen } from '../screens/progress/ProgressScreen';
import { VexTabBar } from './components/VexTabBar';
import { ProfileTabRoute } from './ProfileTabRoute';
import type { MainTabParams } from './types';

const Tab = createBottomTabNavigator<MainTabParams>();

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
        component={FocusScreen}
        options={{ title: 'Focus' }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: 'Progress' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTabRoute}
        options={{ title: 'Profile' }}
        initialParams={{ userId: undefined, tab: 'stats' }}
      />
    </Tab.Navigator>
  );
};
