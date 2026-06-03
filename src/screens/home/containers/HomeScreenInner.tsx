/**
 * HomeScreenInner — Shared UI rendering for all stages.
 *
 * Accepts stage-specific data via a minimal common interface.
 * Wires controller + data to the existing HomeContent component.
 */
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HomeContent } from '../components/HomeContent';
import { HomeInterventionBanner } from '../components/HomeInterventionBanner';
import { useCompletionSyncAutoRepair } from '../../../features/session-completion/hooks';
import { AppScreen } from '../../../components/primitives';
import { useHomeSurfaceMap } from '../hooks/useHomeSurfaceMap';
import { useHomeResolvedExperience } from '../hooks/useHomeResolvedExperience';
import { useInterventionVisibility } from '../hooks/useInterventionVisibility';
import { ModeNativeHome } from '../../../features/mode-native/components/ModeNativeHome';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import type { ActiveStudyPlanData } from '../hooks/home-query-types';
import type { HomeData } from '../hooks/useHomeData';
import type { FeatureAccessMap } from '../../../features/liveops-config/feature-access';

import type { HomeScreenInnerProps } from './HomeScreenInnerTypes';
import { useHomeScreenInnerEffects } from './useHomeScreenInnerEffects';

export type { HomeDataProps, HomeScreenInnerProps } from './HomeScreenInnerTypes';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

export function HomeScreenInner({
  model,
  data,
}: HomeScreenInnerProps): JSX.Element {
  const navigation = useNavigation<Nav>();
  const controller = model.controller;
  const {
    intervention,
    dismissIntervention,
    showToast,
    streakHoursRemaining,
    hasActiveSession,
    recentSessions,
    comebackSessionsCompleted,
    handleClaimReward,
    todaysChallenges,
    challengesQuery,
    claimRewardMutation,
    freezeStreakMutation,
    savedPreview,
    squadMembersFocusing,
    interventionLoading,
    displayedInterventionIdRef,
  } = data;

  useCompletionSyncAutoRepair({
    isOnline: controller.isOnline,
    userId: controller.userId,
  });

  const features =
    (controller.disclosure?.features as FeatureAccessMap | undefined) ??
    ({} as FeatureAccessMap);
  const safeStreakHours = streakHoursRemaining ?? 0;

  const {
    resolvedExperience,
    firstWeekExperience,
    personalizationProfile,
    behaviorStats,
    laneProfile,
  } = useHomeResolvedExperience(controller);

  const surfaceMap: HomeSurfaceMap = useHomeSurfaceMap({
    personalizationProfile,
    behaviorStats,
    hasActiveStudyPlan: Boolean(
      (controller.activeStudyPlanQuery?.data as Record<
        string,
        unknown
      > | null) != null,
    ),
    hasActiveRecommendation: Boolean(controller.primaryRecommendation),
    hasActiveBoss: controller.activeBossQuery?.data != null,
    isFirstSession: controller.isFirstRun,
    featureAccess: controller.disclosure,
    firstWeek: firstWeekExperience,
    laneProfile,
  });

  const { canShowBanner: showIntervention, interventionType } =
    useInterventionVisibility({
      intervention,
      interventionLoading,
      surfaceMap,
      firstWeekExperience,
      features,
      totalCompletedSessions:
        controller.disclosure.inputs.totalCompletedSessions,
    });

  const { interventionBannerProps, handleInterventionAction } =
    useHomeScreenInnerEffects({
      controller,
      intervention,
      interventionLoading,
      dismissIntervention,
      showToast,
      displayedInterventionIdRef,
      showIntervention,
      interventionType,
    });

  const primaryLane = laneProfile.primaryLane;
  const isDayZero =
    controller.disclosure.inputs.totalCompletedSessions === 0;

  return (
    <AppScreen scroll padded>
      {interventionBannerProps && (
        <HomeInterventionBanner
          intervention={interventionBannerProps}
          interventionLoading={interventionLoading}
          dismissIntervention={dismissIntervention}
          navigation={navigation}
          userId={controller.userId ?? ''}
        />
      )}
      <ModeNativeHome
        lane={primaryLane}
        homeContext={{
          hasActiveProject: !!(controller.activeStudyPlanQuery?.data as ActiveStudyPlanData | null),
          projectTitle: undefined,
          nextMove: undefined,
          recentTopic: undefined,
        }}
        onStart={() => controller.openSetup()}
      />
      {!isDayZero && (
        <HomeContent
          controller={controller}
          data={data as HomeData}
          comebackSessionsCompleted={comebackSessionsCompleted ?? 0}
          features={features}
          handleClaimReward={handleClaimReward}
          streakHoursRemaining={safeStreakHours}
          surfaceMap={surfaceMap}
          resolvedExperience={resolvedExperience}
          firstWeekExperience={firstWeekExperience}
        />
      )}
    </AppScreen>
  );
}
