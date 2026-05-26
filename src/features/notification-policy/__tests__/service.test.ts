import {
  NudgeDecisionSchema,
  NudgeSignalRecordSchema,
} from '../schemas';
import {
  buildRescueDeepLink,
  decideNudge,
  isRescueDeepLinkValid,
  markExpiredAsIgnored,
} from '../service';
import { checkNotificationBudget } from '../notification-policy-bridge';

describe('notification policy — budget rules', () => {
  // 1. Day 0 no unsolicited notification
  it('blocks unsolicited Day 0 nudges', () => {
    const decision = decideNudge({ lane: 'student', completedSessions: 0, daysSinceOnboarding: 0 });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('Day 0');
  });

  // 2. Minimal max 1/day
  it('enforces minimal lane max 1/day', () => {
    const atLimit = decideNudge({ lane: 'minimal_normal', completedSessions: 3, daysSinceOnboarding: 2, sentToday: 1 });
    expect(atLimit.allowed).toBe(false);
    expect(atLimit.budgetRemaining).toBe(0);

    const underLimit = decideNudge({ lane: 'minimal_normal', completedSessions: 3, daysSinceOnboarding: 2, sentToday: 0 });
    expect(underLimit.allowed).toBe(true);
    expect(underLimit.budgetRemaining).toBe(1);
  });

  // 3. Normal max 2/day
  it('enforces normal lane max 2/day', () => {
    const atLimit = decideNudge({ lane: 'student', completedSessions: 3, daysSinceOnboarding: 2, sentToday: 2 });
    expect(atLimit.allowed).toBe(false);
    expect(atLimit.budgetRemaining).toBe(0);

    const underLimit = decideNudge({ lane: 'game_like', completedSessions: 4, daysSinceOnboarding: 3, sentToday: 1 });
    expect(underLimit.allowed).toBe(true);
    expect(underLimit.budgetRemaining).toBe(1);
  });

  // 4. Dismissal lowers priority
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

  // 5. Quiet hours block notifications
  it('blocks quiet hours', () => {
    const blocked = decideNudge({
      lane: 'game_like', completedSessions: 4, daysSinceOnboarding: 3, quietHoursActive: true,
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toContain('Quiet hours');
  });

  // 6. Lane copy differs
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

  // 7. Rescue deep link safe
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

  // 8. Opt-out wins
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

  // 9. Repeated dismissals (3+) pause category
  it('pauses category on 3+ dismissals', () => {
    const paused = decideNudge({
      lane: 'student', completedSessions: 5, daysSinceOnboarding: 7, recentDismissals: 3,
    });
    expect(paused.allowed).toBe(false);
    expect(paused.reason).toContain('category paused');
  });

  // 10. pausedCategories in input blocks lane
  it('blocks nudges for paused category lane', () => {
    const blocked = decideNudge({
      lane: 'student', completedSessions: 5, daysSinceOnboarding: 7, pausedCategories: ['study'],
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toContain('budget');
  });
});

describe('notification policy — signal recording', () => {
  it('validates sent signal', () => {
    const signal = { userId: 'abc', nudgeType: 'gentle_return', signal: 'sent', lane: 'student', occurredAt: Date.now() };
    expect(() => NudgeSignalRecordSchema.parse(signal)).not.toThrow();
  });

  it('validates opened signal', () => {
    const signal = { userId: 'def', nudgeType: 'rescue', signal: 'opened', lane: 'minimal_normal', occurredAt: Date.now() };
    expect(() => NudgeSignalRecordSchema.parse(signal)).not.toThrow();
  });

  it('validates dismissed signal', () => {
    const signal = { userId: 'ghi', nudgeType: 'study_deadline', signal: 'dismissed', lane: 'student', occurredAt: Date.now() };
    expect(() => NudgeSignalRecordSchema.parse(signal)).not.toThrow();
  });

  it('validates ignored signal', () => {
    const signal = { userId: 'jkl', nudgeType: 'project_resume', signal: 'ignored', lane: 'deep_creative', occurredAt: Date.now() };
    expect(() => NudgeSignalRecordSchema.parse(signal)).not.toThrow();
  });

  it('validates rescue_started signal', () => {
    const signal = { userId: 'mno', nudgeType: 'rescue', signal: 'rescue_started', lane: 'minimal_normal', occurredAt: Date.now() };
    expect(() => NudgeSignalRecordSchema.parse(signal)).not.toThrow();
  });

  it('validates session_completed signal', () => {
    const signal = { userId: 'pqr', nudgeType: 'gentle_return', signal: 'session_completed', lane: 'game_like', occurredAt: Date.now() };
    expect(() => NudgeSignalRecordSchema.parse(signal)).not.toThrow();
  });

  it('rejects invalid signal type', () => {
    const signal = { userId: 'stu', nudgeType: 'none', signal: 'clicked', lane: 'student', occurredAt: Date.now() };
    expect(() => NudgeSignalRecordSchema.parse(signal)).toThrow();
  });
});

describe('notification policy — deep link validation', () => {
  it('builds valid rescue deep link', () => {
    const link = buildRescueDeepLink('plan-1', 'Review notes', 600);
    expect(link.type).toBe('start_rescue');
    expect(link.payload.rescuePlanId).toBe('plan-1');
    expect(link.payload.suggestedDurationSeconds).toBe(600);
  });

  it('validates correct rescue deep link', () => {
    const link = buildRescueDeepLink('plan-2', 'Do 5 min', 300);
    expect(isRescueDeepLinkValid(link)).toBe(true);
  });

  it('rejects invalid deep link shapes', () => {
    expect(isRescueDeepLinkValid(null)).toBe(false);
    expect(isRescueDeepLinkValid(undefined)).toBe(false);
    expect(isRescueDeepLinkValid({})).toBe(false);
    expect(isRescueDeepLinkValid({ type: 'wrong' })).toBe(false);
    expect(isRescueDeepLinkValid({ type: 'start_rescue' })).toBe(false);
    expect(isRescueDeepLinkValid({ type: 'start_rescue', payload: null })).toBe(false);
  });
});

describe('notification policy — ignored tracking', () => {
  it('marks expired sent record as ignored after 30 min', () => {
    const result = markExpiredAsIgnored('user-1', 'student', Date.now() - 31 * 60 * 1000);
    expect(result).toHaveLength(1);
    expect(result[0].signal).toBe('ignored');
    expect(result[0].userId).toBe('user-1');
    expect(result[0].lane).toBe('student');
  });

  it('does not mark recent sent record as ignored', () => {
    const result = markExpiredAsIgnored('user-2', 'game_like', Date.now());
    expect(result).toHaveLength(0);
  });

  it('marks expired signals from record array as ignored', () => {
    const records = [
      { userId: 'u3', nudgeType: 'gentle_return' as const, signal: 'sent' as const, lane: 'student' as const, occurredAt: Date.now() - 40 * 60 * 1000 },
      { userId: 'u3', nudgeType: 'gentle_return' as const, signal: 'sent' as const, lane: 'student' as const, occurredAt: Date.now() - 5 * 60 * 1000 },
    ];
    const result = markExpiredAsIgnored('u3', 'student', records);
    expect(result).toHaveLength(1);
    expect(result[0].signal).toBe('ignored');
  });
});

describe('notification policy — bridge (SmartNotificationSystem integration)', () => {
  it('blocks at budget limit', () => {
    const result = checkNotificationBudget({
      userId: 'bridge-1',
      lane: 'student',
      completedSessions: 5,
      daysSinceOnboarding: 3,
      quietHoursActive: false,
      userMuted: false,
      context: 'none',
      sentToday: 2,
    });
    expect(result.blocked).toBe(true);
    expect(result.budgetRemaining).toBe(0);
  });

  it('allows under budget', () => {
    const result = checkNotificationBudget({
      userId: 'bridge-2',
      lane: 'student',
      completedSessions: 5,
      daysSinceOnboarding: 3,
      quietHoursActive: false,
      userMuted: false,
      context: 'none',
      sentToday: 1,
    });
    expect(result.blocked).toBe(false);
    expect(result.budgetRemaining).toBe(1);
  });

  it('blocks during quiet hours', () => {
    const result = checkNotificationBudget({
      userId: 'bridge-3',
      lane: 'game_like',
      completedSessions: 4,
      daysSinceOnboarding: 3,
      quietHoursActive: true,
      userMuted: false,
      context: 'none',
      sentToday: 0,
    });
    expect(result.blocked).toBe(true);
    expect(result.reason).toContain('Quiet hours');
  });

  it('blocks when user muted', () => {
    const result = checkNotificationBudget({
      userId: 'bridge-4',
      lane: 'deep_creative',
      completedSessions: 5,
      daysSinceOnboarding: 4,
      quietHoursActive: false,
      userMuted: true,
      context: 'none',
      sentToday: 0,
    });
    expect(result.blocked).toBe(true);
    expect(result.reason).toContain('mute');
  });

  it('allows rescue despite dismissals', () => {
    const result = checkNotificationBudget({
      userId: 'bridge-5',
      lane: 'game_like',
      completedSessions: 4,
      daysSinceOnboarding: 3,
      quietHoursActive: false,
      userMuted: false,
      context: 'avoidance',
      sentToday: 0,
    });
    expect(result.blocked).toBe(false);
    expect(result.decision.type).toBe('rescue');
  });
});
