import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { GlassScreen } from '../../components/glass/GlassScreen';
import { GlassSheetBackground } from '@components/glass/native/GlassSheetBackground';
import { useAchievements } from '../../features/achievements/hooks';
import { getFeatureAvailability, isFeatureAvailableForNavigation } from '../../features/liveops-config/FeatureFlagService';
import { useFeatureAccess } from '../../features/liveops-config';
import { useFocusScoreDashboardModel } from '../../features/focus-identity/hooks-focus-score';
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
import { navigateToRootScreen, navigateToMainStackScreen, navigateToMainTab } from '../../navigation/navigation-helpers';
import { VexBackdrop } from '../../shared/ui/vex/VexBackdrop';
import { vexFire } from '../../theme/tokens/vex-fire';

const PROFILE_BACKGROUND = require('../../../assets/vex/profile-background.png');

function ProfileBottomSheetBackdrop(
  props: BottomSheetBackdropProps,
): React.ReactNode {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
    />
  );
}

const ProfileScreen: React.ComponentType = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<MainTabParams, 'Profile'>>();
  const { user, logout } = useAuthStore();
  const disclosure = useFeatureAccess();
  const userId = user?.id ?? null;
  const focusScoreModel = useFocusScoreDashboardModel(userId);

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
    <GlassScreen showAura={false} variant="profile">
      <VexBackdrop source={PROFILE_BACKGROUND} overlayColor={vexFire.background} overlayOpacity={0.76} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + theme.spacing[12] }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          user={user ?? null}
          streakDays={streakQuery.data?.currentDays ?? 0}
          level={progressionQuery.data?.level ?? 1}
          xp={progressionQuery.data?.xp ?? 0}
          nextLevelThreshold={progressionQuery.data?.nextLevelThreshold ?? 100}
          xpPercent={xpPercent}
          onSettingsPress={() => navigateToRootScreen(navigation, 'Settings', { screen: 'SettingsMain' })}
          onNotificationsPress={() => navigateToMainStackScreen(navigation, 'Notifications')}
          onLogout={logout}
        />

        <View style={{ paddingHorizontal: theme.spacing[4], gap: theme.spacing[3] }}>
          <ProfileGlassTabs activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'stats' ? (
            <ProfileStatsTab
              stats={stats} statsLoading={loading}
              hasError={hasStatsError} mastery={mastery} masteryLoading={masteryLoading}
              rankDisplay={rankDisplay}
              focusScore={focusScoreModel.current?.currentScore ?? null}
              focusScoreHistory={focusScoreModel.history}
              xp={progressionQuery.data?.xp ?? 0}
              nextLevelThreshold={progressionQuery.data?.nextLevelThreshold ?? 100}
              xpPercent={xpPercent}
              techniques={[
                { key: 'durationMastery', label: 'Duration', color: vexFire.ember },
                { key: 'purityMastery', label: 'Purity', color: vexFire.success },
                { key: 'consistencyMastery', label: 'Consistency', color: vexFire.amber },
                { key: 'comebackMastery', label: 'Comeback', color: vexFire.copper },
                { key: 'bossMastery', label: 'Boss', color: vexFire.cream },
              ]}
              onMasteryPress={() => {
                if (isFeatureAvailableForNavigation(getFeatureAvailability(disclosure.features.achievements)))
                  {navigateToMainStackScreen(navigation, 'Mastery');}
              }}
            />
          ) : activeTab === 'mastery' ? (
            <ProfileAchievementsTab
              theme={theme} isLoading={achievementsQuery.isLoading}
              isError={!!achievementsQuery.isError} achievements={achievements}
              onOpenAchievements={() => navigateToMainStackScreen(navigation, 'Achievements')}
              onStartSession={() => navigateToMainTab(navigation, 'Focus')}
            />
          ) : (
            <ProfileActivityTab
              theme={theme} isLoading={historyQuery.isLoading}
              isError={!!historyQuery.error} history={historyQuery.history}
              onStartSession={() => navigateToMainTab(navigation, 'Focus')}
            />
          )}
        </View>
      </ScrollView>

      {Platform.OS !== 'web' ? (
        <BottomSheet
          ref={sheetRef}
          index={-1}
          snapPoints={['60%', '90%']}
          enablePanDownToClose
          backdropComponent={ProfileBottomSheetBackdrop}
          backgroundComponent={GlassSheetBackground}
          backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' }}
          handleIndicatorStyle={{ backgroundColor: vexFire.textMuted }}
        >
          <ProfileMasterySheet
            theme={theme}
            rankDisplay={rankDisplay}
            totalMasteryPoints={mastery.totalMasteryPoints}
            challenges={mastery.activeChallenges}
          />
        </BottomSheet>
      ) : null}
    </GlassScreen>
  );
};

const ProfileScreenWithBoundary = withScreenErrorBoundary(ProfileScreen, 'Profile');
export { ProfileScreenWithBoundary as ProfileScreen };
