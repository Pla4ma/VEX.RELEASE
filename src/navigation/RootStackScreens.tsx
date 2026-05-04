import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {isAuthenticated ? (
        hasCompletedOnboarding ? (
          <>
            <Stack.Screen name="Main" getComponent={() => require('./MainNavigator').MainNavigator} />
            <Stack.Screen
              name="Settings"
              getComponent={() => require('./SettingsNavigator').SettingsNavigator}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="SessionStack"
              getComponent={() => require('./SessionNavigator').SessionNavigator}
              options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="CompanionDetail"
              getComponent={() => require('../screens/companion/CompanionDetailScreen').CompanionDetailScreen}
            />
            <Stack.Screen name="Boss" getComponent={() => require('../screens/boss/BossScreen').BossScreen} />
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
              name="PostSessionStory"
              getComponent={() => require('../features/session-story/screens/PostSessionStoryScreen').PostSessionStoryScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="Comeback"
              getComponent={() => require('../screens/ComebackScreen').ComebackScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
            />
            <Stack.Screen name="Feed" getComponent={() => require('../features/feed/components/FeedScreen').FeedScreen} />
            <Stack.Screen
              name="Notifications"
              getComponent={() => require('../screens/notifications/NotificationsScreen').NotificationsScreen}
            />
            <Stack.Screen name="Search" getComponent={() => require('../screens/search/SearchScreen').SearchScreen} />
            <Stack.Screen name="Duels" getComponent={() => require('../features/duels/components').DuelLobby} />
            <Stack.Screen name="Guild" getComponent={() => require('../features/squads/components').SquadRouteHub} />
            <Stack.Screen
              name="BattlePass"
              getComponent={() => require('../features/battle-pass/components').BattlePassTrack}
            />
            <Stack.Screen name="Crafting" getComponent={() => require('../features/crafting').CraftingScreen} />
            <Stack.Screen name="Shop" getComponent={() => require('../features/shop').ShopScreen} />
            <Stack.Screen
              name="Inventory"
              getComponent={() => require('../features/inventory/components').InventoryGrid}
            />
            <Stack.Screen
              name="Analytics"
              getComponent={() => require('../screens/analytics/AnalyticsScreen').AnalyticsScreen}
            />
            <Stack.Screen
              name="Rankings"
              getComponent={() => require('../features/rankings/components').LeaderboardView}
            />
            <Stack.Screen
              name="Challenges"
              getComponent={() => require('../screens/challenges/ChallengesScreen').ChallengesScreen}
            />
            <Stack.Screen name="Rivals" getComponent={() => require('../screens/RivalsScreen').RivalsScreen} />
            <Stack.Screen
              name="SquadWars"
              getComponent={() => require('../features/squad-wars/components').SquadWarScreen}
            />
            <Stack.Screen
              name="AICoach"
              getComponent={() => require('../features/ai-coach/components/CoachScreen').CoachScreen}
            />
            <Stack.Screen name="Vault" getComponent={() => require('../screens/rewards/VaultScreen').VaultScreen} />
            <Stack.Screen
              name="Leaderboard"
              getComponent={() => require('../features/rankings/components').LeaderboardView}
            />
            <Stack.Screen name="Mastery" getComponent={() => require('../screens/profile/MasteryScreen').MasteryScreen} />
            <Stack.Screen
              name="PostSessionStory"
              getComponent={() =>
                require('../features/session-story/screens/PostSessionStoryScreenContainer').PostSessionStoryScreenContainer
              }
              options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="ContentStudy"
              getComponent={() => require('./ContentStudyNavigator').ContentStudyNavigator}
            />
          </>
        ) : (
          <Stack.Screen name="Onboarding" getComponent={() => require('./OnboardingNavigator').OnboardingNavigator} />
        )
      ) : (
        <Stack.Screen name="Auth" getComponent={() => require('./AuthNavigator').AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
