import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NavigationGuard } from './components/NavigationGuard';
import { FEATURE_FLAGS } from '../constants/features';
import type { ExtendedRootStackParams } from './types';

interface RootStackScreensProps {
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
}

const Stack = createNativeStackNavigator<ExtendedRootStackParams>();

export const RootStackScreens: React.FC<RootStackScreensProps> = ({
  hasCompletedOnboarding,
  isAuthenticated,
}) => {
  const navigatorKey = isAuthenticated
    ? hasCompletedOnboarding
      ? 'app'
      : 'onboarding'
    : 'auth';

  return (
    <Stack.Navigator
      key={navigatorKey}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {isAuthenticated ? (
        <>
          {hasCompletedOnboarding ? (
            <>
              <Stack.Screen name="Main" getComponent={() => require('./MainNavigator').MainNavigator} />
              <Stack.Screen
                name="Settings"
                getComponent={() => require('./SettingsNavigator').SettingsNavigator}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="CompanionDetail"
                getComponent={() => require('../screens/companion/CompanionDetailScreen').CompanionDetailScreen}
              />
              <Stack.Screen
                name="Boss"
                component={() => (
                  <NavigationGuard featureFlag={FEATURE_FLAGS.BASIC_SOLO_BOSS}>
                    {require('../screens/boss/BossScreen').BossScreen()}
                  </NavigationGuard>
                )}
              />
              <Stack.Screen
                name="Paywall"
                getComponent={() => require('../screens/paywall/PaywallScreen').PaywallScreen}
                options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
              />
              <Stack.Screen
                name="StreakFuneral"
                getComponent={() => require('../screens/streaks/StreakFuneralScreen').StreakFuneralScreen}
                options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
              />
              <Stack.Screen
                name="Comeback"
                getComponent={() => require('../screens/ComebackScreen').ComebackScreen}
                options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
              />
              <Stack.Screen
                name="Feed"
                component={() => (
                  <NavigationGuard featureFlag={FEATURE_FLAGS.SOCIAL_FEED}>
                    {require('../screens/social/SocialScreen').SocialScreen()}
                  </NavigationGuard>
                )}
              />
              <Stack.Screen
                name="Notifications"
                getComponent={() => require('../screens/notifications/NotificationsScreen').NotificationsScreen}
              />
              <Stack.Screen name="Search" getComponent={() => require('../screens/search/SearchScreen').SearchScreen} />
              <Stack.Screen
                name="Guild"
                component={() => (
                  <NavigationGuard featureFlag={FEATURE_FLAGS.SQUADS_ACCOUNTABILITY}>
                    {require('../features/squads/components').SquadRouteHub()}
                  </NavigationGuard>
                )}
              />
              <Stack.Screen
                name="BattlePass"
                component={() => (
                  <NavigationGuard featureFlag={FEATURE_FLAGS.SEASON_PASS}>
                    {require('../features/battle-pass/components').BattlePassTrack()}
                  </NavigationGuard>
                )}
              />
              <Stack.Screen
                name="Shop"
                component={() => (
                  <NavigationGuard featureFlag={FEATURE_FLAGS.MARKETPLACE}>
                    {require('../features/shop').ShopScreen()}
                  </NavigationGuard>
                )}
              />
              <Stack.Screen
                name="Inventory"
                component={() => (
                  <NavigationGuard featureFlag={FEATURE_FLAGS.MARKETPLACE}>
                    {require('../features/inventory/components').InventoryGrid()}
                  </NavigationGuard>
                )}
              />
              <Stack.Screen
                name="Analytics"
                getComponent={() => require('../screens/analytics/AnalyticsScreen').AnalyticsScreen}
              />
              <Stack.Screen
                name="MonthlyFocusReport"
                getComponent={() => require('../features/monthly-report/components').MonthlyFocusReportScreen}
              />
              <Stack.Screen
                name="Challenges"
                component={() => (
                  <NavigationGuard featureFlag={FEATURE_FLAGS.BASIC_CHALLENGES}>
                    {require('../screens/challenges/ChallengesScreen').ChallengesScreen()}
                  </NavigationGuard>
                )}
              />
              <Stack.Screen
                name="Rivals"
                component={() => (
                  <NavigationGuard featureFlag={FEATURE_FLAGS.RIVALS}>
                    {require('../screens/RivalsScreen').RivalsScreen()}
                  </NavigationGuard>
                )}
              />
              <Stack.Screen
                name="AICoach"
                getComponent={() => require('../features/ai-coach/components/CoachScreen').CoachScreen}
              />
              <Stack.Screen name="Vault" getComponent={() => require('../screens/rewards/VaultScreen').VaultScreen} />
              <Stack.Screen name="Mastery" getComponent={() => require('../screens/profile/MasteryScreen').MasteryScreen} />
              <Stack.Screen
                name="ContentStudy"
                getComponent={() => require('./ContentStudyNavigator').ContentStudyNavigator}
              />
            </>
          ) : (
            <Stack.Screen name="Onboarding" getComponent={() => require('./OnboardingNavigator').OnboardingNavigator} />
          )}
          {/* Shared screens available to both Onboarding and Main app */}
          <Stack.Screen
            name="SessionStack"
            getComponent={() => require('./SessionNavigator').SessionNavigator}
            options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="PostSessionStory"
            getComponent={() =>
              require('../features/session-story/screens/PostSessionStoryScreenContainer').PostSessionStoryScreenContainer
            }
            options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" getComponent={() => require('./AuthNavigator').AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
