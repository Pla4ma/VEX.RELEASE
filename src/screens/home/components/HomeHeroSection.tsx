import React, { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ErrorState } from '../../../components/states/ErrorState';
import { useHomePriority } from '../../../features/home-spine/hooks';
import type {
  HomePrimaryPriority,
  HomeStakes,
  ProductContext,
} from '../../../features/home-spine/priority-schemas';
import {
  getFeatureAvailability,
  isFeatureAvailableForNavigation,
} from '../../../features/liveops-config';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';
import type { FirstWeekExperience } from '../../../features/personalization/first-week-schemas';
import type { ExtendedRootStackParams} from '../../../navigation/types';
import type { HomeController } from '../hooks/home-controller-types';
import { VexFocusSurface } from './VexFocusSurface';
import {
  buildOfflineFallback,
  toSessionSetupParams,
} from './HomeHeroSection.utils';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

interface HomeHeroSectionProps {
  controller: HomeController;
  surfaceMap?: HomeSurfaceMap;
  firstWeekExperience?: FirstWeekExperience;
}

export function HomeHeroSection({
  controller,
  surfaceMap,
  firstWeekExperience,
}: HomeHeroSectionProps): React.ReactNode {
  const navigation = useNavigation<NavigationProp>();

  const productContext = useMemo<ProductContext>(() => {
    if (!surfaceMap && !firstWeekExperience) {return {};}
    return {
      surfaceMap: surfaceMap as ProductContext['surfaceMap'],
      firstWeekExperience: firstWeekExperience
        ? {
            bossIntensity: firstWeekExperience.bossIntensity,
            currentDayStage: firstWeekExperience.currentDayStage,
            premiumMoment: firstWeekExperience.premiumMoment,
            allowedHomeSurfaces: firstWeekExperience.allowedHomeSurfaces,
          }
        : undefined,
      userStage:
        controller.disclosure.inputs.totalCompletedSessions === 0
          ? 'new'
          : controller.disclosure.inputs.totalCompletedSessions < 3
            ? 'activating'
            : controller.disclosure.inputs.totalCompletedSessions < 10
              ? 'engaged'
              : 'power',
      totalCompletedSessions:
        controller.disclosure.inputs.totalCompletedSessions,
    };
  }, [
    surfaceMap,
    firstWeekExperience,
    controller.disclosure.inputs.totalCompletedSessions,
  ]);

  const priorityQuery = useHomePriority(
    controller.userId,
    controller.disclosure.features,
    productContext,
  );
  const priority = priorityQuery.data?.primary ?? null;
  const stakes: HomeStakes | null = priorityQuery.data?.stakes ?? null;
  const effectivePriority =
    priority && !controller.isOnline
      ? buildOfflineFallback(priority)
      : priority;

  const handlePrimaryPress = (): void => {
    if (!effectivePriority) {
      return;
    }

    const sm = surfaceMap;

    if (effectivePriority.cta.action === 'OPEN_BOSS') {
      const bossAccess = controller.disclosure.features.boss_tab;
      if (
        !isFeatureAvailableForNavigation(getFeatureAvailability(bossAccess))
      ) {
        controller.openSetup();
        return;
      }
      if (sm) {
        const bossBlocked =
          (sm.boss_compact === 'hidden' || sm.boss_compact === 'blocked') &&
          (sm.boss_full_cta === 'hidden' || sm.boss_full_cta === 'blocked');
        if (bossBlocked) {
          controller.openSetup();
          return;
        }
      }
      if (
        firstWeekExperience &&
        firstWeekExperience.bossIntensity === 'hidden'
      ) {
        controller.openSetup();
        return;
      }
      navigation.navigate('Boss');
      return;
    }

    if (effectivePriority.cta.action === 'OPEN_CHALLENGES') {
      const challengesAccess = controller.disclosure.features.challenges;
      if (
        !isFeatureAvailableForNavigation(
          getFeatureAvailability(challengesAccess),
        )
      ) {
        controller.openSetup();
        return;
      }
      if (sm) {
        const challengesBlocked =
          (sm.challenge_teaser === 'hidden' ||
            sm.challenge_teaser === 'blocked') &&
          (sm.weekly_quest === 'hidden' || sm.weekly_quest === 'blocked');
        if (challengesBlocked) {
          controller.openSetup();
          return;
        }
      }
      navigation.navigate('Challenges');
      return;
    }

    const params = effectivePriority.cta.params as
      | Record<string, unknown>
      | undefined;
    if (sm && params && params.presetMode === 'STUDY') {
      const studyBlocked =
        sm.study_layer === 'hidden' || sm.study_layer === 'blocked';
      if (studyBlocked) {
        controller.openSetup();
        return;
      }
    }

    controller.openSetup(
      toSessionSetupParams(params) as Record<string, unknown>,

    );
  };

  if (priorityQuery.isError) {
    return (
      <ErrorState
        title="Home action paused"
        description="VEX could not choose the next move yet. Pull once more and the path will settle."
        retryLabel="Retry Home Action"
        onRetry={() => {
          priorityQuery.refetch();
        }}
      />
    );
  }

  return (
    <VexFocusSurface
      isLoading={priorityQuery.isPending}
      onPressPrimary={handlePrimaryPress}
      priority={effectivePriority}
      stakes={stakes}
    />
  );
}
