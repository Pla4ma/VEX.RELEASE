import { fetchActiveRecommendations } from '../ai-coach/repository/recommendations';
import { fetchActiveEncounter } from '../boss/repository';
import { fetchActiveChallengeDetails } from '../challenges/repository';
import { getHomePromiseState } from '../companion-promise/service';
import { onboardingRepository } from '../onboarding/repository/index';
import { fetchStreak } from '../streaks/repository';
import {
  getFeatureAvailability,
  isFeatureAvailableForQueries,
  type FeatureAccessMap,
} from '../liveops-config';
import {
  HomeContextSnapshotSchema,
  type HomeContextSnapshot,
} from './priority-schemas';

function getTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
}

function calculateHoursRemaining(lastQualifyingSessionAt: number | null | undefined): number | undefined {
  if (typeof lastQualifyingSessionAt !== 'number') {
    return undefined;
  }
  const hoursElapsed = (Date.now() - lastQualifyingSessionAt) / (1000 * 60 * 60);
  return Math.max(0, Math.floor(24 - hoursElapsed));
}

function calculateStreakAtRisk(lastQualifyingSessionAt: number | null | undefined): boolean {
  if (typeof lastQualifyingSessionAt !== 'number') {
    return false;
  }
  return (Date.now() - lastQualifyingSessionAt) / (1000 * 60 * 60) >= 18;
}

function findNearDoneChallenge(
  challenges: Awaited<ReturnType<typeof fetchActiveChallengeDetails>>,
): { id?: string; isNearDone: boolean; progressPercent: number; title?: string } {
  const match = challenges
    .filter((item) => item.challenge.type === 'DAILY')
    .map((item) => ({
      id: item.userChallenge.id,
      isNearDone:
        item.challenge.targetValue > 0 &&
        item.userChallenge.status === 'ACTIVE' &&
        (item.userChallenge.currentValue / item.challenge.targetValue) * 100 >= 70,
      progressPercent:
        item.challenge.targetValue > 0
          ? Math.min(100, (item.userChallenge.currentValue / item.challenge.targetValue) * 100)
          : 0,
      title: item.challenge.title,
    }))
    .filter((item) => item.isNearDone)
    .sort((left, right) => right.progressPercent - left.progressPercent)[0];

  return match ?? { isNearDone: false, progressPercent: 0 };
}

export async function buildHomeContextSnapshot(
  userId: string,
  featureAccess?: FeatureAccessMap,
): Promise<HomeContextSnapshot> {
  const timeZone = getTimeZone();
  const canQuery = (key: keyof FeatureAccessMap): boolean => {
    if (!featureAccess) { return true; }
    return isFeatureAvailableForQueries(getFeatureAvailability(featureAccess[key]));
  };
  const [
    progressState,
    streak,
    bossEncounter,
    promiseState,
    recommendations,
    activeChallenges,
  ] = await Promise.all([
    onboardingRepository.getProgress(userId),
    fetchStreak(userId).catch((): null => null),
    canQuery('boss_tab') ? fetchActiveEncounter(userId).catch((): null => null) : Promise.resolve(null),
    canQuery('companion_detail') ? getHomePromiseState(userId, true, timeZone).catch(() => ({
      kind: 'hidden' as const,
      showOfflineBanner: false,
    })) : Promise.resolve({ kind: 'hidden' as const, showOfflineBanner: false }),
    canQuery('ai_coach_advanced') ? fetchActiveRecommendations(userId, 1).catch(() => []) : Promise.resolve([]),
    canQuery('challenges') ? fetchActiveChallengeDetails(userId).catch(() => []) : Promise.resolve([]),
  ]);
  const activeRecommendation = recommendations.find(
    (recommendation) => recommendation.status === 'ACTIVE' && recommendation.expiresAt > Date.now(),
  );
  const nearDoneChallenge = findNearDoneChallenge(activeChallenges);

  return HomeContextSnapshotSchema.parse({
    boss: {
      hasActiveEncounter: bossEncounter?.status === 'ACTIVE',
      healthRemaining: bossEncounter?.healthRemaining,
      isFinalStrike: bossEncounter
        ? bossEncounter.healthRemaining / bossEncounter.maxHealth < 0.2
        : false,
      maxHealth: bossEncounter?.maxHealth,
    },
    challenge: nearDoneChallenge,
    coach: {
      hasIntervention: false,
      hoursRemaining: undefined,
      interventionType: undefined,
    },
    companionPromise: {
      kind: promiseState.kind,
      targetDurationMinutes: 'promise' in promiseState
        ? promiseState.promise.targetDurationMinutes
        : undefined,
      targetMode: 'promise' in promiseState ? promiseState.promise.targetMode : undefined,
    },
    daily: {
      goalMinutes: 60,
      minutesFocused: 0,
      sessionsCompleted: 0,
    },
    onboarding: {
      firstSessionCompleted: progressState?.steps.firstSessionCompleted ?? false,
      isComplete: progressState?.status === 'COMPLETED',
    },
    recommendation: {
      hasActive: Boolean(activeRecommendation),
      id: activeRecommendation?.id,
      suggestedDurationSeconds: activeRecommendation?.suggestedDuration,
      suggestedMode: undefined,
    },
    streak: {
      currentDays: streak?.currentDays ?? 0,
      hoursRemaining: calculateHoursRemaining(streak?.lastQualifyingSessionAt),
      isAtRisk: calculateStreakAtRisk(streak?.lastQualifyingSessionAt),
      isComeback: false,
    },
    studyPlan: {
      dueToday: false,
      hasActivePlan: false,
      itemsDue: 0,
    },
    timestamp: Date.now(),
    userId,
  });
}
