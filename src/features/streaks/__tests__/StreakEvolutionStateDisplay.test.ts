import {
  getStreakStateInfo,
  getStreakVisualIndicator,
  checkMilestones,
  getNextMilestone,
  getMilestoneProgress,
  getStreakDisplayText,
  getStreakCelebrationMessage,
  type StreakState,
} from '../StreakEvolutionSystem';

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn() },
}));

describe('StreakEvolutionSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStreakStateInfo', () => {
    it('should return info for ACTIVE state', () => {
      const info = getStreakStateInfo('ACTIVE');
      expect(info.label).toBe('Active');
      expect(info.color).toBe('#15803D');
      expect(info.icon).toBeDefined();
    });

    it('should return info for AT_RISK state', () => {
      const info = getStreakStateInfo('AT_RISK');
      expect(info.label).toBe('At Risk');
      expect(info.color).toBe('#F97316');
    });

    it('should return info for BROKEN state', () => {
      const info = getStreakStateInfo('BROKEN');
      expect(info.label).toBe('Broken');
      expect(info.color).toBe('#B91C1C');
    });

    it('should return default for invalid state', () => {
      const info = getStreakStateInfo('INVALID' as StreakState);
      expect(info.label).toBe('Unknown');
    });
  });

  describe('getStreakVisualIndicator', () => {
    it('should return indicator for ACTIVE state', () => {
      const indicator = getStreakVisualIndicator('ACTIVE', 5);
      expect(indicator.type).toBe('flame');
      expect(indicator.intensity).toBeDefined();
    });

    it('should return indicator for AT_RISK state', () => {
      const indicator = getStreakVisualIndicator('AT_RISK', 5);
      expect(indicator.type).toBe('pulse');
      expect(indicator.animation).toBe('warning-pulse');
    });

    it('should return indicator for BROKEN state', () => {
      const indicator = getStreakVisualIndicator('BROKEN', 0);
      expect(indicator.type).toBe('broken');
      expect(indicator.animation).toBe('none');
    });
  });

  describe('Milestones', () => {
    describe('checkMilestones', () => {
      it('should find milestone at exactly 7 days', () => {
        const milestones = checkMilestones(7);
        expect(milestones.length).toBe(1);
        expect(milestones[0].days).toBe(7);
      });

      it('should return empty for non-milestone days', () => {
        const milestones = checkMilestones(5);
        expect(milestones.length).toBe(0);
      });

      it('should find multiple milestones if applicable', () => {
        const milestones = checkMilestones(7);
        expect(milestones.length).toBe(1);
      });
    });

    describe('getNextMilestone', () => {
      it('should return 3 for new streak', () => {
        const next = getNextMilestone(0);
        expect(next?.days).toBe(3);
      });

      it('should return 7 for streak of 5', () => {
        const next = getNextMilestone(5);
        expect(next?.days).toBe(7);
      });

      it('should return 100 for streak of 50', () => {
        const next = getNextMilestone(50);
        expect(next?.days).toBe(100);
      });

      it('should return null at max milestone', () => {
        const next = getNextMilestone(100);
        expect(next).toBeNull();
      });
    });

    describe('getMilestoneProgress', () => {
      it('should calculate progress to next milestone', () => {
        const progress = getMilestoneProgress(5);
        expect(progress.nextMilestone.days).toBe(7);
        expect(progress.percentComplete).toBeCloseTo(71, 0);
      });

      it('should return 100% at milestone', () => {
        const progress = getMilestoneProgress(7);
        expect(progress.percentComplete).toBe(100);
      });
    });
  });

  describe('UI Helpers', () => {
    describe('getStreakDisplayText', () => {
      it('should return day text for streak of 1', () => {
        const text = getStreakDisplayText(1);
        expect(text).toBe('1 Day');
      });

      it('should return days text for streak > 1', () => {
        const text = getStreakDisplayText(5);
        expect(text).toBe('5 Days');
      });

      it('should handle streak of 0', () => {
        const text = getStreakDisplayText(0);
        expect(text).toBe('0 Days');
      });
    });

    describe('getStreakCelebrationMessage', () => {
      it('should return milestone message at milestone', () => {
        const message = getStreakCelebrationMessage(7);
        expect(message).toContain('7');
        expect(message.length).toBeGreaterThan(0);
      });

      it('should return encouragement for non-milestone', () => {
        const message = getStreakCelebrationMessage(5);
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });
});
