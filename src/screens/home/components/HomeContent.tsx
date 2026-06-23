import React from 'react';
import { View } from 'react-native';

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
import { HomeDailyCards } from './HomeDailyCards';
import { HomeMetricsRow } from './HomeMetricsRow';
import { HomeContinueCard } from './HomeContinueCard';
import { InvisibleAgentCard } from '../../../features/invisible-agent/components/InvisibleAgentCard';
import type { CoachAgentDecision } from '../../../features/invisible-agent';
import type { useHomeData } from '../hooks/useHomeData';
import type { UseQueryResult } from '@tanstack/react-query';

type HomeData = ReturnType<typeof useHomeData> & {
  invisibleAgentQuery?: UseQueryResult<CoachAgentDecision>;
};

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
}

export const HomeContent: React.FC<HomeContentProps> = ({
  controller,
  data,
  handleClaimReward: _handleClaimReward,
  streakHoursRemaining,
  features: _features,
  comebackSessionsCompleted: _comebackSessionsCompleted,
  surfaceMap,
  resolvedExperience,
  firstWeekExperience,
}) => {
  const { showToast } = data;
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
  const focusScore = completedSessions > 2 ? 82 : 0;

  const handlePeekLocked = (item: {
    reward: string;
    current: number;
    requirement: number;
  }): void => {
    const remaining = Math.max(0, item.requirement - item.current);
    showToast({
      type: 'info',
      title: `${item.reward} is locked`,
      message:
        remaining === 1
          ? `Finish 1 more session to unlock ${item.reward}.`
          : `Finish ${remaining} more sessions to unlock ${item.reward}.`,
    });
  };
  const handleAgentConfirm = (decision: CoachAgentDecision): void => {
    if (decision.type === 'CONTINUE_STUDY_PLAN') {
      controller.continueStudyPlan();
      return;
    }
    if (decision.type === 'REVIEW_PROGRESS' || decision.type === 'NO_ACTION') {
      controller.openProgress();
      return;
    }
    controller.openSetup(decision.actionPayload);
  };

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

      {data.invisibleAgentQuery ? (
        <InvisibleAgentCard
          decision={data.invisibleAgentQuery.data ?? null}
          isPending={data.invisibleAgentQuery.isPending}
          isError={data.invisibleAgentQuery.isError}
          onConfirm={handleAgentConfirm}
          onRetry={() => { void data.invisibleAgentQuery?.refetch(); }}
        />
      ) : null}

      {isDayZero ? (
        <HomeDayZeroLaunchpad
          onStartSession={() => controller.openSetup()}
          onOpenCoach={controller.openCoach}
          userId={controller.userId}
        />
      ) : null}

      {showUnlockPath ? (
        <HomeUnlockPath
          model={unlockPathModel}
          onStartSession={() => controller.openSetup()}
          onPeekLocked={handlePeekLocked}
        />
      ) : null}

      {!isDayZero ? (
        <>
          <HomeDailyCards
            controller={controller}
            onStartSession={() => controller.openSetup()}
          />
          <HomeMetricsRow
            controller={controller}
            focusScore={focusScore}
          />
          <HomeContinueCard
            controller={controller}
            completedSessions={completedSessions}
            surfaceMap={surfaceMap}
            resolvedExperience={resolvedExperience}
            firstWeekExperience={firstWeekExperience}
          />
        </>
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
