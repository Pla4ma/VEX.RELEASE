import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { GlassScreen } from '../../components/glass/GlassScreen';
import { useAchievements } from '../../features/achievements/hooks';
import { getFeatureAvailability, isFeatureAvailableForNavigation } from '../../features/liveops-config/FeatureFlagService';
import { useFeatureAccess } from '../../features/liveops-config';
import { useSessionHistory } from '../../session/hooks/useSession';
import { buildProfileAchievementCards } from './profile-achievements';
import { useAuthStore } from '../../store';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStatsTab } from './ProfileStatsTab';
import { ProfileAchievementsTab } from './ProfileAchievementsTab';
import { ProfileActivityTab } from './ProfileActivityTab';
import { ProfileMasterySheet } from './ProfileMasterySheet';
import { useProfileData } from './useProfileData';
import { ProfileGlassTabs, type ProfileTab } from './components/ProfileGlassTabs';
import type { ExtendedRootStackParams, MainTabParams } from '../../navigation/types';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

function ProfileBottomSheetBackdrop(
  props: BottomSheetBackdropProps,
): JSX.Element {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
    />
  );
}

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const route = useRoute<RouteProp<MainTabParams, 'Profile'>>();
  const { user, logout } = useAuthStore();
  const disclosure = useFeatureAccess();
  const userId = user?.id ?? null;

  const requestedTab = route.params?.tab;
  const initialTab: ProfileTab =
    requestedTab === 'achievements' ? 'mastery'
    : requestedTab === 'activity' || requestedTab === 'social' ? 'activity'
    : 'stats';

  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);

  const sheetRef = useRef<BottomSheet>(null);
  const {
    mastery, masteryLoading, rankDisplay, streakQuery, progressionQuery,
    loading, hasStatsError, xpPercent, stats, theme,
  } = useProfileData(userId);

  const historyQuery = useSessionHistory(userId ?? '', 20);
  const achievementsQuery = useAchievements(userId ?? '');
  const achievements = React.useMemo(
    () => buildProfileAchievementCards(achievementsQuery.data),
    [achievementsQuery.data],
  );

  return (
    <GlassScreen showAura variant="profile">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <ProfileGlassTabs activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'stats' ? (
            <ProfileStatsTab
              userId={userId} stats={stats} statsLoading={loading}
              hasError={hasStatsError} mastery={mastery} masteryLoading={masteryLoading}
              rankDisplay={rankDisplay}
              techniques={[
                { key: 'durationMastery', label: 'Duration', color: vexLightGlass.mint[500] },
                { key: 'purityMastery', label: 'Purity', color: vexLightGlass.semantic.success },
                { key: 'consistencyMastery', label: 'Consistency', color: vexLightGlass.semantic.warning },
                { key: 'comebackMastery', label: 'Comeback', color: vexLightGlass.semantic.fire },
                { key: 'bossMastery', label: 'Boss', color: vexLightGlass.semantic.info },
              ]}
              onMasteryPress={() => {
                if (isFeatureAvailableForNavigation(getFeatureAvailability(disclosure.features.achievements)))
                  {navigation.navigate('Mastery');}
              }}
            />
          ) : activeTab === 'mastery' ? (
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
        </View>
      </ScrollView>

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['60%', '90%']}
        enablePanDownToClose
        backdropComponent={ProfileBottomSheetBackdrop}
        backgroundStyle={{
          backgroundColor: vexLightGlass.glass.fillStrong,
          borderWidth: 1,
          borderColor: vexLightGlass.glass.innerHighlight,
        }}
        handleIndicatorStyle={{ backgroundColor: vexLightGlass.text.disabled }}
      >
        <ProfileMasterySheet
          theme={theme} rankDisplay={rankDisplay}
          totalMasteryPoints={mastery.totalMasteryPoints}
          challenges={mastery.activeChallenges}
        />
      </BottomSheet>
    </GlassScreen>
  );
};

export default withScreenErrorBoundary(ProfileScreen, 'Profile');

