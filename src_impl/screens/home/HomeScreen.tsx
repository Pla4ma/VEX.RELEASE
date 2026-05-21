/**
 * HomeScreen Coordinator
 *
 * Orchestrates the home screen experience.
 * All data logic moved to useHomeData hook.
 * All content rendering moved to HomeContent component.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';

import { GreetingHeader } from '../../features/home-spine/components';
import { trackInterventionDisplayed, trackInterventionActioned } from '../../features/ai-coach/analytics';
import { eventBus } from '../../events';
import { useCompletionSyncAutoRepair } from '../../features/session-completion/hooks';
import type { ExtendedRootStackParams } from '../../navigation/types';
import type { ActiveIntervention } from '../../features/ai-coach/hooks';
import type { HomeController } from './hooks/home-controller-types';
import { HomeContent } from './components/HomeContent';
import { HomeInterventionBanner } from './components/HomeInterventionBanner';
import { useHomeData } from './hooks/useHomeData';
import { buildInterventionSessionParams } from './buildInterventionSessionParams';
import { AppScreen } from '../../components/primitives';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

const completionToastSummarySchema = z.object({
  grade: z.string().optional(),
  interruptions: z.number().int().nonnegative().optional(),
  focusQuality: z.number().optional(),
});

function buildSessionCompleteToast(summary: unknown): { title: string; message: string } {
  const parsed = completionToastSummarySchema.safeParse(summary);
  if (!parsed.success) {
    return { title: 'Session complete.', message: 'Result saved.' };
  }

  const grade = parsed.data.grade ? `${parsed.data.grade}-grade session.` : 'Session complete.';
  const interruptions = parsed.data.interruptions ?? 0;
  if (interruptions > 0) {
    return {
      title: grade,
      message: `${interruptions} interruption${interruptions === 1 ? '' : 's'} kept this from cleaner work.`,
    };
  }

  const quality = parsed.data.focusQuality;
  return {
    title: grade,
    message: typeof quality === 'number' ? `${Math.round(quality)} focus quality. Clean session logged.` : 'Clean session logged.',
  };
}

export const HomeScreen = withScreenErrorBoundary(function _HomeScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const data = useHomeData();
  const controller: HomeController = data.controller;
  const { intervention, dismissIntervention, showToast } = data;
  const displayedInterventionIdRef = useRef<string | null>(null);
  useCompletionSyncAutoRepair({
    isOnline: controller.isOnline,
    userId: controller.userId,
  });

  useEffect(() => {
    if (!controller.userId || !intervention || displayedInterventionIdRef.current === intervention.id) {
      return;
    }
    displayedInterventionIdRef.current = intervention.id;
    trackInterventionDisplayed(controller.userId, intervention.type, intervention.hoursRemaining);
  }, [controller.userId, intervention]);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('session:completed', (evt) => {
      if (evt.userId !== controller.userId) {return;}
      const toast = buildSessionCompleteToast(evt.summary);
      showToast({
        type: 'success',
        title: toast.title,
        message: toast.message,
      });
    });
    return unsubscribe;
  }, [controller.userId, showToast]);

  const handleInterventionAction = useCallback((activeIntervention: {
    id: string;
    type: string;
    actionLabel: string;
    metadata?: Record<string, unknown>;
  }): void => {
    if (!controller.userId) {return;}

    const normalized: ActiveIntervention = {
      ...activeIntervention,
      message: '',
      priority: 0,
      metadata: activeIntervention.metadata ?? {},
      type: activeIntervention.type === 'BURNOUT' ||
        activeIntervention.type === 'PLATEAU' ||
        activeIntervention.type === 'STREAK_RISK' ||
        activeIntervention.type === 'BOSS_FINISH'
        ? activeIntervention.type
        : 'STREAK_RISK',
    };
    trackInterventionActioned(controller.userId, normalized.type, activeIntervention.actionLabel);
    eventBus.publish('coach:intervention_actioned', {
      userId: controller.userId,
      interventionId: activeIntervention.id,
      type: normalized.type,
      actionLabel: activeIntervention.actionLabel,
    });

    const { suggestedDurationSeconds, presetMode } = buildInterventionSessionParams(normalized);

    navigation.navigate('SessionStack', {
      screen: 'SessionSetup',
      params: { suggestedDurationSeconds, presetMode },
    });
  }, [controller.userId, navigation]);

  return (
    <AppScreen contentStyle={{ gap: 0, paddingHorizontal: 0, paddingTop: 0 }} padded={false}>
      {/* 1. Identity greeting */}
      <GreetingHeader
        userName={(controller.user as Record<string, unknown> | null)?.displayName as string | undefined}
        avatarUrl={undefined}
        level={(controller.progressionQuery.data as Record<string, unknown> | undefined)?.level as number ?? 1}
        streakDays={controller.currentStreak}
        streakHoursRemaining={data.streakHoursRemaining}
        isLoading={controller.isLoading}
        companionMood={data.companionMood}
        onPressCompanion={() => {
          if (controller.disclosure.features.companion_detail.isUnlocked) {
            navigation.navigate('CompanionDetail');
            return;
          }
          controller.openSetup();
        }}
        onPressNotifications={() => navigation.navigate('Notifications')}
        unreadNotificationCount={data.unreadNotificationCount}
      />

      <HomeInterventionBanner
        intervention={data.intervention}
        interventionLoading={data.interventionLoading}
        dismissIntervention={data.dismissIntervention}
        navigation={navigation}
        userId={controller.userId}
      />

      <HomeContent
        controller={controller}
        data={data}
        handleClaimReward={data.handleClaimReward}
        streakHoursRemaining={data.streakHoursRemaining ?? 0}
        features={controller.disclosure.features}
        comebackSessionsCompleted={data.comebackSessionsCompleted}
      />
    </AppScreen>
  );
}, 'Home');

export default HomeScreen;
