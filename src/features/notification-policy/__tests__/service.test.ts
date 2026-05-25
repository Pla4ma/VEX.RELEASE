import { decideNudge } from '../service';

describe('notification policy', () => {
  it('blocks unsolicited Day 0 nudges', () => {
    const decision = decideNudge({ lane: 'student', completedSessions: 0, daysSinceOnboarding: 0 });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('Day 0');
  });

  it('enforces lane daily budgets', () => {
    const minimal = decideNudge({ lane: 'minimal_normal', completedSessions: 3, daysSinceOnboarding: 2, sentToday: 1 });
    expect(minimal.allowed).toBe(false);
    expect(minimal.budgetRemaining).toBe(0);

    const student = decideNudge({ lane: 'student', completedSessions: 3, daysSinceOnboarding: 2, sentToday: 1 });
    expect(student.allowed).toBe(true);
    expect(student.budgetRemaining).toBe(1);
  });

  it('blocks quiet hours and suppresses repeated dismissals', () => {
    expect(decideNudge({
      lane: 'game_like',
      completedSessions: 4,
      daysSinceOnboarding: 3,
      quietHoursActive: true,
    }).reason).toContain('Quiet hours');

    expect(decideNudge({
      lane: 'deep_creative',
      completedSessions: 4,
      daysSinceOnboarding: 3,
      recentDismissals: 2,
    }).allowed).toBe(false);
  });

  it('allows lane-specific rescue and deadline nudges', () => {
    const rescue = decideNudge({ lane: 'minimal_normal', completedSessions: 2, daysSinceOnboarding: 2, context: 'avoidance' });
    expect(rescue.type).toBe('rescue');
    expect(rescue.priority).toBe('high');

    const deadline = decideNudge({ lane: 'student', completedSessions: 2, daysSinceOnboarding: 2, context: 'deadline' });
    expect(deadline.type).toBe('study_deadline');
  });
});
