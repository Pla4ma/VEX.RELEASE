import React from 'react';
import { View } from 'react-native';
import { AtRiskBanner } from '../../../features/home-spine/components';
import { StaggeredEnter } from '../../../shared/ui/components/EnterAnimation';
import type { HomeController } from '../hooks/home-controller-types';
import { HomeStatusBanners } from './HomeStatusBanners';
import {
  HomeExperiencePrelude,
  useHomeExperienceModel,
} from '../../../features/home-experience';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';
import type { FirstWeekExperience } from '../../../features/personalization/first-week-schemas';
import type { VexExperience } from '../../../features/personalization/schemas';
import type { useHomeData } from '../hooks/useHomeData';
import {
  staggeredEnterStyle,
} from './homeContentHelpers';
import { Text } from '../../../components/primitives/Text';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { Icon } from '../../../icons';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import { ReferenceChart } from '../../reference-ui/ReferenceChart';
import { ReferenceMetric } from '../../reference-ui/ReferenceMetric';
import { ref, type } from '../../reference-ui/referenceTokens';

type HomeData = ReturnType<typeof useHomeData>;

interface HomeContentProps {
  controller: HomeController;
  data: HomeData;
  comebackSessionsCompleted: number;
  features: HomeController['features'];
  handleClaimReward: (rewardId: string) => void;
  streakHoursRemaining: number;
  surfaceMap?: HomeSurfaceMap;
  resolvedExperience?: VexExperience;
  firstWeekExperience?: FirstWeekExperience;
}

export const HomeContent: React.FC<HomeContentProps> = ({
  controller,
  data,
  handleClaimReward,
  streakHoursRemaining,
  features,
  comebackSessionsCompleted,
  surfaceMap,
  resolvedExperience,
  firstWeekExperience,
}) => {
  const homeExperience = useHomeExperienceModel(
    controller.disclosure.inputs.totalCompletedSessions,
    resolvedExperience,
    firstWeekExperience,
  );
  const isDayZero = homeExperience.stage === 'STAGE_0';

  const showAtRiskBanner =
    streakHoursRemaining !== null && streakHoursRemaining <= 4;
  const focusScore = Math.max(0, controller.disclosure.inputs.totalCompletedSessions) > 2 ? 82 : 0;

  return (
    <StaggeredEnter
      containerStyle={staggeredEnterStyle.container}
      direction="up"
      initialDelay={100}
      speed="normal"
      staggerDelay={60}
    >
      <HomeStatusBanners
        isOnline={controller.isOnline}
        completionSync={controller.completionSync}
        loadError={controller.loadError}
        onRetry={controller.retryAll}
      />

      <ReferenceCard glow showAsset={false}>
        <View
          pointerEvents="none"
          style={{ position: 'absolute', right: -16, top: 6, zIndex: 1 }}
        >
              <VexAssetImage name="sculpture" size={154} opacity={0.58} />
        </View>
        <Text style={type.kicker}>DAILY FOCUS</Text>
        <Text style={[type.hero, { marginTop: 8, maxWidth: 220 }]}>Your project is waiting.</Text>
        <Text style={[type.body, { marginTop: 6, maxWidth: 205 }]}>
          Pick up right where you stopped. The next move is already saved.
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <Text style={[type.body, { color: ref.mintDark }]}>Adaptive</Text>
          <Text style={[type.body, { color: ref.mintDark }]}>Project Work</Text>
        </View>
        <View style={{ marginTop: 14 }}>
          <Text style={type.title}>First contract</Text>
          <Text style={[type.body, { marginTop: 4 }]}>30 minutes, one clean start.</Text>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <LiquidButton
              accessibilityHint="Resume your project session"
              accessibilityLabel="Resume project"
              label="Resume project"
              onPress={() => controller.openSetup()}
              rightIcon={<Icon color={ref.white} name="arrowRight" size="sm" />}
              size="md"
              variant="fire"
            />
            <Text style={[type.body, { fontWeight: '800' }]}>~30 min</Text>
          </View>
        </View>
        <Text style={[type.body, { marginTop: 12 }]}>Next move is saved. Open the thread.</Text>
      </ReferenceCard>

      <ReferenceCard accent="fire" showAsset={false}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
          <VexAssetImage name="orangeHumanCoach" size={88} />
          <View style={{ flex: 1 }}>
            <Text style={type.title}>AI Coach</Text>
            <Text style={type.body}>You built real momentum. Protect this block.</Text>
          </View>
          <Icon color={ref.muted} name="chevronRight" size="sm" />
        </View>
      </ReferenceCard>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <ReferenceCard accent="fire" showAsset={false} style={{ flex: 1 }}>
          <Text style={type.title}>{controller.currentStreak || 7} Day Streak</Text>
          <ReferenceMetric label="stability" tone="fire" value="2.0x" progress={0.82} />
        </ReferenceCard>
        <ReferenceCard accent="fire" showAsset={false} style={{ flex: 1 }}>
          <Text style={type.title}>Focus Score</Text>
          <Text style={{ color: ref.ink, fontSize: 34, fontWeight: '600', lineHeight: 40 }}>{focusScore || 82}</Text>
          <ReferenceChart />
        </ReferenceCard>
      </View>

      <ReferenceCard accent="fire" showAsset={false}>
        <Text style={type.title}>Continue where you left off</Text>
        <Text style={[type.body, { marginTop: 6 }]}>Project Atlas opened 2h ago.</Text>
        <View style={{ marginTop: 10 }}>
          <HomeExperiencePrelude
            model={homeExperience}
            firstWeekExperience={firstWeekExperience}
            surfaceMap={surfaceMap}
          />
        </View>
      </ReferenceCard>

      {showAtRiskBanner && (
        <AtRiskBanner
          hoursRemaining={streakHoursRemaining}
          currentStreak={controller.currentStreak}
          onStartSession={() => controller.openSetup()}
          isLoading={controller.streakQuery.isPending}
        />
      )}

    </StaggeredEnter>
  );
};
