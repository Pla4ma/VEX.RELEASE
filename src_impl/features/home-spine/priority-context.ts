import {
  HomeContextSnapshotSchema,
  type HomeContextSnapshot,
} from './priority-schemas';
import type { Streak } from '../streaks/schemas';

function calculateStreakAtRisk(streak: Streak): boolean {
  if (!streak.lastQualifyingSessionAt) {
    return false;
  }
  const hoursSinceLastSession =
    (Date.now() - new Date(streak.lastQualifyingSessionAt).getTime()) / (1000 * 60 * 60);
  return hoursSinceLastSession > 20 && streak.shieldsAvailable === 0;
}

function calculateHoursRemaining(streak: Streak): number {
  if (!streak.lastQualifyingSessionAt) {
    return 24;
  }
  const nextDeadline = new Date(streak.lastQualifyingSessionAt).getTime() + 24 * 60 * 60 * 1000;
  return Math.floor(Math.max(0, (nextDeadline - Date.now()) / (1000 * 60 * 60)));
}

export async function buildHomeContextSnapshot(userId: string): Promise<HomeContextSnapshot> {
  const [{ onboardingRepository }, { fetchStreak }, { fetchActiveEncounter }] = await Promise.all([
    import('../onboarding/repository'),
    import('../streaks/repository'),
    import('../boss/repository'),
  ]);

  const [progressState, streak, bossEncounter] = await Promise.all([
    onboardingRepository.getProgress(userId),
    fetchStreak(userId).catch((): null => null),
    fetchActiveEncounter(userId).catch((): null => null),
  ]);

  return HomeContextSnapshotSchema.parse({
    boss: {
      hasActiveEncounter: bossEncounter?.status === 'ACTIVE',
      healthRemaining: bossEncounter?.healthRemaining,
      isFinalStrike: bossEncounter
        ? bossEncounter.healthRemaining / bossEncounter.maxHealth < 0.2
        : false,
      maxHealth: bossEncounter?.maxHealth,
    },
    coach: {
      hasIntervention: false,
      hoursRemaining: undefined,
      interventionType: undefined,
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
    streak: {
      currentDays: streak?.currentDays ?? 0,
      hoursRemaining: streak ? calculateHoursRemaining(streak) : undefined,
      isAtRisk: streak ? calculateStreakAtRisk(streak) : false,
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
