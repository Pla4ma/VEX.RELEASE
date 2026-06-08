import React from 'react';
import { AtRiskBanner } from '../../../features/home-spine/components';
import { StaggeredEnter } from '../../../shared/ui/components/EnterAnimation';
import type { HomeController } from '../hooks/home-controller-types';
import { HomeStatusBanners } from './HomeStatusBanners';
import { HomeContentLower } from './HomeContentLower';
import { HomeSectionBoundary } from './HomeSectionBoundary';
import { HomeHeroSection } from './HomeHeroSection';
import { HomeReferenceSections } from './HomeReferenceSections';
import {
  HomeExperiencePrelude,
  useHomeExperienceModel,
} from '../../../features/home-experience';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';
import type { FirstWeekExperience } from '../../../features/personalization/first-week-schemas';
import type { VexExperience } from '../../../features/personalization/schemas';
import type { useHomeData } from '../hooks/useHomeData';
import {
  staggeredEnterStyle,
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
  const homeExperience = useHomeExperienceModel(
    controller.disclosure.inputs.totalCompletedSessions,
    resolvedExperience,
    firstWeekExperience,
  );
  const isDayZero = homeExperience.stage === 'STAGE_0';

  const sm = surfaceMap;
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

      <HomeReferenceSections
        currentStreak={controller.currentStreak}
        onStartSession={() => controller.openSetup()}
        totalSessions={controller.disclosure.inputs.totalCompletedSessions}
      />

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
