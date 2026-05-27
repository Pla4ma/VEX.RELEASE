import { isRescueEligible } from './helpers';

describe('rescue mode — eligibility', () => {
  it('is hidden on cold Day 0 (no completed sessions, daysSinceOnboarding=0)', () => {
    const result = isRescueEligible({
      userId: 'u1',
      lane: 'student',
      completedSessions: 0,
      daysSinceOnboarding: 0,
      abandonedSessionExists: false,
      missedPlannedSession: false,
      recentDismissals: 0,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: false,
      now: 100,
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('Day 0');
  });

  it('is visible after abandoned session', () => {
    const result = isRescueEligible({
      userId: 'u1',
      lane: 'student',
      completedSessions: 3,
      daysSinceOnboarding: 2,
      abandonedSessionExists: true,
      missedPlannedSession: false,
      recentDismissals: 0,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: false,
      now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe('abandoned_session');
  });

  it('is visible after missed planned session', () => {
    const result = isRescueEligible({
      userId: 'u1',
      lane: 'student',
      completedSessions: 2,
      daysSinceOnboarding: 3,
      abandonedSessionExists: false,
      missedPlannedSession: true,
      recentDismissals: 0,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: false,
      now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe('missed_planned');
  });

  it('is hidden when user has an active session', () => {
    const result = isRescueEligible({
      userId: 'u1',
      lane: 'student',
      completedSessions: 5,
      daysSinceOnboarding: 5,
      abandonedSessionExists: true,
      missedPlannedSession: false,
      recentDismissals: 0,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: true,
      now: 100,
    });
    expect(result.eligible).toBe(false);
  });

  it('is hidden for successful users with no friction evidence', () => {
    const result = isRescueEligible({
      userId: 'u1',
      lane: 'deep_creative',
      completedSessions: 10,
      daysSinceOnboarding: 5,
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

  it('is visible when streak is at risk', () => {
    const result = isRescueEligible({
      userId: 'u1',
      lane: 'game_like',
      completedSessions: 4,
      daysSinceOnboarding: 4,
      abandonedSessionExists: false,
      missedPlannedSession: false,
      recentDismissals: 0,
      streakAtRisk: true,
      hoursUntilStreakBreak: 3,
      hasActiveSession: false,
      now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe('streak_risk');
  });

  it('is visible after repeated dismissals (2 dismissals)', () => {
    const result = isRescueEligible({
      userId: 'u1',
      lane: 'minimal_normal',
      completedSessions: 3,
      daysSinceOnboarding: 2,
      abandonedSessionExists: false,
      missedPlannedSession: false,
      recentDismissals: 2,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: false,
      now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe('repeated_dismissals');
  });

  it('is visible for notification_dismissal_pattern (3+ dismissals)', () => {
    const result = isRescueEligible({
      userId: 'u1',
      lane: 'minimal_normal',
      completedSessions: 3,
      daysSinceOnboarding: 2,
      abandonedSessionExists: false,
      missedPlannedSession: false,
      recentDismissals: 5,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: false,
      now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe('notification_dismissal_pattern');
  });

  it('is visible when user reports too_big task', () => {
    const result = isRescueEligible({
      userId: 'u1',
      lane: 'deep_creative',
      completedSessions: 3,
      daysSinceOnboarding: 2,
      abandonedSessionExists: false,
      missedPlannedSession: false,
      recentDismissals: 0,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: false,
      userTooBig: true,
      now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe('user_too_big');
  });
});
