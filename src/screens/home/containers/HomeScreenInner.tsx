/**
 * HomeScreenInner — Shared UI rendering for all stages.
 *
 * Accepts stage-specific data via a minimal common interface.
 * Wires controller + data to the existing HomeContent component.
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GreetingHeader } from '../../../features/home-spine/components';
import { HomeContent } from '../components/HomeContent';
import { HomeInterventionBanner } from '../components/HomeInterventionBanner';
import { useCompletionSyncAutoRepair } from '../../../features/session-completion/hooks';
import { trackInterventionDisplayed, trackInterventionActioned } from '../../../features/ai-coach/analytics';
import { eventBus } from '../../../events';
import { getOrchestratorHandlesCompletion } from '../../../session/analytics/SessionAnalytics';
import { buildInterventionSessionParams } from '../buildInterventionSessionParams';
import { AppScreen } from '../../../components/primitives';
import { useHomeSurfaceMap } from '../hooks/useHomeSurfaceMap';
import { useHomeResolvedExperience } from '../hooks/useHomeResolvedExperience';
import { useInterventionVisibility } from '../hooks/useInterventionVisibility';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import type { HomeController } from '../hooks/home-controller-types';
import type { HomeViewModel } from '../hooks/home-view-model';
import type { ActiveIntervention } from '../../../features/ai-coach/hooks';
import type { ChallengeItem, SessionListItem } from '../../../features/home-spine/components';
import type { HomeData } from '../hooks/useHomeData';
import type { CompletionSyncState } from '../../../store/session-state';
import { getFeatureAvailability } from '../../../features/liveops-config';
import type { FeatureAccessMap } from '../../../features/liveops-config/feature-access';
import type { ToastOptions } from '../../../shared/ui/components/Toast';
import { buildToast } from './home-screen-inner-helpers';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

export interface HomeDataProps {
  controller: HomeController;
  intervention: ActiveIntervention | null;
  interventionLoading: boolean;
  dismissIntervention: (id: string) => void;
  showToast: (opts: ToastOptions) => string;
  streakHoursRemaining: number | null;
  companionMood: string;
  unreadNotificationCount: number;
  todaysChallenges: ChallengeItem[];
  recentSessions: SessionListItem[];
  comebackSessionsCompleted: number;
  hasActiveSession: boolean;
  resumeTimeSeconds: number | null;
  savedPreview: Record<string, unknown> | null;
  squadMembersFocusing: number | Array<Record<string, unknown>>;
  handleClaimReward: (id: string) => void;
  handleFreezeStreak: () => void;
  challengesQuery: { data: unknown; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => Promise<unknown> };
  claimRewardMutation: { mutate: (input: unknown, opts?: unknown) => unknown; isPending: boolean };
  freezeStreakMutation: { mutate: (input: unknown, opts?: unknown) => unknown; isPending: boolean };
  displayedInterventionIdRef: React.MutableRefObject<string | null>;
}

interface HomeScreenInnerProps {
  model: HomeViewModel & { controller: HomeController };
  data: HomeDataProps;
}

export function HomeScreenInner({ model, data }: HomeScreenInnerProps): JSX.Element {
  const navigation = useNavigation<Nav>();
  const controller = model.controller;
  const {
    intervention,
    dismissIntervention,
    showToast,
    streakHoursRemaining,
    companionMood,
    unreadNotificationCount,
    hasActiveSession,
    recentSessions,
    comebackSessionsCompleted,
    handleClaimReward,
    handleFreezeStreak,
    todaysChallenges,
    challengesQuery,
    claimRewardMutation,
    freezeStreakMutation,
    savedPreview,
    squadMembersFocusing,
    interventionLoading,
    displayedInterventionIdRef,
  } = data;

  useCompletionSyncAutoRepair({ isOnline: controller.isOnline, userId: controller.userId });

  useEffect(() => {
    if (!controller.userId || !intervention || displayedInterventionIdRef.current === intervention.id) return;
    displayedInterventionIdRef.current = intervention.id;
    trackInterventionDisplayed(controller.userId, intervention.type, intervention.hoursRemaining);
  }, [controller.userId, intervention, displayedInterventionIdRef]);

  useEffect(() => {
    if (getOrchestratorHandlesCompletion()) return;
    const unsubscribe = eventBus.subscribe('session:completed', (evt: Record<string, unknown>) => {
      if (evt.userId !== controller.userId) return;
      const toast = buildToast(evt.summary);
      showToast({ type: 'success', title: toast.title, message: toast.message });
    });
    return unsubscribe;
  }, [controller.userId, showToast]);

  const handleInterventionAction = useCallback(
    (active: { id: string; type: string; actionLabel: string; metadata?: Record<string, unknown> }): void => {
      if (!controller.userId) return;
      const normalized: ActiveIntervention = {
        ...active,
        message: '',
        priority: 0,
        metadata: active.metadata ?? {},
        type: ['BURNOUT', 'PLATEAU', 'STREAK_RISK', 'BOSS_FINISH'].includes(active.type)
          ? (active.type as ActiveIntervention['type'])
          : 'STREAK_RISK',
        hoursRemaining: 1,
      };
      dismissIntervention(normalized.id);
      trackInterventionActioned(controller.userId, normalized.type, normalized.actionLabel);
      const params = buildInterventionSessionParams(normalized);
      navigation.navigate('SessionStack', { screen: 'SessionSetup', params });
    },
    [controller.userId, dismissIntervention, navigation],
  );

  const features = controller.disclosure?.features as FeatureAccessMap | undefined ?? {} as FeatureAccessMap;
  const safeStreakHours = streakHoursRemaining ?? 0;

  const { resolvedExperience, firstWeekExperience, personalizationProfile, behaviorStats, laneProfile } = useHomeResolvedExperience(controller);

  const surfaceMap: HomeSurfaceMap = useHomeSurfaceMap({
    personalizationProfile,
    behaviorStats,
    hasActiveStudyPlan: Boolean((controller.activeStudyPlanQuery?.data as Record<string, unknown> | null) != null),
    hasActiveRecommendation: Boolean(controller.primaryRecommendation),
    hasActiveBoss: controller.activeBossQuery?.data != null,
    isFirstSession: controller.isFirstRun,
    featureAccess: controller.disclosure,
    firstWeek: firstWeekExperience,
    laneProfile,
  });

  const { canShowBanner: showIntervention, interventionType } = useInterventionVisibility({
    intervention,
    interventionLoading,
    surfaceMap,
    firstWeekExperience,
    features,
    totalCompletedSessions: controller.disclosure.inputs.totalCompletedSessions,
  });

  const interventionBannerProps = showIntervention && intervention
    ? {
        id: intervention.id,
        type: (['BURNOUT', 'PLATEAU', 'STREAK_RISK', 'BOSS_FINISH'].includes(intervention.type)
          ? intervention.type
          : 'STREAK_RISK') as import('../../../features/ai-coach/components/CoachInterventionBanner').InterventionType,
        message: interventionType === 'soft' ? `${intervention.message} (gentle reminder)` : intervention.message,
        actionLabel: intervention.actionLabel ?? 'Start session',
        hoursRemaining: intervention.hoursRemaining,
        metadata: intervention.metadata as Record<string, unknown> | undefined,
      }
    : null;

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
    </AppScreen>
  );
}
