import { NudgeDecisionSchema } from '../schemas';
import { checkNotificationBudget } from '../notification-policy-bridge';

describe('notification policy — bridge', () => {
  describe('notification-policy-bridge', () => {
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

    it('blocks when user muted', () => {
      const result = checkNotificationBudget({
        userId: 'bridge-3',
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

    it('returns maxDaily correctly per lane', () => {
      const minimal = checkNotificationBudget({
        userId: 'bridge-4',
        lane: 'minimal_normal',
        completedSessions: 1,
        daysSinceOnboarding: 1,
        quietHoursActive: false,
        userMuted: false,
        context: 'none',
        sentToday: 0,
      });
      expect(minimal.maxDaily).toBe(1);

      const student = checkNotificationBudget({
        userId: 'bridge-5',
        lane: 'student',
        completedSessions: 2,
        daysSinceOnboarding: 2,
        quietHoursActive: false,
        userMuted: false,
        context: 'none',
        sentToday: 0,
      });
      expect(student.maxDaily).toBe(2);
    });

    it('returns valid NudgeDecision in result', () => {
      const result = checkNotificationBudget({
        userId: 'bridge-6',
        lane: 'game_like',
        completedSessions: 4,
        daysSinceOnboarding: 3,
        quietHoursActive: false,
        userMuted: false,
        context: 'avoidance',
        sentToday: 0,
      });
      expect(() => NudgeDecisionSchema.parse(result.decision)).not.toThrow();
    });
  });
});
