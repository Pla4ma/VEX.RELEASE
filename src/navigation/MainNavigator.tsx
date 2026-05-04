/**
 * Main Navigator - Launch Structure (V2)
 *
 * Bottom tab navigator: Home / Focus / Progress / Profile
 * - Home now features AI-powered recommendation engine
 * - Focus provides quick session start
 * - Progress shows long-term stats
 * - Profile contains personal settings and premium
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { BattlePassTierToastListener } from '../features/battle-pass/components/BattlePassTierToastListener';
import { VexTabBar } from './components/VexTabBar';

import type { MainTabParams } from './types';

const Tab = createBottomTabNavigator<MainTabParams>();

/**
 * Main navigator component - Launch structure (V2 with recommendation engine)
 */
export const MainNavigator: React.FC = () => {
  return (
    <>
      <BattlePassTierToastListener />
      <Tab.Navigator
        tabBar={(props) => <VexTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          getComponent={() => require('../screens/home/HomeScreenV2').HomeScreenV2}
        />
        <Tab.Screen
          name="Focus"
          options={{ title: 'Focus' }}
          getComponent={() => require('../screens/home/FocusScreen').FocusScreen}
        />
        <Tab.Screen
          name="Progress"
          options={{ title: 'Progress' }}
          getComponent={() => require('../screens/progress/ProgressScreen').ProgressScreen}
        />
        <Tab.Screen
          name="Profile"
          getComponent={() => require('../screens/profile/ProfileScreen').ProfileScreen}
        />
      </Tab.Navigator>
    </>
  );
};

export default MainNavigator;
