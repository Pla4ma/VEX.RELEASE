import {
  STREAK_STATES,
  STREAK_MILESTONES,
  determineStreakState,
  calculateHoursUntilStreakBreak,
} from '../StreakEvolutionSystem';

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn() },
}));

describe('StreakEvolutionSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('STREAK_STATES', () => {
    it('should have all required states', () => {
      expect(STREAK_STATES.ACTIVE).toBeDefined();
      expect(STREAK_STATES.AT_RISK).toBeDefined();
      expect(STREAK_STATES.BROKEN).toBeDefined();
      expect(STREAK_STATES.RECOVERING).toBeDefined();
      expect(STREAK_STATES.PROTECTED).toBeDefined();
    });

    it('should have valid thresholds for AT_RISK state', () => {
      expect(STREAK_STATES.AT_RISK.entryThreshold).toBe(20);
      expect(STREAK_STATES.AT_RISK.exitThreshold).toBe(4);
    });
  });

  describe('STREAK_MILESTONES', () => {
    it('should have milestones at expected days', () => {
      const days = STREAK_MILESTONES.map((m) => m.days);
      expect(days).toContain(3);
      expect(days).toContain(7);
      expect(days).toContain(14);
      expect(days).toContain(30);
      expect(days).toContain(100);
    });

    it('should have rewards for each milestone', () => {
      for (const milestone of STREAK_MILESTONES) {
        expect(milestone.rewards).toBeDefined();
        expect(milestone.rewards.length).toBeGreaterThan(0);
      }
    });

    it('should have appropriate titles', () => {
      const m3 = STREAK_MILESTONES.find((m) => m.days === 3);
      expect(m3?.title).toBe('First Steps');
      const m7 = STREAK_MILESTONES.find((m) => m.days === 7);
      expect(m7?.title).toBe('Week Warrior');
      const m30 = STREAK_MILESTONES.find((m) => m.days === 30);
      expect(m30?.title).toBe('Monthly Master');
    });
  });

  describe('determineStreakState', () => {
    it('should return PROTECTED when has insurance', () => {
      const state = determineStreakState(10, true, 20);
      expect(state).toBe('PROTECTED');
    });

    it('should return BROKEN when hoursRemaining is 0 or negative', () => {
      expect(determineStreakState(10, false, 0)).toBe('BROKEN');
      expect(determineStreakState(10, false, -5)).toBe('BROKEN');
    });

    it('should return BROKEN when hoursRemaining is null', () => {
      expect(determineStreakState(10, false, null)).toBe('BROKEN');
    });

    it('should return RECOVERING when streak is 0 but hoursRemaining exists', () => {
      expect(determineStreakState(0, false, 10)).toBe('RECOVERING');
    });

    it('should return AT_RISK when hoursRemaining <= 20 and > 4', () => {
      expect(determineStreakState(5, false, 20)).toBe('AT_RISK');
      expect(determineStreakState(5, false, 10)).toBe('AT_RISK');
      expect(determineStreakState(5, false, 5)).toBe('AT_RISK');
    });

    it('should return ACTIVE when hoursRemaining > 20', () => {
      expect(determineStreakState(5, false, 21)).toBe('ACTIVE');
      expect(determineStreakState(5, false, 48)).toBe('ACTIVE');
    });

    it('should return ACTIVE for streak of 0 with sufficient hours', () => {
      expect(determineStreakState(0, false, 24)).toBe('RECOVERING');
    });
  });

  describe('calculateHoursUntilStreakBreak', () => {
    it('should calculate hours correctly', () => {
      const now = Date.now();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const hours = calculateHoursUntilStreakBreak(now);
      const expectedHours = (midnight.getTime() - now) / (1000 * 60 * 60);
      expect(hours).toBeCloseTo(expectedHours, 0);
    });

    it('should return 0 if past midnight', () => {
      const mockNow = new Date();
      mockNow.setHours(25, 0, 0, 0);
      const originalNow = Date.now;
      global.Date.now = jest.fn(() => mockNow.getTime());
      const hours = calculateHoursUntilStreakBreak();
      expect(hours).toBe(0);
      global.Date.now = originalNow;
    });
  });
});
