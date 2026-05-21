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
import { HomeCompanionWidget } from './HomeCompanionWidget';
import { useHomeCompanion } from '../hooks/useHomeCompanion';
import { HomeSectionBoundary } from './HomeSectionBoundary';
import { HomeHeroSection } from './HomeHeroSection';
import { HomeStreakProgress } from './HomeStreakProgress';
import { HomeWeeklyQuest } from './HomeWeeklyQuest';
import { useCompanionPromise } from '../../../features/companion-promise/hooks';
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
}

export const HomeContent: React.FC<HomeContentProps> = ({
  controller,
  data,
  handleClaimReward,
  streakHoursRemaining,
  features,
  comebackSessionsCompleted,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const companionStatus = useHomeCompanion(controller.userId, controller.isOnline);
  const companionPromise = useCompanionPromise();
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
  const showCompanionContext = companionPromise.data.kind !== 'pending'
    && companionPromise.data.kind !== 'missed';

  const weeklyQuestAvailability = getFeatureAvailability(features.challenges);

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
            <HomeHeroSection controller={controller} />
          </HomeSectionBoundary>

          {controller.disclosure.features.companion_detail.isUnlocked && showCompanionContext ? (
            <HomeSectionBoundary sectionName="Companion">
              <HomeCompanionWidget
                status={companionStatus}
                onRetry={() => controller.retryAll()}
                onPress={openCompanion}
              />
            </HomeSectionBoundary>
          ) : null}

          <HomeStreakProgress
            currentDays={controller.currentStreak}
            hoursRemaining={streakHoursRemaining}
            riskLevel={(controller.streakQuery.data as Record<string, unknown> | undefined)?.riskLevel as 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined}
            longestStreak={(controller.streakQuery.data as Record<string, unknown> | undefined)?.longestDays as number | undefined}
            isLoading={controller.streakQuery.isLoading}
            userId={controller.userId ?? undefined}
          />

          {controller.shouldShowSecondarySystems && weeklyQuestAvailability.canRenderEntryPoint ? (
            <HomeWeeklyQuest
              features={features}
              onPress={openChallenges}
              onOpenSetup={() => controller.openSetup()}
              userId={controller.userId ?? ''}
            />
          ) : null}

          {streakHoursRemaining !== null && streakHoursRemaining <= 4 && (
            <AtRiskBanner
              hoursRemaining={streakHoursRemaining}
              currentStreak={controller.currentStreak}
              onStartSession={() => controller.openSetup()}
              isLoading={controller.streakQuery.isLoading}
            />
          )}

          <HomeContentLower
            controller={controller}
            data={data}
            missionInput={missionInput}
            handleClaimReward={handleClaimReward}
            streakHoursRemaining={streakHoursRemaining}
            features={features}
            comebackSessionsCompleted={comebackSessionsCompleted}
          />
        </StaggeredEnter>
      )}
    </HomeMissionInput>
  );
};
