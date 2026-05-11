/**
 * HomeContent Component - Phase 3 Information Architecture
 *
 * Implements the exact Home order required for launch:
 * 1. Focus Score widget
 * 2. one daily mission card
 * 3. primary session start control
 * 4. companion status (already in greeting)
 * 5. streak/progress strip
 * 6. secondary optional rail
 *
 * Rules:
 * - One primary CTA above the fold
 * - No disabled feature cards
 * - No empty social surfaces
 * - No generic marketing explanations
 * - Stale data must be labeled
 * - Offline mode must be visible and calm
 */

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
  canShowWagers: boolean;
  activeWagerQuery: HomeData['activeWagerQuery'];
  canShowBattlePass: boolean;
  features: HomeController['disclosure']['features'];
  comebackSessionsCompleted: number;
  activeBossQuery: HomeData['activeBossQuery'];
  bountyStatusQuery: HomeData['bountyStatusQuery'];
  placeBountyMutation: HomeData['placeBountyMutation'];
  coinBalance: number | null;
  canShowBossBounties: boolean;
  primaryRecommendation: HomeController['primaryRecommendation'];
}

export const HomeContent: React.FC<HomeContentProps> = ({
  controller,
  data,
  handleClaimReward,
  streakHoursRemaining,
  canShowWagers,
  activeWagerQuery,
  canShowBattlePass,
  features,
  comebackSessionsCompleted,
  activeBossQuery,
  bountyStatusQuery,
  placeBountyMutation,
  coinBalance,
  canShowBossBounties,
  primaryRecommendation,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const companionStatus = useHomeCompanion(controller.userId, controller.isOnline);

  return (
    <HomeMissionInput
      activeBossQuery={activeBossQuery}
      canShowBossBounties={canShowBossBounties}
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

          {/* 2. Daily mission card */}
          <HomeSectionBoundary sectionName="Daily Mission">
            <HomeDailyMission
              missionInput={missionInput}
              onMissionPress={() => navigation.navigate('Challenges')}
            />
          </HomeSectionBoundary>

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
              recommendation={primaryRecommendation}
            />
          </HomeSectionBoundary>

          {/* 5. Companion status */}
          <HomeSectionBoundary sectionName="Companion">
            <HomeCompanionWidget
              status={companionStatus}
              onRetry={() => controller.retryAll()}
              onPress={() => navigation.navigate('CompanionDetail')}
            />
          </HomeSectionBoundary>

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
            canShowWagers={canShowWagers}
            activeWagerQuery={activeWagerQuery}
            canShowBattlePass={canShowBattlePass}
            features={features}
            comebackSessionsCompleted={comebackSessionsCompleted}
            activeBossQuery={activeBossQuery}
            bountyStatusQuery={bountyStatusQuery}
            placeBountyMutation={placeBountyMutation}
            coinBalance={coinBalance}
            canShowBossBounties={canShowBossBounties}
          />
        </StaggeredEnter>
      )}
    </HomeMissionInput>
  );
};
