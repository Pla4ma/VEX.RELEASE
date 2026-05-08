import {
  checkBossFinalStrike,
  checkDailyGoal,
  checkFirstSession,
  checkStreakCritical,
  getPriorityCandidates,
} from '../priority-checkers';
import { buildProgress, buildSecondaryActions, buildStakes } from '../priority-builders';
import type { HomeContextSnapshot } from '../priority-schemas';

function createSnapshot(overrides: Partial<HomeContextSnapshot> = {}): HomeContextSnapshot {
  return {
    boss: {
      hasActiveEncounter: false,
      healthRemaining: undefined,
      isFinalStrike: false,
      maxHealth: undefined,
    },
    coach: {
      hasIntervention: false,
      hoursRemaining: undefined,
      interventionType: undefined,
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

describe('home priority checkers', () => {
  it('prioritizes first session before other daily work', () => {
    const snapshot = createSnapshot({
      onboarding: { firstSessionCompleted: false, isComplete: false },
    });

    expect(checkFirstSession(snapshot)?.type).toBe('FIRST_SESSION');
    expect(getPriorityCandidates(snapshot)[0]?.type).toBe('FIRST_SESSION');
  });

  it('raises critical streak urgency as the deadline approaches', () => {
    const snapshot = createSnapshot({
      streak: {
        currentDays: 12,
        hoursRemaining: 1,
        isAtRisk: true,
        isComeback: false,
      },
    });

    const priority = checkStreakCritical(snapshot);

    expect(priority?.type).toBe('STREAK_CRITICAL');
    expect(priority?.urgency).toBe(95);
    expect(priority?.cta.action).toBe('VIEW_STREAK');
  });

  it('surfaces boss final strike above normal daily goal work', () => {
    const snapshot = createSnapshot({
      boss: {
        hasActiveEncounter: true,
        healthRemaining: 100,
        isFinalStrike: true,
        maxHealth: 1000,
      },
    });

    expect(checkBossFinalStrike(snapshot)?.urgency).toBeGreaterThan(
      checkDailyGoal(snapshot)?.urgency ?? 0
    );
  });
});

describe('home priority builders', () => {
  it('builds daily progress and streak stakes for the selected priority', () => {
    const snapshot = createSnapshot({
      streak: {
        currentDays: 7,
        hoursRemaining: 2,
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
      atRisk: 'Streak reset to 0',
      potentialGain: 'Keep your momentum alive',
      what: '7-day streak',
    });
  });

  it('keeps secondary actions capped and ordered by sorted priority inputs', () => {
    const snapshot = createSnapshot({
      boss: {
        hasActiveEncounter: true,
        healthRemaining: 100,
        isFinalStrike: true,
        maxHealth: 1000,
      },
      coach: {
        hasIntervention: true,
        hoursRemaining: 3,
        interventionType: 'STREAK_AT_RISK',
      },
      streak: {
        currentDays: 8,
        hoursRemaining: 1,
        isAtRisk: true,
        isComeback: false,
      },
      studyPlan: {
        dueToday: true,
        hasActivePlan: true,
        itemsDue: 2,
      },
    });
    const sorted = getPriorityCandidates(snapshot).sort((a, b) => b.urgency - a.urgency);

    expect(buildSecondaryActions(sorted).map((action) => action.type)).toEqual([
      'boss',
      'study',
      'coach',
    ]);
  });
});
