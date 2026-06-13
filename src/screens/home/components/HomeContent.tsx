import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { staggeredEnterStyle } from './homeContentHelpers';
import { Text } from '../../../components/primitives/Text';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { Icon } from '../../../icons';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import { ReferenceChart } from '../../reference-ui/ReferenceChart';
import { ReferenceMetric } from '../../reference-ui/ReferenceMetric';
import { ref, type } from '../../reference-ui/referenceTokens';
import { buildHomeUnlockPathModel } from '../services/home-unlock-path-service';
import { HomeDayZeroLaunchpad } from './HomeDayZeroLaunchpad';
import { HomeUnlockPath } from './HomeUnlockPath';

type HomeData = ReturnType<typeof useHomeData>;
type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

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

function cardPressStyle(pressed: boolean) {
  return {
    opacity: pressed ? 0.9 : 1,
    transform: [{ scale: pressed ? 0.985 : 1 }],
  } as const;
}

export const HomeContent: React.FC<HomeContentProps> = ({
  controller,
  data,
  handleClaimReward: _handleClaimReward,
  streakHoursRemaining,
  features: _features,
  comebackSessionsCompleted: _comebackSessionsCompleted,
  surfaceMap,
  resolvedExperience,
  firstWeekExperience,
}) => {
  const navigation = useNavigation<Nav>();
  const { showToast } = data;
  const homeExperience = useHomeExperienceModel(
    controller.disclosure.inputs.totalCompletedSessions,
    resolvedExperience,
    firstWeekExperience,
  );
  const completedSessions = controller.disclosure.inputs.totalCompletedSessions;
  const showUnlockPath = completedSessions < 3;
  const isDayZero = completedSessions === 0;
  const unlockPathModel = buildHomeUnlockPathModel({
    completedSessions,
    currentStreak: controller.currentStreak,
    todayFocusMinutes: controller.todayFocusMinutes,
  });

  const showAtRiskBanner =
    streakHoursRemaining !== null && streakHoursRemaining <= 4;
  const focusScore =
    Math.max(0, controller.disclosure.inputs.totalCompletedSessions) > 2
      ? 82
      : 0;

  const handlePeekLocked = (item: {
    reward: string;
    current: number;
    requirement: number;
  }): void => {
    const remaining = Math.max(0, item.requirement - item.current);
    showToast({
      type: 'info',
      title: `${item.reward} is locked`,
      message:
        remaining === 1
          ? `Finish 1 more session to unlock ${item.reward}.`
          : `Finish ${remaining} more sessions to unlock ${item.reward}.`,
    });
  };

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

      {showUnlockPath ? (
        <HomeUnlockPath
          model={unlockPathModel}
          onStartSession={() => controller.openSetup()}
          onPeekLocked={handlePeekLocked}
        />
      ) : null}

      {isDayZero ? (
        <HomeDayZeroLaunchpad
          onOpenProgress={controller.openProgress}
          onStartSession={() => controller.openSetup()}
        />
      ) : null}

      {!isDayZero ? (
        <Pressable
          accessibilityHint="Resume your project session"
          accessibilityLabel="Daily focus card"
          accessibilityRole="button"
          onPress={() => controller.openSetup()}
          style={({ pressed }) => cardPressStyle(pressed)}
        >
          <ReferenceCard glow showAsset={false}>
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                right: -16,
                top: 6,
                zIndex: 0,
              }}
            >
              <VexAssetImage name="sculpture" size={154} opacity={0.52} />
            </View>
            <View style={{ zIndex: 2 }}>
              <Text style={type.kicker}>DAILY FOCUS</Text>
              <Text
                style={[type.hero, { marginTop: 8, maxWidth: 220 }]}
              >
                Your project is waiting.
              </Text>
              <Text style={[type.body, { marginTop: 6, maxWidth: 205 }]}>
                Pick up right where you stopped. The next move is already
                saved.
              </Text>
              <View
                style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}
              >
                <Text style={[type.body, { color: ref.mintDark }]}>
                  Adaptive
                </Text>
                <Text style={[type.body, { color: ref.mintDark }]}>
                  Project Work
                </Text>
              </View>
              <View style={{ marginTop: 14 }}>
                <Text style={type.title}>First contract</Text>
                <Text style={[type.body, { marginTop: 4 }]}>
                  30 minutes, one clean start.
                </Text>
                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  <LiquidButton
                    accessibilityHint="Resume your project session"
                    accessibilityLabel="Resume project"
                    label="Resume project"
                    onPress={() => controller.openSetup()}
                    rightIcon={
                      <Icon color={ref.white} name="arrowRight" size="sm" />
                    }
                    size="md"
                    variant="fire"
                  />
                  <Text style={[type.body, { fontWeight: '800' }]}>
                    ~30 min
                  </Text>
                </View>
              </View>
              <Text style={[type.body, { marginTop: 12 }]}>
                Next move is saved. Open the thread.
              </Text>
            </View>
          </ReferenceCard>
        </Pressable>
      ) : null}

      {!isDayZero ? (
        <Pressable
          accessibilityHint="Open the AI coach"
          accessibilityLabel="AI Coach card"
          accessibilityRole="button"
          onPress={() => navigation.navigate('AICoach')}
          style={({ pressed }) => cardPressStyle(pressed)}
        >
          <ReferenceCard accent="fire" showAsset={false}>
            <View
              style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}
            >
              <VexAssetImage name="orangeHumanCoach" size={88} />
              <View style={{ flex: 1 }}>
                <Text style={type.title}>AI Coach</Text>
                <Text style={type.body}>
                  You built real momentum. Protect this block.
                </Text>
              </View>
              <Icon color={ref.muted} name="chevronRight" size="sm" />
            </View>
          </ReferenceCard>
        </Pressable>
      ) : null}

      {!isDayZero ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            accessibilityHint="Open progress to see streak details"
            accessibilityLabel="Streak card"
            accessibilityRole="button"
            onPress={() => controller.openProgress()}
            style={({ pressed }) => [
              { flex: 1 },
              cardPressStyle(pressed),
            ]}
          >
            <ReferenceCard accent="fire" showAsset={false}>
              <Text style={type.title}>
                {controller.currentStreak || 7} Day Streak
              </Text>
              <ReferenceMetric
                label="stability"
                tone="fire"
                value="2.0x"
                progress={0.82}
              />
            </ReferenceCard>
          </Pressable>
          <Pressable
            accessibilityHint="Open focus score dashboard"
            accessibilityLabel="Focus score card"
            accessibilityRole="button"
            onPress={() => navigation.navigate('FocusScoreDashboard')}
            style={({ pressed }) => [
              { flex: 1 },
              cardPressStyle(pressed),
            ]}
          >
            <ReferenceCard accent="fire" showAsset={false}>
              <Text style={type.title}>Focus Score</Text>
              <Text
                style={{
                  color: ref.ink,
                  fontSize: 34,
                  fontWeight: '600',
                  lineHeight: 40,
                }}
              >
                {focusScore || 82}
              </Text>
              <ReferenceChart />
            </ReferenceCard>
          </Pressable>
        </View>
      ) : null}

      {!isDayZero ? (
        <Pressable
          accessibilityHint="Resume your last project session"
          accessibilityLabel="Continue where you left off"
          accessibilityRole="button"
          onPress={() => controller.openSetup()}
          style={({ pressed }) => cardPressStyle(pressed)}
        >
          <ReferenceCard accent="fire" showAsset={false}>
            <Text style={type.title}>Continue where you left off</Text>
            <Text style={[type.body, { marginTop: 6 }]}>
              Project Atlas opened 2h ago.
            </Text>
            <View style={{ marginTop: 10 }}>
              <HomeExperiencePrelude
                model={homeExperience}
                firstWeekExperience={firstWeekExperience}
                surfaceMap={surfaceMap}
              />
            </View>
          </ReferenceCard>
        </Pressable>
      ) : null}

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
