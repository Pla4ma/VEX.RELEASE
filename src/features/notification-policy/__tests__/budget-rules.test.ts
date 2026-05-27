import { decideNudge } from './helpers';
import { NudgeDecisionSchema } from './helpers';

describe('notification policy — budget rules', () => {
  it('blocks unsolicited Day 0 nudges', () => {
    const decision = decideNudge({ lane: 'student', completedSessions: 0, daysSinceOnboarding: 0 });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('Day 0');
  });

  it('enforces minimal lane max 1/day', () => {
    const atLimit = decideNudge({ lane: 'minimal_normal', completedSessions: 3, daysSinceOnboarding: 2, sentToday: 1 });
    expect(atLimit.allowed).toBe(false);
    expect(atLimit.budgetRemaining).toBe(0);

    const underLimit = decideNudge({ lane: 'minimal_normal', completedSessions: 3, daysSinceOnboarding: 2, sentToday: 0 });
    expect(underLimit.allowed).toBe(true);
    expect(underLimit.budgetRemaining).toBe(1);
  });

  it('enforces normal lane max 2/day', () => {
    const atLimit = decideNudge({ lane: 'student', completedSessions: 3, daysSinceOnboarding: 2, sentToday: 2 });
    expect(atLimit.allowed).toBe(false);
    expect(atLimit.budgetRemaining).toBe(0);

    const underLimit = decideNudge({ lane: 'game_like', completedSessions: 4, daysSinceOnboarding: 3, sentToday: 1 });
    expect(underLimit.allowed).toBe(true);
    expect(underLimit.budgetRemaining).toBe(1);
  });

  it('blocks nudges when recentDismissals >= 2 except rescue', () => {
    const blocked = decideNudge({
      lane: 'deep_creative', completedSessions: 4, daysSinceOnboarding: 3, recentDismissals: 2,
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toContain('suppress');

    const rescue = decideNudge({
      lane: 'deep_creative', completedSessions: 4, daysSinceOnboarding: 3,
      recentDismissals: 2, context: 'avoidance',
    });
    expect(rescue.allowed).toBe(true);
    expect(rescue.type).toBe('rescue');
  });

  it('blocks quiet hours', () => {
    const blocked = decideNudge({
      lane: 'game_like', completedSessions: 4, daysSinceOnboarding: 3, quietHoursActive: true,
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toContain('Quiet hours');
  });

  it('produces lane-specific copy', () => {
    const student = decideNudge({ lane: 'student', completedSessions: 2, daysSinceOnboarding: 2, context: 'deadline' });
    expect(student.body).toBe('Your next study block fits: 15 minutes on one topic.');

    const project = decideNudge({ lane: 'deep_creative', completedSessions: 4, daysSinceOnboarding: 3, context: 'project_stale' });
    expect(project.body).toBe('Your project thread is waiting at the next move.');

    const run = decideNudge({ lane: 'game_like', completedSessions: 5, daysSinceOnboarding: 4, context: 'run_open' });
    expect(run.body).toBe('One clean block is enough today.');

    const clean = decideNudge({ lane: 'minimal_normal', completedSessions: 1, daysSinceOnboarding: 1 });
    expect(clean.body).toBe('One clean block is enough today.');

    const rescue = decideNudge({ lane: 'minimal_normal', completedSessions: 2, daysSinceOnboarding: 2, context: 'avoidance' });
    expect(rescue.body).toBe('Recovery encounter ready: 10 clean minutes.');

    const generic = decideNudge({ lane: 'student', completedSessions: 2, daysSinceOnboarding: 2 });
    expect(generic.body).toBe('VEX has one useful next action ready.');
  });

  it('returns safe rescue nudge with required fields', () => {
    const rescue = decideNudge({ lane: 'minimal_normal', completedSessions: 2, daysSinceOnboarding: 2, context: 'avoidance' });
    expect(rescue.type).toBe('rescue');
    expect(rescue.allowed).toBe(true);
    expect(rescue.priority).toBe('high');
    expect(rescue.title).toBeTruthy();
    expect(rescue.body).toBeTruthy();
    expect(rescue.scheduledFor).toBeGreaterThan(0);
    expect(() => NudgeDecisionSchema.parse(rescue)).not.toThrow();
  });

  it('blocks all when userMuted', () => {
    const blocked = decideNudge({
      lane: 'student', completedSessions: 10, daysSinceOnboarding: 30, userMuted: true,
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toContain('User mute');

    const rescueMuted = decideNudge({
      lane: 'minimal_normal', completedSessions: 10, daysSinceOnboarding: 30,
      userMuted: true, context: 'avoidance',
    });
    expect(rescueMuted.allowed).toBe(false);
  });

  it('pauses category on 3+ dismissals', () => {
    const paused = decideNudge({
      lane: 'student', completedSessions: 5, daysSinceOnboarding: 7, recentDismissals: 3,
    });
    expect(paused.allowed).toBe(false);
    expect(paused.reason).toContain('category paused');
  });

  it('blocks nudges for paused category lane', () => {
    const blocked = decideNudge({
      lane: 'student', completedSessions: 5, daysSinceOnboarding: 7, pausedCategories: ['study'],
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toContain('budget');
  });
});
