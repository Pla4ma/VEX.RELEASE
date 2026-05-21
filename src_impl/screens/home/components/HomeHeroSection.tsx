import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';

import { ErrorState } from '../../../components/states/ErrorState';
import { useHomePriority } from '../../../features/home-spine/hooks';
import type { HomePrimaryPriority, HomeStakes } from '../../../features/home-spine/priority-schemas';
import { getFeatureAvailability, isFeatureAvailableForNavigation } from '../../../features/liveops-config';
import type { ExtendedRootStackParams, SessionStackParams } from '../../../navigation/types';
import type { HomeController } from '../hooks/home-controller-types';
import { HomeHeroCard } from './HomeHeroCard';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

const SessionSetupParamsSchema = z.object({
  presetMode: z.enum(['LIGHT_FOCUS', 'DEEP_WORK', 'SPRINT', 'STUDY']).optional(),
  recommendationId: z.string().uuid().optional(),
  suggestedDurationSeconds: z.number().int().positive().optional(),
}).strict();

function toSessionSetupParams(params: Record<string, unknown> | undefined): SessionStackParams['SessionSetup'] {
  return SessionSetupParamsSchema.parse(params ?? {});
}

function buildOfflineFallback(priority: HomePrimaryPriority): HomePrimaryPriority {
  if (priority.cta.action === 'OPEN_SESSION_SETUP') {
    return priority;
  }
  return {
    ...priority,
    cta: {
      action: 'OPEN_SESSION_SETUP',
      params: { presetMode: 'DEEP_WORK', suggestedDurationSeconds: 15 * 60 },
      text: 'Start Focus Offline',
    },
    reason: 'Network-only surfaces are paused right now. You can still start a clean local session.',
  };
}

interface HomeHeroSectionProps {
  controller: HomeController;
}

export function HomeHeroSection({
  controller,
}: HomeHeroSectionProps): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const priorityQuery = useHomePriority(controller.userId, controller.disclosure.features);
  const priority = priorityQuery.data?.primary ?? null;
  const stakes: HomeStakes | null = priorityQuery.data?.stakes ?? null;
  const effectivePriority = priority && !controller.isOnline
    ? buildOfflineFallback(priority)
    : priority;

  const handlePrimaryPress = (): void => {
    if (!effectivePriority) {
      return;
    }
    if (effectivePriority.cta.action === 'OPEN_BOSS') {
      const bossAccess = controller.disclosure.features.boss_tab;
      if (isFeatureAvailableForNavigation(getFeatureAvailability(bossAccess))) {
        navigation.navigate('Boss');
        return;
      }
      controller.openSetup();
      return;
    }
    if (effectivePriority.cta.action === 'OPEN_CHALLENGES') {
      const challengesAccess = controller.disclosure.features.challenges;
      if (isFeatureAvailableForNavigation(getFeatureAvailability(challengesAccess))) {
        navigation.navigate('Challenges');
        return;
      }
      controller.openSetup();
      return;
    }
    controller.openSetup(toSessionSetupParams(effectivePriority.cta.params as Record<string, unknown> | undefined));
  };

  if (priorityQuery.isError) {
    return (
      <ErrorState
        title="Home action paused"
        description="VEX could not choose the next move yet. Pull once more and the path will settle."
        retryLabel="Retry Home Action"
        onRetry={() => {
          void priorityQuery.refetch();
        }}
      />
    );
  }

  return (
    <HomeHeroCard
      isLoading={priorityQuery.isPending}
      onPressPrimary={handlePrimaryPress}
      priority={effectivePriority}
      stakes={stakes}
    />
  );
}
