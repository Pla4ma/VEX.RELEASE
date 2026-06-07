import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { AtRiskBanner } from '../../../features/home-spine/components';
import { StaggeredEnter } from '../../../shared/ui/components/EnterAnimation';
import type { HomeController } from '../hooks/home-controller-types';
import type { CompletionSyncState } from '../../../store/session-state';
import { HomeStatusBanners } from './HomeStatusBanners';
import { HomeContentLower } from './HomeContentLower';
import { HomeSectionBoundary } from './HomeSectionBoundary';
import { HomeHeroSection } from './HomeHeroSection';
import { HomeStreakProgress } from './HomeStreakProgress';
import { HomeCompanionSection } from './HomeCompanionSection';
import {
  HomeExperiencePrelude,
  useHomeExperienceModel,
} from '../../../features/home-experience';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';
import type { FirstWeekExperience } from '../../../features/personalization/first-week-schemas';
import type { VexExperience } from '../../../features/personalization/schemas';
import type { useHomeData } from '../hooks/useHomeData';
import type { StreakSummaryData } from '../hooks/home-query-types';
import {
  staggeredEnterStyle,
  openCompanion,
  type NavigationProp,
} from './homeContentHelpers';

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
}

export const HomeContent: React.FC<HomeContentProps> = ({
  controller,
  data,
  handleClaimReward,
  streakHoursRemaining,
  features,
  comebackSessionsCompleted,
  surfaceMap,
  resolvedExperience,
  firstWeekExperience,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const homeExperience = useHomeExperienceModel(
    controller.disclosure.inputs.totalCompletedSessions,
    resolvedExperience,
    firstWeekExperience,
  );
  const isDayZero = homeExperience.stage === 'STAGE_0';

  const sm = surfaceMap;
  const showCompanion = sm
    ? sm.companion_thread !== 'hidden' && sm.companion_thread !== 'blocked'
    : false;
  const showStreak = sm ? sm.progress_proof !== 'hidden' : false;
  const showLowerContent = isDayZero
    ? false
    : sm
      ? sm.boss_teaser !== 'hidden' ||
        sm.challenge_teaser !== 'hidden' ||
        sm.study_layer !== 'hidden'
      : false;
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

      <HomeSectionBoundary sectionName="Hero Action">
        <HomeHeroSection
          controller={controller}
          surfaceMap={surfaceMap}
          firstWeekExperience={firstWeekExperience}
        />
        <HomeExperiencePrelude
          model={homeExperience}
          firstWeekExperience={firstWeekExperience}
          surfaceMap={surfaceMap}
        />
      </HomeSectionBoundary>

      {showCompanion ? (
        <HomeCompanionSection
          currentStreakDays={controller.currentStreak}
          features={features}
          highFocusStreak={controller.currentStreak}
          isOnline={controller.isOnline}
          onAction={() => controller.openSetup()}
          onPress={() => openCompanion(controller, navigation)}
          onRetry={() => controller.retryAll()}
          totalSessions={controller.disclosure.inputs.totalCompletedSessions}
          userId={controller.userId}
        />
      ) : null}

      {showStreak ? (
        <HomeStreakProgress
          currentDays={controller.currentStreak}
          hoursRemaining={streakHoursRemaining}
          riskLevel={
            (controller.streakQuery.data as StreakSummaryData | undefined)
              ?.riskLevel as
              | 'NONE'
              | 'LOW'
              | 'MEDIUM'
              | 'HIGH'
              | 'CRITICAL'
              | undefined
          }
          longestStreak={
            (controller.streakQuery.data as StreakSummaryData | undefined)
              ?.longestDays as number | undefined
          }
          isLoading={controller.streakQuery.isPending}
          userId={controller.userId ?? undefined}
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

      {showLowerContent && surfaceMap ? (
        <HomeContentLower
          controller={controller}
          data={data}
          missionInput={{}}
          handleClaimReward={handleClaimReward}
          streakHoursRemaining={streakHoursRemaining}
          features={features}
          comebackSessionsCompleted={comebackSessionsCompleted}
          surfaceMap={surfaceMap}
        />
      ) : null}
    </StaggeredEnter>
  );
};
