/**
 * HomeScreen Coordinator
 *
 * Orchestrates the home screen experience.
 * All data logic moved to useHomeData hook.
 * All content rendering moved to HomeContent component.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GreetingHeader, StartSessionButton } from '../../features/home-spine/components';
import { CoachInterventionBanner } from '../../features/ai-coach/components/CoachInterventionBanner';
import { trackInterventionDisplayed, trackInterventionActioned } from '../../features/ai-coach/analytics';
import { eventBus } from '../../events';
import { useCompletionSyncAutoRepair } from '../../features/session-completion/hooks';
import type { ExtendedRootStackParams } from '../../navigation/types';
import type { ActiveIntervention } from '../../features/ai-coach/hooks';
import { HomeHero } from './HomeScreenVisuals';
import { HomeContent } from './components/HomeContent';
import { useHomeData } from './hooks/useHomeData';
import { readSuggestedDuration, readSuggestedMode } from './utils';
import { AppScreen } from '../../components/primitives';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

export function HomeScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const data = useHomeData();
  const { controller, intervention, dismissIntervention, showToast } = data;
  const displayedInterventionIdRef = useRef<string | null>(null);
  useCompletionSyncAutoRepair({
    isOnline: controller.isOnline,
    userId: controller.userId,
  });

  // Track intervention display
  useEffect(() => {
    if (!controller.userId || !intervention || displayedInterventionIdRef.current === intervention.id) {
      return;
    }
    displayedInterventionIdRef.current = intervention.id;
    trackInterventionDisplayed(controller.userId, intervention.type, intervention.hoursRemaining);
  }, [controller.userId, intervention]);

  // Post-session celebration toast
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('session:completed', (evt) => {
      if (evt.userId !== controller.userId) {return;}
      showToast({
        type: 'success',
        title: 'Session complete!',
        message: 'Great focus work. Your companion is proud.',
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

    navigation.navigate('SessionStack', {
      screen: 'SessionSetup',
      params: {
        suggestedDurationSeconds:
          activeIntervention.type === 'BOSS_FINISH' ? 45 * 60 : readSuggestedDuration(normalized),
        presetMode: readSuggestedMode(normalized),
      },
    });
  }, [controller.userId, navigation]);

  return (
    <AppScreen contentStyle={{ gap: 0, paddingHorizontal: 0, paddingTop: 0 }} padded={false}>
      {/* 1. Identity greeting */}
      <GreetingHeader
        userName={controller.user?.firstName}
        avatarUrl={controller.user?.avatar ?? undefined}
        level={controller.progressionQuery.data?.level ?? 1}
        streakDays={controller.currentStreak}
        streakHoursRemaining={data.streakHoursRemaining}
        isLoading={controller.isLoading}
        companionMood={data.companionMood}
        onPressCompanion={() => navigation.navigate('CompanionDetail')}
        onPressNotifications={() => navigation.navigate('Notifications' as never)}
        unreadNotificationCount={data.unreadNotificationCount}
      />

      <HomeContent navigation={navigation} data={data} />
    </AppScreen>
  );
}

export default HomeScreen;
