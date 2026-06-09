/**
 * HomeScreenInner — Shared UI rendering for all stages.
 *
 * Accepts stage-specific data via a minimal common interface.
 * Wires controller + data to the existing HomeContent component.
 */
import React from 'react';
import { ScrollView, View } from 'react-native';

import { HomeContent } from '../components/HomeContent';
import { HomeInterventionBanner } from '../components/HomeInterventionBanner';
import { useCompletionSyncAutoRepair } from '../../../features/session-completion/hooks';
import { GlassScreen } from '../../../components/glass/GlassScreen';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { useHomeSurfaceMap } from '../hooks/useHomeSurfaceMap';
import { useHomeResolvedExperience } from '../hooks/useHomeResolvedExperience';
import { useInterventionVisibility } from '../hooks/useInterventionVisibility';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';
import type { HomeData } from '../hooks/useHomeData';
import type { FeatureAccessMap } from '../../../features/liveops-config/feature-access';

import type { HomeScreenInnerProps } from './HomeScreenInnerTypes';
import { useHomeScreenInnerEffects } from './useHomeScreenInnerEffects';
import { HomeTopBar } from './HomeTopBar';

export type { HomeDataProps, HomeScreenInnerProps } from './HomeScreenInnerTypes';

function HomeScreenInnerRaw({
  model,
  data,
}: HomeScreenInnerProps): JSX.Element {
  const controller = model.controller;
  const {
    intervention,
    dismissIntervention,
    showToast,
    streakHoursRemaining,
    comebackSessionsCompleted,
    handleClaimReward,
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

  const { interventionBannerProps } = useHomeScreenInnerEffects({
    controller,
    intervention,
    interventionLoading,
    dismissIntervention,
    showToast,
    displayedInterventionIdRef,
    showIntervention,
    interventionType,
  });

  return (
      <GlassScreen showAura variant="home">
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 6 }}>
          <HomeTopBar />
          <ScrollView
            contentContainerStyle={{ paddingBottom: 200 }}
            showsVerticalScrollIndicator={false}
          >
            {interventionBannerProps && (
              <HomeInterventionBanner
                intervention={interventionBannerProps}
                interventionLoading={interventionLoading}
                dismissIntervention={dismissIntervention}
                navigation={undefined}
                userId={controller.userId ?? ''}
              />
            )}
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
          </ScrollView>
        </View>
      </GlassScreen>
  );
}

export const HomeScreenInner = React.memo(HomeScreenInnerRaw);
HomeScreenInner.displayName = 'HomeScreenInner';
