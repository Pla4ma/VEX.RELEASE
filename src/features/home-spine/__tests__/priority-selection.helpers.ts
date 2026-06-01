import { pickHomePrimaryPriority } from '../priority-service';
import type { HomeContextSnapshot } from '../priority-schemas';

export { pickHomePrimaryPriority };

export function createSnapshot(
  overrides: Partial<HomeContextSnapshot> = {},
): HomeContextSnapshot {
  return {
    boss: {
      hasActiveEncounter: false,
      healthRemaining: undefined,
      isFinalStrike: false,
      maxHealth: undefined,
    },
    challenge: {
      id: undefined,
      isNearDone: false,
      progressPercent: 0,
      title: undefined,
    },
    coach: {
      hasIntervention: false,
      hoursRemaining: undefined,
      interventionType: undefined,
    },
    companionPromise: {
      kind: 'hidden',
      targetDurationMinutes: undefined,
      targetMode: undefined,
    },
    daily: {
      goalMinutes: 60,
      minutesFocused: 15,
      sessionsCompleted: 1,
    },
    onboarding: {
      firstSessionCompleted: true,
      isComplete: true,
    },
    recommendation: {
      hasActive: false,
      id: undefined,
      suggestedDurationSeconds: undefined,
      suggestedMode: undefined,
    },
    streak: {
      currentDays: 5,
      hoursRemaining: 8,
      isAtRisk: false,
      isComeback: false,
    },
    studyPlan: {
      dueToday: false,
      hasActivePlan: false,
      itemsDue: 0,
    },
    timestamp: 1_700_000_000_000,
    userId: '11111111-1111-4111-8111-111111111111',
    ...overrides,
  };
}
