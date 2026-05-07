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
import { AtRiskBanner } from '../../../features/home-spine/components';
import { StaggeredEnter } from '../../../shared/ui/components/EnterAnimation';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeSecondaryRail } from './HomeSecondaryRail';
import { HomeFocusScore } from './HomeFocusScore';
import { HomeDailyMission } from './HomeDailyMission';
import { HomeSessionControl } from './HomeSessionControl';
import { HomeStreakProgress } from './HomeStreakProgress';
import { HomeContextualCards } from './HomeContextualCards';
import { HomeStatusBanners } from './HomeStatusBanners';
import { HomeWeeklyQuest } from './HomeWeeklyQuest';
import { HomeInterventionBanner } from './HomeInterventionBanner';
import { HomeMissionInput } from './HomeMissionInput';
import { HomeContentLower } from './HomeContentLower';
import type { MissionPriorityInput } from '../../../features/daily-mission/types';

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
  controller: any;
  data: any;
  handleClaimReward: (rewardId: string) => void;
  streakHoursRemaining: number;
  canShowWagers: boolean;
  activeWagerQuery: any;
  canShowBattlePass: boolean;
  features: any;
  comebackSessionsCompleted: number;
  activeBossQuery: any;
  bountyStatusQuery: any;
  placeBountyMutation: any;
  coinBalance: number | null;
  canShowBossBounties: boolean;
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
}) => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <HomeMissionInput>
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
          <HomeFocusScore
            focusScore={controller.focusScore}
            isLoading={controller.focusScoreQuery.isLoading}
            error={controller.focusScoreQuery.error}
          />

          {/* 2. Daily mission card */}
          <HomeDailyMission
            missionInput={missionInput}
            isLoading={controller.dailyMissionQuery.isLoading}
            error={controller.dailyMissionQuery.error}
            onRefresh={() => controller.dailyMissionQuery.refetch()}
          />

          {/* 3. Primary session start control */}
          <HomeSessionControl
            hasActiveSession={data.hasActiveSession}
            isLoading={controller.isLoading}
            onPress={() => controller.openSetup()}
            resumeTimeSeconds={data.resumeTimeSeconds}
            squadMembersFocusing={data.squadMembersFocusing}
            streakHoursRemaining={data.streakHoursRemaining}
            streakRiskLevel={controller.streakQuery.data?.riskLevel}
          />

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