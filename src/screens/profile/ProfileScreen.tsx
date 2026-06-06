import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { Box, Text } from '../../components/primitives';
import { useAchievements } from '../../features/achievements/hooks';
import { getFeatureAvailability, isFeatureAvailableForNavigation } from '../../features/liveops-config/FeatureFlagService';
import { useFeatureAccess } from '../../features/liveops-config';
import { useSessionHistory } from '../../session/hooks/useSession';
import { buildProfileAchievementCards } from './profile-achievements';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStatsTab } from './ProfileStatsTab';
import { ProfileAchievementsTab } from './ProfileAchievementsTab';
import { ProfileActivityTab } from './ProfileActivityTab';
import { ProfileMasterySheet } from './ProfileMasterySheet';
import { useProfileData } from './useProfileData';
import type { ExtendedRootStackParams, MainTabParams } from '../../navigation/types';

type Tab = 'stats' | 'achievements' | 'activity';

export const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const route = useRoute<RouteProp<MainTabParams, 'Profile'>>();
  const { user, logout } = useAuthStore();
  const disclosure = useFeatureAccess();
  const userId = user?.id ?? null;

  const requestedTab = route.params?.tab;
  const initialTab: Tab =
    requestedTab === 'achievements' ? 'achievements'
    : requestedTab === 'activity' || requestedTab === 'social' ? 'activity'
    : 'stats';

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);

  const sheetRef = useRef<BottomSheet>(null);
  const {
    mastery, masteryLoading, rankDisplay, streakQuery, progressionQuery,
    loading, hasStatsError, xpPercent, stats,
  } = useProfileData(userId);

  const historyQuery = useSessionHistory(userId ?? '', 20);
  const achievementsQuery = useAchievements(userId ?? '');
  const achievements = React.useMemo(
    () => buildProfileAchievementCards(achievementsQuery.data),
    [achievementsQuery.data],
  );

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader
          user={user ?? null}
          streakDays={streakQuery.data?.currentDays ?? 0}
          level={progressionQuery.data?.level ?? 1}
          xp={progressionQuery.data?.xp ?? 0}
          nextLevelThreshold={progressionQuery.data?.nextLevelThreshold ?? 100}
          xpPercent={xpPercent}
          onSettingsPress={() => navigation.navigate('Settings', { screen: 'SettingsMain' })}
          onNotificationsPress={() => navigation.navigate('Notifications')}
          onLogout={logout}
        />

        <Box p={16} gap={16}>
          <Box flexDirection="row" style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border.light }}>
            {(['stats', 'achievements', 'activity'] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: 12,
                  borderBottomWidth: activeTab === tab ? 2 : 0,
                  borderBottomColor: theme.colors.primary[500],
                }}
                accessibilityLabel={`Show ${tab} tab`}
                accessibilityRole="tab"
                accessibilityHint={`Switches the profile view to ${tab}`}
                accessibilityState={{ selected: activeTab === tab }}
              >
                <Text
                  variant="body"
                  style={{
                    color: activeTab === tab ? theme.colors.primary[500] : theme.colors.text.secondary,
                    fontWeight: activeTab === tab ? '700' : '500',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </Box>

          {activeTab === 'stats' ? (
            <ProfileStatsTab
              theme={theme} userId={userId} stats={stats} statsLoading={loading}
              hasError={hasStatsError} mastery={mastery} masteryLoading={masteryLoading}
              rankDisplay={rankDisplay}
              techniques={[
                { key: 'durationMastery', label: 'Duration', color: theme.colors.primary[500] },
                { key: 'purityMastery', label: 'Purity', color: theme.colors.success.DEFAULT },
                { key: 'consistencyMastery', label: 'Consistency', color: theme.colors.warning.DEFAULT },
                { key: 'comebackMastery', label: 'Comeback', color: theme.colors.accent.pink },
                { key: 'bossMastery', label: 'Boss', color: theme.colors.info.DEFAULT },
              ]}
              onMasteryPress={() => {
                if (isFeatureAvailableForNavigation(getFeatureAvailability(disclosure.features.achievements)))
                  {navigation.navigate('Mastery');}
              }}
            />
          ) : activeTab === 'achievements' ? (
            <ProfileAchievementsTab
              theme={theme} isLoading={achievementsQuery.isLoading}
              isError={!!achievementsQuery.isError} achievements={achievements}
              onOpenAchievements={() => navigation.navigate('Achievements')}
              onStartSession={() => navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} })}
            />
          ) : (
            <ProfileActivityTab
              theme={theme} isLoading={historyQuery.isLoading}
              isError={!!historyQuery.error} history={historyQuery.history}
              onStartSession={() => navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} })}
            />
          )}
        </Box>
      </ScrollView>

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['60%', '90%']}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
        backgroundStyle={{
          backgroundColor: theme.colors.background.secondary,
          borderWidth: 1, borderColor: theme.colors.border.light,
        }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.text.tertiary }}
      >
        <ProfileMasterySheet
          theme={theme} rankDisplay={rankDisplay}
          totalMasteryPoints={mastery.totalMasteryPoints}
          challenges={mastery.activeChallenges}
        />
      </BottomSheet>
    </Box>
  );
};

export default withScreenErrorBoundary(ProfileScreen, 'Profile');
