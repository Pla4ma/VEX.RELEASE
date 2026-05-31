import { decideNudge } from '../service';

describe('notification policy — budget rules', () => {
  describe('decideNudge — budget rules', () => {
    it('blocks unsolicited Day 0 nudges', () => {
      const decision = decideNudge({
        lane: 'student',
        completedSessions: 0,
        daysSinceOnboarding: 0,
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain('Day 0');
    });

    it('enforces minimal lane max 1/day', () => {
      const atLimit = decideNudge({
        lane: 'minimal_normal',
        completedSessions: 3,
        daysSinceOnboarding: 2,
        sentToday: 1,
      });
      expect(atLimit.allowed).toBe(false);
      expect(atLimit.budgetRemaining).toBe(0);

      const underLimit = decideNudge({
        lane: 'minimal_normal',
        completedSessions: 3,
        daysSinceOnboarding: 2,
        sentToday: 0,
      });
      expect(underLimit.allowed).toBe(true);
      expect(underLimit.budgetRemaining).toBe(1);
    });

    it('enforces non-minimal lane max 2/day', () => {
      const atLimit = decideNudge({
        lane: 'student',
        completedSessions: 3,
        daysSinceOnboarding: 2,
        sentToday: 2,
      });
      expect(atLimit.allowed).toBe(false);
      expect(atLimit.budgetRemaining).toBe(0);

      const underLimit = decideNudge({
        lane: 'game_like',
        completedSessions: 4,
        daysSinceOnboarding: 3,
        sentToday: 1,
      });
      expect(underLimit.allowed).toBe(true);
      expect(underLimit.budgetRemaining).toBe(1);
    });

    it('blocks all nudges when user is muted', () => {
      const blocked = decideNudge({
        lane: 'student',
        completedSessions: 10,
        daysSinceOnboarding: 30,
        userMuted: true,
      });
      expect(blocked.allowed).toBe(false);
      expect(blocked.reason).toContain('User mute');
    });

    it('blocks during quiet hours', () => {
      const blocked = decideNudge({
        lane: 'game_like',
        completedSessions: 4,
        daysSinceOnboarding: 3,
        quietHoursActive: true,
      });
      expect(blocked.allowed).toBe(false);
      expect(blocked.reason).toContain('Quiet hours');
    });

    it('blocks when recent dismissals >= 3 (category paused)', () => {
      const noon = new Date();
      noon.setHours(12, 0, 0, 0);
      const paused = decideNudge({
        lane: 'student',
        completedSessions: 5,
        daysSinceOnboarding: 7,
        recentDismissals: 3,
        now: noon.getTime(),
      });
      expect(paused.allowed).toBe(false);
      expect(paused.reason).toContain('category paused');
    });

    it('suppresses low-trust nudges at 2 dismissals but allows rescue', () => {
      const blocked = decideNudge({
        lane: 'deep_creative',
        completedSessions: 4,
        daysSinceOnboarding: 3,
        recentDismissals: 2,
      });
      expect(blocked.allowed).toBe(false);
      expect(blocked.reason).toContain('suppress');

      const rescue = decideNudge({
        lane: 'deep_creative',
        completedSessions: 4,
        daysSinceOnboarding: 3,
        recentDismissals: 2,
        context: 'avoidance',
      });
      expect(rescue.allowed).toBe(true);
      expect(rescue.type).toBe('rescue');
    });
  });

  describe('decideNudge — paused categories', () => {
    it('blocks nudges for paused category lane', () => {
      const blocked = decideNudge({
        lane: 'student',
        completedSessions: 5,
        daysSinceOnboarding: 7,
        pausedCategories: ['study'],
      });
      expect(blocked.allowed).toBe(false);
    });

    it('allows nudges for non-paused category', () => {
      const result = decideNudge({
        lane: 'student',
        completedSessions: 5,
        daysSinceOnboarding: 7,
        pausedCategories: ['run'],
      });
      expect(result.allowed).toBe(true);
    });
  });
});
