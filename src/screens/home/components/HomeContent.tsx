import React from 'react';

import { AtRiskBanner } from '../../../features/home-spine/components/AtRiskBanner';
import { StaggeredEnter } from '../../../shared/ui/components/EnterAnimation';
import type { HomeController } from '../hooks/home-controller-types';
import { HomeStatusBanners } from './HomeStatusBanners';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';
import type { FirstWeekExperience } from '../../../features/personalization/first-week-schemas';
import type { VexExperience } from '../../../features/personalization/schemas';
import { staggeredEnterStyle } from './homeContentHelpers';
import { buildHomeUnlockPathModel } from '../services/home-unlock-path-service';
import { HomeDayZeroLaunchpad } from './HomeDayZeroLaunchpad';
import { HomeUnlockPath } from './HomeUnlockPath';
import { HomeCinematicHero } from './HomeCinematicHero';
import { HomeIntelligenceCard } from './HomeIntelligenceCard';

import type { useHomeData } from '../hooks/useHomeData';
import type { UseQueryResult } from '@tanstack/react-query';
import type { CoachAgentDecision } from '../../../features/invisible-agent';
import { HomeAgentSignalCard } from './HomeAgentSignalCard';
type HomeData = ReturnType<typeof useHomeData>;

interface HomeContentProps {
  controller: HomeController;
  data: HomeData;
  comebackSessionsCompleted: number;
  features: HomeController['features'];
  handleClaimReward: (rewardId: string) => void;
  streakHoursRemaining: number;
  surfaceMap?: HomeSurfaceMap;
  resolvedExperience?: VexExperience;
  firstWeekExperience?: FirstWeekExperience;
  agentQuery?: UseQueryResult<CoachAgentDecision>;
  onAgentConfirm?: (decision: CoachAgentDecision) => void;
  onOpenCoach?: () => void;
}

export const HomeContent: React.ComponentType<HomeContentProps> = ({
  controller,
  data: _data,
  handleClaimReward: _handleClaimReward,
  streakHoursRemaining,
  features: _features,
  comebackSessionsCompleted: _comebackSessionsCompleted,
  surfaceMap: _surfaceMap,
  resolvedExperience: _resolvedExperience,
  firstWeekExperience: _firstWeekExperience,
  agentQuery,
  onAgentConfirm,
  onOpenCoach,
}) => {
  const completedSessions = controller.disclosure.inputs.totalCompletedSessions;
  const showUnlockPath = completedSessions < 2;
  const isDayZero = completedSessions === 0;
  const unlockPathModel = buildHomeUnlockPathModel({
    completedSessions,
    currentStreak: controller.currentStreak,
    todayFocusMinutes: controller.todayFocusMinutes,
  });

  const showAtRiskBanner =
    streakHoursRemaining !== null && streakHoursRemaining <= 4;

return (
<StaggeredEnter
      containerStyle={staggeredEnterStyle.container}
      direction="up"
      initialDelay={100}
      speed="normal"
      staggerDelay={60}
    >
      <HomeStatusBanners
        isOnline={controller.isOnline}
        completionSync={controller.completionSync}
        loadError={controller.loadError}
        onRetry={controller.retryAll}
      />

      {isDayZero ? (
        <HomeDayZeroLaunchpad
          onStartSession={() => controller.openSetup()}
          onOpenCoach={controller.openCoach}
          userId={controller.userId}
        />
      ) : null}

      <HomeCinematicHero
        controller={controller}
        onOpenStudy={controller.openContentStudy}
        onOpenProgress={controller.openProgress}
        onStartSession={() => controller.openSetup()}
      />
      {agentQuery && onAgentConfirm && onOpenCoach ? <HomeAgentSignalCard onConfirm={onAgentConfirm} onOpenCoach={onOpenCoach} query={agentQuery} /> : null}
      <HomeIntelligenceCard controller={controller} />
      {showUnlockPath ? (
        <HomeUnlockPath
          model={unlockPathModel}
          onStartSession={() => controller.openSetup()}
        />
      ) : null}

      {showAtRiskBanner && (
        <AtRiskBanner
          hoursRemaining={streakHoursRemaining}
          currentStreak={controller.currentStreak}
          onStartSession={() => controller.openSetup()}
          isLoading={controller.streakQuery.isPending}
        />
      )}
    </StaggeredEnter>
  );
};
