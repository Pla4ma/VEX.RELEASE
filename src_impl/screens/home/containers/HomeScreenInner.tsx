/**
 * HomeScreenInner — Shared UI rendering for all stages.
 *
 * Renders the Home screen with the controller and data from the stage-specific container.
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';

import { GreetingHeader } from '../../../features/home-spine/components';
import { HomeContent } from '../components/HomeContent';
import { HomeInterventionBanner } from '../components/HomeInterventionBanner';
import { useCompletionSyncAutoRepair } from '../../../features/session-completion/hooks';
import { trackInterventionDisplayed, trackInterventionActioned } from '../../../features/ai-coach/analytics';
import { eventBus } from '../../../events';
import { buildInterventionSessionParams } from '../buildInterventionSessionParams';
import { AppScreen } from '../../../components/primitives';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import type { HomeController } from '../hooks/home-controller-types';
import type { HomeViewModel } from '../hooks/home-view-model';
import type { ActiveIntervention } from '../../../features/ai-coach/hooks';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

const completionToastSummarySchema = z.object({
  grade: z.string().optional(),
  interruptions: z.number().int().nonnegative().optional(),
  focusQuality: z.number().optional(),
});

function buildToast(summary: unknown): { title: string; message: string } {
  const parsed = completionToastSummarySchema.safeParse(summary);
  if (!parsed.success) return { title: 'Session complete.', message: 'Result saved.' };
  const grade = parsed.data.grade ? `${parsed.data.grade}-grade session.` : 'Session complete.';
  const interruptions = parsed.data.interruptions ?? 0;
  if (interruptions > 0) return { title: grade, message: `${interruptions} interruption${interruptions === 1 ? '' : 's'} kept this from cleaner work.` };
  return { title: grade, message: 'Result saved.' };
}

interface HomeScreenInnerProps {
  model: HomeViewModel & { controller: HomeController };
  data: ReturnType<typeof import('../hooks/useHomeData').useHomeData>;
}

export function HomeScreenInner({ model, data }: HomeScreenInnerProps): JSX.Element {
  const navigation = useNavigation<Nav>();
  const controller = model.controller;
  const { intervention, dismissIntervention, showToast, streakHoursRemaining, companionMood, unreadNotificationCount } = data;
  const displayedInterventionIdRef = useRef<string | null>(null);

  useCompletionSyncAutoRepair({ isOnline: controller.isOnline, userId: controller.userId });

  useEffect(() => {
    if (!controller.userId || !intervention || displayedInterventionIdRef.current === intervention.id) return;
    displayedInterventionIdRef.current = intervention.id;
    trackInterventionDisplayed(controller.userId, intervention.type, intervention.hoursRemaining);
  }, [controller.userId, intervention]);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('session:completed', (evt) => {
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
        type:
          active.type === 'BURNOUT' || active.type === 'PLATEAU' || active.type === 'STREAK_RISK' || active.type === 'BOSS_FINISH'
            ? active.type
            : 'STREAK_RISK',
      };
      trackInterventionActioned(controller.userId, normalized.type, active.actionLabel);
      eventBus.publish('coach:intervention_actioned', {
        userId: controller.userId, interventionId: active.id, type: normalized.type, actionLabel: active.actionLabel,
      });
      const { suggestedDurationSeconds, presetMode } = buildInterventionSessionParams(normalized);
      navigation.navigate('SessionStack', { screen: 'SessionSetup', params: { suggestedDurationSeconds, presetMode } });
    },
    [controller.userId, navigation],
  );

  return (
    <AppScreen contentStyle={{ gap: 0, paddingHorizontal: 0, paddingTop: 0 }} padded={false}>
      <GreetingHeader
        userName={(controller.user as Record<string, unknown> | null)?.displayName as string | undefined}
        avatarUrl={undefined}
        level={(controller.progressionQuery.data as Record<string, unknown> | undefined)?.level as number ?? 1}
        streakDays={controller.currentStreak}
        streakHoursRemaining={streakHoursRemaining}
        isLoading={controller.isLoading}
        companionMood={companionMood}
        onPressCompanion={() => {
          if (controller.disclosure.features.companion_detail.isUnlocked) {
            navigation.navigate('CompanionDetail');
            return;
          }
          controller.openSetup();
        }}
        onPressNotifications={() => navigation.navigate('Notifications')}
        unreadNotificationCount={unreadNotificationCount}
      />
      <HomeInterventionBanner
        intervention={intervention}
        interventionLoading={data.interventionLoading}
        dismissIntervention={dismissIntervention}
        navigation={navigation}
        userId={controller.userId}
      />
      <HomeContent
        controller={controller}
        data={data}
        handleClaimReward={data.handleClaimReward}
        streakHoursRemaining={streakHoursRemaining ?? 0}
        features={controller.disclosure.features}
        comebackSessionsCompleted={data.comebackSessionsCompleted}
      />
    </AppScreen>
  );
}
