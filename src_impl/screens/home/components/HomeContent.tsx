import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { AtRiskBanner } from '../../../features/home-spine/components';
import { StaggeredEnter } from '../../../shared/ui/components/EnterAnimation';
import { getFeatureAvailability, isFeatureAvailableForNavigation } from '../../../features/liveops-config';
import type { ExtendedRootStackParams, SessionStackParams } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeController } from '../hooks/home-controller-types';
import type { CompletionSyncState } from '../../../store/session-state';
import { HomeStatusBanners } from './HomeStatusBanners';
import { HomeMissionInput } from './HomeMissionInput';
import { HomeContentLower } from './HomeContentLower';
import { HomeSectionBoundary } from './HomeSectionBoundary';
import { HomeHeroSection } from './HomeHeroSection';
import { HomeStreakProgress } from './HomeStreakProgress';
import { HomeWeeklyQuest } from './HomeWeeklyQuest';
import { HomeCompanionSection } from './HomeCompanionSection';
import { HomeExperiencePrelude, useHomeExperienceModel } from '../../../features/home-experience';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';
import type { MissionPriorityInput } from '../../../features/daily-mission/types';
import type { useHomeData } from '../hooks/useHomeData';

type HomeData = ReturnType<typeof useHomeData>;
type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

const staggeredEnterStyle = { container: { gap: 16, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 } };

function buildPromiseSessionParams(promise: { targetDurationMinutes: number; targetMode: 'FOCUS' | 'RECOVERY' | 'STUDY' | 'BOSS_PREP' | 'HABIT_BUILD' }): SessionStackParams['SessionSetup'] {
  const presetMode: SessionStackParams['SessionSetup']['presetMode'] = promise.targetMode === 'RECOVERY' ? 'LIGHT_FOCUS' : promise.targetMode === 'STUDY' ? 'STUDY' : promise.targetMode === 'HABIT_BUILD' ? 'SPRINT' : 'DEEP_WORK';
  return { presetMode, suggestedDurationSeconds: promise.targetDurationMinutes * 60 };
}

interface HomeContentProps {
  controller: HomeController;
  data: HomeData;
  comebackSessionsCompleted: number;
  features: HomeController['features'];
  handleClaimReward: (rewardId: string) => void;
  streakHoursRemaining: number;
  surfaceMap?: HomeSurfaceMap;
}

export const HomeContent: React.FC<HomeContentProps> = ({
  controller,
  data,
  handleClaimReward,
  streakHoursRemaining,
  features,
  comebackSessionsCompleted,
  surfaceMap,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const homeExperience = useHomeExperienceModel(controller.disclosure.inputs.totalCompletedSessions);
  const isDayZero = homeExperience.stage === 'STAGE_0';

  const sm = surfaceMap;
  const showCompanion = sm
    ? sm.companion_thread !== 'hidden' && sm.companion_thread !== 'blocked'
    : false;
  const showStreak = sm
    ? sm.progress_proof !== 'hidden'
    : false;
  const showWeeklyQuest = sm
    ? sm.weekly_quest !== 'hidden' && sm.weekly_quest !== 'blocked'
    : false;
  const showLowerContent = sm
    ? sm.boss_teaser !== 'hidden' || sm.challenge_teaser !== 'hidden' || sm.study_layer !== 'hidden'
    : false;
  const showAtRiskBanner = streakHoursRemaining !== null && streakHoursRemaining <= 4;

  const openChallenges = (): void => {
    const challengesAccess = controller.disclosure.features.challenges;
    if (isFeatureAvailableForNavigation(getFeatureAvailability(challengesAccess))) {
      navigation.navigate('Challenges');
      return;
    }
    controller.openSetup();
  };
  const openCompanion = (): void => {
    const companionAccess = controller.disclosure.features.companion_detail;
    if (isFeatureAvailableForNavigation(getFeatureAvailability(companionAccess))) {
      navigation.navigate('CompanionDetail');
      return;
    }
    controller.openSetup();
  };

  return (
    <HomeMissionInput
      activeBossQuery={{ data: null }}
      canShowBossBounties={false}
      companionMood={data.companionMood}
      controller={controller}
      intervention={data.intervention}
      interventionLoading={data.interventionLoading}
      streakHoursRemaining={streakHoursRemaining}
      todaysChallenges={data.todaysChallenges}
    >
      {(missionInput: Partial<MissionPriorityInput>) => (
        <StaggeredEnter
          containerStyle={staggeredEnterStyle.container}
          direction="up"
          initialDelay={100}
          speed="normal"
          staggerDelay={60}
        >
          <HomeStatusBanners
            isOnline={controller.isOnline}
            completionSync={controller.completionSync as CompletionSyncState}
            loadError={controller.loadError}
            onRetry={controller.retryAll}
          />

          <HomeSectionBoundary sectionName="Hero Action">
            <HomeExperiencePrelude model={homeExperience} />
            <HomeHeroSection controller={controller} />
          </HomeSectionBoundary>

          {showCompanion ? (
            <HomeCompanionSection
              currentStreakDays={controller.currentStreak}
              features={features}
              highFocusStreak={controller.currentStreak}
              isOnline={controller.isOnline}
              onAction={() => controller.openSetup()}
              onPress={openCompanion}
              onRetry={() => controller.retryAll()}
              totalSessions={controller.disclosure.inputs.totalCompletedSessions}
              userId={controller.userId}
            />
          ) : null}

          {showStreak ? (
            <HomeStreakProgress
              currentDays={controller.currentStreak}
              hoursRemaining={streakHoursRemaining}
              riskLevel={(controller.streakQuery.data as Record<string, unknown> | undefined)?.riskLevel as 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined}
              longestStreak={(controller.streakQuery.data as Record<string, unknown> | undefined)?.longestDays as number | undefined}
              isLoading={controller.streakQuery.isLoading}
              userId={controller.userId ?? undefined}
            />
          ) : null}

          {showWeeklyQuest ? (
            <HomeWeeklyQuest
              features={features}
              onPress={openChallenges}
              onOpenSetup={() => controller.openSetup()}
              userId={controller.userId ?? ''}
            />
          ) : null}

          {showAtRiskBanner && (
            <AtRiskBanner
              hoursRemaining={streakHoursRemaining}
              currentStreak={controller.currentStreak}
              onStartSession={() => controller.openSetup()}
              isLoading={controller.streakQuery.isLoading}
            />
          )}

          {showLowerContent ? (
            <HomeContentLower
              controller={controller}
              data={data}
              missionInput={missionInput}
              handleClaimReward={handleClaimReward}
              streakHoursRemaining={streakHoursRemaining}
              features={features}
              comebackSessionsCompleted={comebackSessionsCompleted}
              surfaceMap={surfaceMap}
            />
          ) : null}
        </StaggeredEnter>
      )}
    </HomeMissionInput>
  );
};
