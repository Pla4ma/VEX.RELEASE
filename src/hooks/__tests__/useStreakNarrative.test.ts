import { useStreakNarrative } from '../useStreakNarrative';

describe('useStreakNarrative', () => {
  describe('narrative', () => {
    it('returns a streak narrative with title and message', () => {
      const result = useStreakNarrative({
        streakDays: 5,
        maxStreak: 10,
        totalSessions: 20,
        hoursSinceLastSession: 6,
        comebackTokens: 1,
        _hasInsurance: false,
      });
      expect(result.narrative).toBeDefined();
      expect(result.narrative.title).toBe('Keep Going!');
      expect(result.narrative.message).toBe('Your streak is building momentum.');
      expect(result.narrative.type).toBe('motivational');
    });
  });

  describe('riskWarning', () => {
    it('returns null when streak is less than 3 days', () => {
      const result = useStreakNarrative({
        streakDays: 2,
        maxStreak: 10,
        totalSessions: 5,
        hoursSinceLastSession: 20,
        comebackTokens: 0,
        _hasInsurance: false,
      });
      expect(result.riskWarning).toBeNull();
    });

    it('returns null when hours since last session is under 18', () => {
      const result = useStreakNarrative({
        streakDays: 5,
        maxStreak: 10,
        totalSessions: 20,
        hoursSinceLastSession: 12,
        comebackTokens: 0,
        _hasInsurance: false,
      });
      expect(result.riskWarning).toBeNull();
    });

    it('shows warning when hours > 20 and streak >= 3', () => {
      const result = useStreakNarrative({
        streakDays: 5,
        maxStreak: 10,
        totalSessions: 20,
        hoursSinceLastSession: 22,
        comebackTokens: 0,
        _hasInsurance: false,
      });
      expect(result.riskWarning).not.toBeNull();
      expect(result.riskWarning!.show).toBe(true);
      expect(result.riskWarning!.urgency).toBe('MEDIUM');
      expect(result.riskWarning!.headline).toBe('Streak at Risk');
      expect(result.riskWarning!.callToAction).toBe('Keep your streak going!');
    });
  });

  describe('breakRecovery', () => {
    it('returns null when streak is active', () => {
      const result = useStreakNarrative({
        streakDays: 5,
        maxStreak: 10,
        totalSessions: 20,
        hoursSinceLastSession: 6,
        comebackTokens: 0,
        _hasInsurance: false,
      });
      expect(result.breakRecovery).toBeNull();
    });

    it('returns recovery message when streak is 0 and maxStreak > 0', () => {
      const result = useStreakNarrative({
        streakDays: 0,
        maxStreak: 10,
        totalSessions: 20,
        hoursSinceLastSession: 48,
        comebackTokens: 1,
        _hasInsurance: false,
      });
      expect(result.breakRecovery).not.toBeNull();
      expect(result.breakRecovery!.title).toBe('Welcome Back!');
      expect(result.breakRecovery!.type).toBe('recovery');
    });

    it('returns null when both streak and maxStreak are 0', () => {
      const result = useStreakNarrative({
        streakDays: 0,
        maxStreak: 0,
        totalSessions: 0,
        hoursSinceLastSession: 999,
        comebackTokens: 0,
        _hasInsurance: false,
      });
      expect(result.breakRecovery).toBeNull();
    });
  });
});
