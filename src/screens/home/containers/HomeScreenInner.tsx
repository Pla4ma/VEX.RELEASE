/**
 * HomeScreenInner â€” Shared UI rendering for all stages.
 *
 * Accepts stage-specific data via a minimal common interface.
 * Wires controller + data to the existing HomeContent component.
 */
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HomeContent } from '../components/HomeContent';
import { HomeInterventionBanner } from '../components/HomeInterventionBanner';
import { useCompletionSyncAutoRepair } from '../../../features/session-completion/hooks';
import { GlassScreen } from '../../../components/glass/GlassScreen';
import { VexBrandPill } from '../components/VexBrandPill';
import { Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../../../icons';
import { GlassPill } from '../../../components/glass/GlassPill';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { useHomeSurfaceMap } from '../hooks/useHomeSurfaceMap';
import { useHomeResolvedExperience } from '../hooks/useHomeResolvedExperience';
import { useInterventionVisibility } from '../hooks/useInterventionVisibility';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';
import type { ExtendedRootStackParams } from '../../../navigation/types';
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
    <GlassScreen showAura>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 6 }}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 14,
            zIndex: 2,
          }}
        >
          <VexBrandPill />
          <GlassPill
            label="Project mode"
            rightIcon={
              <Icon
                color={vexLightGlass.mint[700]}
                name="chevronDown"
                size="xs"
                variant="solid"
              />
            }
            size="sm"
            variant="mint"
          />
          <Pressable
            accessibilityHint="Shows your VEX notifications"
            accessibilityLabel="Open notifications"
            accessibilityRole="button"
            onPress={() => navigation.navigate('Notifications')}
            style={{
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.42)',
              borderColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 19,
              borderWidth: 1,
              height: 38,
              justifyContent: 'center',
              overflow: 'hidden',
              shadowColor: 'rgba(13, 76, 65, 0.16)',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              width: 38,
            }}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.88)', 'rgba(255, 255, 255, 0.32)']}
              end={{ x: 0, y: 1 }}
              locations={[0, 0.55]}
              start={{ x: 0, y: 0 }}
              style={{
                borderTopLeftRadius: 19,
                borderTopRightRadius: 19,
                height: '60%',
                left: 0,
                position: 'absolute',
                right: 0,
                top: 0,
              }}
            />
            <View
              pointerEvents="none"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderTopLeftRadius: 21,
                borderTopRightRadius: 21,
                height: 1,
                left: 8,
                position: 'absolute',
                right: 8,
                top: 1,
              }}
            />
            <Icon
              color={vexLightGlass.text.primary}
              name="notification"
              size="sm"
              variant="outline"
            />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 180 }}
          showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>
      </View>
    </GlassScreen>
  );
}

