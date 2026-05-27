import { pickHomePrimaryPriority, createSnapshot } from './priority-selection.helpers';

describe('pickHomePrimaryPriority', () => {
  it('lets a critical streak beat every other action', () => {
    const priority = pickHomePrimaryPriority(
      createSnapshot({
        boss: {
          hasActiveEncounter: true,
          healthRemaining: 20,
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
          suggestedMode: 'FOCUS',
        },
        streak: {
          currentDays: 12,
          hoursRemaining: 1,
          isAtRisk: true,
          isComeback: false,
        },
      }),
    );

    expect(priority.type).toBe('STREAK_CRITICAL');
  });

  it('lets a companion promise beat a recommended session', () => {
    const priority = pickHomePrimaryPriority(
      createSnapshot({
        companionPromise: {
          kind: 'pending',
          targetDurationMinutes: 25,
          targetMode: 'FOCUS',
        },
        recommendation: {
          hasActive: true,
          id: 'rec-1',
          suggestedDurationSeconds: 1500,
          suggestedMode: 'FOCUS',
        },
      }),
    );

    expect(priority.type).toBe('COMPANION_PROMISE');
  });

  it('lets promise recovery beat normal streak risk', () => {
    const priority = pickHomePrimaryPriority(
      createSnapshot({
        companionPromise: {
          kind: 'missed',
          targetDurationMinutes: 10,
          targetMode: 'RECOVERY',
        },
        streak: {
          currentDays: 9,
          hoursRemaining: 6,
          isAtRisk: true,
          isComeback: false,
        },
      }),
    );

    expect(priority.type).toBe('PROMISE_RECOVERY');
  });

  it('lets streak risk beat a near-done challenge', () => {
    const priority = pickHomePrimaryPriority(
      createSnapshot({
        challenge: {
          id: 'challenge-1',
          isNearDone: true,
          progressPercent: 72,
          title: 'Finish challenge',
        },
        streak: {
          currentDays: 7,
          hoursRemaining: 5,
          isAtRisk: true,
          isComeback: false,
        },
      }),
    );

    expect(priority.type).toBe('STREAK_AT_RISK');
  });

  it('lets a recommendation beat an active boss', () => {
    const priority = pickHomePrimaryPriority(
      createSnapshot({
        boss: {
          hasActiveEncounter: true,
          healthRemaining: 60,
          isFinalStrike: false,
          maxHealth: 100,
        },
        recommendation: {
          hasActive: true,
          id: 'rec-1',
          suggestedDurationSeconds: 1500,
          suggestedMode: 'FOCUS',
        },
      }),
    );

    expect(priority.type).toBe('RECOMMENDED_SESSION');
  });

  it('lets a near-done challenge beat an active boss', () => {
    const priority = pickHomePrimaryPriority(
      createSnapshot({
        boss: {
          hasActiveEncounter: true,
          healthRemaining: 60,
          isFinalStrike: false,
          maxHealth: 100,
        },
        challenge: {
          id: 'challenge-1',
          isNearDone: true,
          progressPercent: 90,
          title: 'Finish challenge',
        },
      }),
    );

    expect(priority.type).toBe('CHALLENGE_NEAR_DONE');
  });

  it('falls back to the default session when no higher signal exists', () => {
    const priority = pickHomePrimaryPriority(createSnapshot());

    expect(priority.type).toBe('DEFAULT_SESSION');
    expect(priority.cta.text).toBe('Start Focus');
  });
});
