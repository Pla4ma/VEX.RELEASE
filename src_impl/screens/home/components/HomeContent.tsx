import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { AtRiskBanner } from '../../../features/home-spine/components';
import { StaggeredEnter } from '../../../shared/ui/components/EnterAnimation';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeFocusScore } from './HomeFocusScore';
import { HomeDailyMission } from './HomeDailyMission';
import { HomeSessionControl } from './HomeSessionControl';
import { HomeStatusBanners } from './HomeStatusBanners';
import { HomeMissionInput } from './HomeMissionInput';
import { HomeContentLower } from './HomeContentLower';
import { HomeCompanionWidget } from './HomeCompanionWidget';
import { useHomeCompanion } from '../hooks/useHomeCompanion';
import { HomeSectionBoundary } from './HomeSectionBoundary';
import type { MissionPriorityInput } from '../../../features/daily-mission/types';
import type { SessionRecommendation } from '../../../features/session-recommendation/types';
import type { useHomeData } from '../hooks/useHomeData';

type HomeData = ReturnType<typeof useHomeData>;
type HomeController = HomeData['controller'];

const staggeredEnterStyle = {
  container: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
};

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

interface HomeContentProps {
  controller: HomeController;
  data: HomeData;
  handleClaimReward: (rewardId: string) => void;
  streakHoursRemaining: number;
  features: HomeController['disclosure']['features'];
  comebackSessionsCompleted: number;
  primaryRecommendation: HomeController['primaryRecommendation'];
}

export const HomeContent: React.FC<HomeContentProps> = ({
  controller,
  data,
  handleClaimReward,
  streakHoursRemaining,
  features,
  comebackSessionsCompleted,
  primaryRecommendation,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const companionStatus = useHomeCompanion(controller.userId, controller.isOnline);
  const openChallenges = (): void => {
    if (controller.disclosure.features.challenges.isUnlocked) {
      navigation.navigate('Challenges');
      return;
    }
    controller.openSetup();
  };
  const openCompanion = (): void => {
    if (controller.disclosure.features.companion_detail.isUnlocked) {
      navigation.navigate('CompanionDetail');
      return;
    }
    controller.openSetup();
  };

  return (
    <HomeMissionInput
      activeBossQuery={{ data: null }}
      canShowBossBounties={false}
      companionMood={data.companionMood}
      controller={controller}
      intervention={data.intervention}
      interventionLoading={data.interventionLoading}
      streakHoursRemaining={streakHoursRemaining}
      todaysChallenges={data.todaysChallenges}
    >
      {(missionInput: Partial<MissionPriorityInput>) => (
        <StaggeredEnter
          containerStyle={staggeredEnterStyle.container}
          direction="up"
          initialDelay={100}
          speed="normal"
          staggerDelay={60}
        >
          {/* Status banners */}
          <HomeStatusBanners
            isOnline={controller.isOnline}
            completionSync={controller.completionSync}
            loadError={controller.loadError}
            onRetry={controller.retryAll}
          />

          {/* 1. Focus Score widget */}
          <HomeSectionBoundary sectionName="Focus Score">
            <HomeFocusScore
              onPress={() => navigation.navigate('FocusScoreDashboard')}
            />
          </HomeSectionBoundary>

          {controller.shouldShowSecondarySystems && controller.disclosure.features.challenges.isUnlocked ? (
            <HomeSectionBoundary sectionName="Daily Mission">
              <HomeDailyMission
                missionInput={missionInput}
                onMissionPress={openChallenges}
              />
            </HomeSectionBoundary>
          ) : null}

          {/* 3. Primary session start control */}
          <HomeSectionBoundary sectionName="Session Control">
            <HomeSessionControl
              hasActiveSession={data.hasActiveSession}
              isLoading={controller.isLoading}
              onPress={() => controller.openSetup()}
              resumeTimeSeconds={data.resumeTimeSeconds ?? undefined}
              squadMembersFocusing={data.squadMembersFocusing}
              streakHoursRemaining={data.streakHoursRemaining ?? undefined}
              streakRiskLevel={controller.streakQuery.data?.riskLevel}
              recommendation={primaryRecommendation as SessionRecommendation | null}
            />
          </HomeSectionBoundary>

          {controller.disclosure.features.companion_detail.isUnlocked ? (
            <HomeSectionBoundary sectionName="Companion">
              <HomeCompanionWidget
                status={companionStatus}
                onRetry={() => controller.retryAll()}
                onPress={openCompanion}
              />
            </HomeSectionBoundary>
          ) : null}

          {/* Urgency banner (if streak at risk) */}
          {streakHoursRemaining !== null && streakHoursRemaining <= 4 && (
            <AtRiskBanner
              hoursRemaining={streakHoursRemaining}
              currentStreak={controller.currentStreak}
              onStartSession={() => controller.openSetup()}
              isLoading={controller.streakQuery.isLoading}
            />
          )}

          <HomeContentLower
            controller={controller}
            data={data}
            handleClaimReward={handleClaimReward}
            streakHoursRemaining={streakHoursRemaining}
            features={features}
            comebackSessionsCompleted={comebackSessionsCompleted}
          />
        </StaggeredEnter>
      )}
    </HomeMissionInput>
  );
};
