import {
  isRescueEligible,
  makePlan,
  shouldSendRescuePush,
  buildRescuePushPayload,
} from './helpers';

describe('rescue mode — edge cases', () => {
  it('ignores user with completedSessions > 0 but no trigger', () => {
    const result = isRescueEligible({
      userId: 'u1',
      lane: 'student',
      completedSessions: 1,
      daysSinceOnboarding: 1,
      abandonedSessionExists: false,
      missedPlannedSession: false,
      recentDismissals: 0,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: false,
      now: 100,
    });
    expect(result.eligible).toBe(false);
  });

  it('hides rescue when streak at risk but hours too high', () => {
    const result = isRescueEligible({
      userId: 'u1',
      lane: 'student',
      completedSessions: 5,
      daysSinceOnboarding: 5,
      abandonedSessionExists: false,
      missedPlannedSession: false,
      recentDismissals: 0,
      streakAtRisk: true,
      hoursUntilStreakBreak: 10,
      hasActiveSession: false,
      now: 100,
    });
    expect(result.eligible).toBe(false);
  });
});

describe('rescue mode — push eligibility', () => {
  it('allows push when eligible and under budget', () => {
    const eligibility = isRescueEligible({
      userId: 'u1', lane: 'student', completedSessions: 3, daysSinceOnboarding: 2,
      abandonedSessionExists: true, missedPlannedSession: false, recentDismissals: 0,
      streakAtRisk: false, hoursUntilStreakBreak: 24, hasActiveSession: false, now: 100,
    });
    const result = shouldSendRescuePush({
      eligibility, userMuted: false, quietHoursActive: false,
      budgetRemaining: 1, sentToday: 0, maxDaily: 2,
    });
    expect(result).toBe(true);
  });

  it('blocks push when user muted', () => {
    const eligibility = isRescueEligible({
      userId: 'u1', lane: 'student', completedSessions: 3, daysSinceOnboarding: 2,
      abandonedSessionExists: true, missedPlannedSession: false, recentDismissals: 0,
      streakAtRisk: false, hoursUntilStreakBreak: 24, hasActiveSession: false, now: 100,
    });
    const result = shouldSendRescuePush({
      eligibility, userMuted: true, quietHoursActive: false,
      budgetRemaining: 1, sentToday: 0, maxDaily: 2,
    });
    expect(result).toBe(false);
  });

  it('blocks push during quiet hours', () => {
    const eligibility = isRescueEligible({
      userId: 'u1', lane: 'student', completedSessions: 3, daysSinceOnboarding: 2,
      abandonedSessionExists: true, missedPlannedSession: false, recentDismissals: 0,
      streakAtRisk: false, hoursUntilStreakBreak: 24, hasActiveSession: false, now: 100,
    });
    const result = shouldSendRescuePush({
      eligibility, userMuted: false, quietHoursActive: true,
      budgetRemaining: 1, sentToday: 0, maxDaily: 2,
    });
    expect(result).toBe(false);
  });

  it('blocks push at budget limit', () => {
    const eligibility = isRescueEligible({
      userId: 'u1', lane: 'student', completedSessions: 3, daysSinceOnboarding: 2,
      abandonedSessionExists: true, missedPlannedSession: false, recentDismissals: 0,
      streakAtRisk: false, hoursUntilStreakBreak: 24, hasActiveSession: false, now: 100,
    });
    const result = shouldSendRescuePush({
      eligibility, userMuted: false, quietHoursActive: false,
      budgetRemaining: 0, sentToday: 2, maxDaily: 2,
    });
    expect(result).toBe(false);
  });

  it('generates push payload with lane-specific copy', () => {
    const plan = makePlan({ lane: 'game_like', reason: 'too_big' });
    const payload = buildRescuePushPayload(plan);
    expect(payload.title).toContain('recovery ready');
    expect(payload.body.length).toBeGreaterThan(0);
  });
});
