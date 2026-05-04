/**
 * HomeScreen Coordinator
 *
 * Orchestrates the home screen experience.
 * All data logic moved to useHomeData hook.
 * All content rendering moved to HomeContent component.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GreetingHeader, StartSessionButton } from '../../features/home-spine/components';
import { CoachInterventionBanner } from '../../features/ai-coach/components/CoachInterventionBanner';
import { trackInterventionDisplayed, trackInterventionActioned } from '../../features/ai-coach/analytics';
import { eventBus } from '../../events';
import type { ExtendedRootStackParams } from '../../navigation/types';
import type { ActiveIntervention } from '../../features/ai-coach/hooks';
import { HomeHero } from './HomeScreenVisuals';
import { HomeContent } from './components/HomeContent';
import { useHomeData } from './hooks/useHomeData';
import { readSuggestedDuration, readSuggestedMode } from './utils';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

export function HomeScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const data = useHomeData();
  const { controller, intervention, dismissIntervention, showToast } = data;
  const displayedInterventionIdRef = useRef<string | null>(null);

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
    type: 'BURNOUT' | 'PLATEAU' | 'STREAK_RISK' | 'BOSS_FINISH';
    actionLabel: string;
    metadata?: Record<string, unknown>;
  }): void => {
    if (!controller.userId) {return;}

    trackInterventionActioned(controller.userId, activeIntervention.type, activeIntervention.actionLabel);
    eventBus.publish('coach:intervention_actioned', {
      userId: controller.userId,
      interventionId: activeIntervention.id,
      type: activeIntervention.type,
      actionLabel: activeIntervention.actionLabel,
    });

    const normalized: ActiveIntervention = {
      ...activeIntervention,
      message: '',
      metadata: activeIntervention.metadata ?? {},
    } as ActiveIntervention;

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
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
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

      <HomeHero
        currentStreak={controller.currentStreak}
        insetsTop={data.insets.top}
        isAtRisk={Boolean(controller.streakQuery.data?.isAtRisk)}
        isFirstRun={controller.isFirstRun}
        isLoading={controller.isLoading}
        progressPercent={controller.progressPercent}
        todayFocusMinutes={controller.todayFocusMinutes}
        userFirstName={controller.user?.firstName}
        userId={controller.userId || undefined}
      />

      {!data.interventionLoading && intervention && (
        <CoachInterventionBanner
          intervention={intervention}
          coachName="VEX Coach"
          onAction={handleInterventionAction as any}
          onDismiss={dismissIntervention}
        />
      )}

      <StartSessionButton
        hasActiveSession={data.hasActiveSession}
        isLoading={controller.isLoading}
        onPress={() => controller.openSetup()}
        resumeTimeSeconds={data.resumeTimeSeconds}
        squadMembersFocusing={data.squadMembersFocusing}
        streakHoursRemaining={data.streakHoursRemaining}
        streakRiskLevel={controller.streakQuery.data?.riskLevel ?? 'NONE'}
      />

      <HomeContent navigation={navigation} data={data} />
    </ScrollView>
  );
}

export default HomeScreen;
