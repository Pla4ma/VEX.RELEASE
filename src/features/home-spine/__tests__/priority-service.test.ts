import { buildProgress, buildSecondaryActions, buildStakes } from '../priority-builders';
import { checkDefaultSession, checkStreakCritical, getPriorityCandidates } from '../priority-checkers';
import type { HomeContextSnapshot } from '../priority-schemas';

function createSnapshot(
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

describe('home priority builders', () => {
  it('builds daily progress and streak stakes for a streak-critical state', () => {
    const snapshot = createSnapshot({
      streak: {
        currentDays: 7,
        hoursRemaining: 1,
        isAtRisk: true,
        isComeback: false,
      },
    });
    const primary = checkStreakCritical(snapshot);

    expect(primary).not.toBeNull();
    if (!primary) {
      return;
    }

    expect(buildProgress(snapshot)).toEqual({
      dailyGoalMinutes: 60,
      streakDays: 7,
      todayMinutes: 15,
    });
    expect(buildStakes(primary, snapshot)).toEqual({
      atRisk: 'Your streak resets if today ends cold.',
      potentialGain: 'You keep the thread alive with one clean session.',
      what: '7-day streak',
    });
  });

  it('keeps secondary actions capped and in the same order as priority selection', () => {
    const snapshot = createSnapshot({
      boss: {
        hasActiveEncounter: true,
        healthRemaining: 40,
        isFinalStrike: false,
        maxHealth: 100,
      },
      challenge: {
        id: 'challenge-1',
        isNearDone: true,
        progressPercent: 80,
        title: 'Finish today',
      },
      companionPromise: {
        kind: 'pending',
        targetDurationMinutes: 20,
        targetMode: 'FOCUS',
      },
      recommendation: {
        hasActive: true,
        id: 'rec-1',
        suggestedDurationSeconds: 1800,
        suggestedMode: undefined,
      },
      streak: {
        currentDays: 8,
        hoursRemaining: 1,
        isAtRisk: true,
        isComeback: false,
      },
    });

    expect(buildSecondaryActions(getPriorityCandidates(snapshot)).map((action) => action.type)).toEqual([
      'promise',
      'streak',
      'recommendation',
    ]);
  });

  it('uses the default session when no higher signal exists', () => {
    const priority = checkDefaultSession(createSnapshot());

    expect(priority.type).toBe('DEFAULT_SESSION');
    expect(priority.cta.text).toBe('Start Focus');
    expect(priority.cta.action).toBe('OPEN_SESSION_SETUP');
  });
});
