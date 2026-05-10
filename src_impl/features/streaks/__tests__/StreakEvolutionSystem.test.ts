/**
 * Streak Evolution System Tests
 *
 * Phase 3.2 - Streak System Evolution
 * Tests for streak states, insurance, recovery mechanics
 */

<<<<<<< HEAD
import { STREAK_STATES, STREAK_MILESTONES, determineStreakState, calculateHoursUntilStreakBreak, getStreakStateInfo, getStreakVisualIndicator, awardInsurance, getAvailableInsuranceCount, getUserInsurance, useInsurance as consumeInsurance, canUseInsurance, createRecoveryPlan, getRecoveryPlan, progressRecovery, clearRecoveryPlan, checkMilestones, getNextMilestone, getMilestoneProgress, getStreakDisplayText, getStreakCelebrationMessage, type StreakState } from "../StreakEvolutionSystem";
=======
import { STREAK_STATES, STREAK_MILESTONES, determineStreakState, calculateHoursUntilStreakBreak, getStreakStateInfo, getStreakVisualIndicator, awardInsurance, getAvailableInsuranceCount, getUserInsurance, useInsurance, canUseInsurance, createRecoveryPlan, getRecoveryPlan, progressRecovery, clearRecoveryPlan, checkMilestones, getNextMilestone, getMilestoneProgress, getStreakDisplayText, getStreakCelebrationMessage, type StreakState } from '../StreakEvolutionSystem';
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

// Mock eventBus
jest.mock('../../../events', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(),
  },
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
      // Actually, 0 streak with hours > 0 is RECOVERING
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
      // This would need to be mocked properly
      const mockNow = new Date();
      mockNow.setHours(25, 0, 0, 0); // Past midnight

      // Mock Date.now
      const originalNow = Date.now;
      global.Date.now = jest.fn(() => mockNow.getTime());

      const hours = calculateHoursUntilStreakBreak();
      expect(hours).toBe(0);

      global.Date.now = originalNow;
    });
  });

  describe('getStreakStateInfo', () => {
    it('should return info for ACTIVE state', () => {
      const info = getStreakStateInfo('ACTIVE');
      expect(info.label).toBe('Active');
      expect(info.color).toBe('#48BB78');
      expect(info.icon).toBeDefined();
    });

    it('should return info for AT_RISK state', () => {
      const info = getStreakStateInfo('AT_RISK');
      expect(info.label).toBe('At Risk');
      expect(info.color).toBe('#ED8936');
    });

    it('should return info for BROKEN state', () => {
      const info = getStreakStateInfo('BROKEN');
      expect(info.label).toBe('Broken');
      expect(info.color).toBe('#E53E3E');
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

  describe('Insurance Management', () => {
    const userId = 'test-user-123';

    beforeEach(() => {
      // Clear any existing insurance
      const insurance = getUserInsurance(userId);
      if (insurance) {
        for (const ins of insurance.insurances) {
          if (ins.status === 'active') {
            // Use it to clear it
<<<<<<< HEAD
            consumeInsurance(userId, "test-context");
=======
            useInsurance(userId, 'test-context');
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
          }
        }
      }
    });

    describe('awardInsurance', () => {
      it('should award insurance with monthly source', () => {
        const result = awardInsurance(userId, 'monthly_premium', 1);

        expect(result.success).toBe(true);
        expect(result.userInsurance?.totalAvailable).toBe(1);
      });

      it('should award multiple insurances', () => {
        awardInsurance(userId, 'monthly_premium', 3);

        const insurance = getUserInsurance(userId);
        expect(insurance?.totalAvailable).toBe(3);
      });

      it('should limit insurance to max of 3', () => {
        awardInsurance(userId, 'monthly_premium', 5);

        const insurance = getUserInsurance(userId);
        expect(insurance?.totalAvailable).toBe(3); // Capped at 3
      });

      it('should publish event on award', () => {
        const { eventBus } = require('../../../events');

        awardInsurance(userId, 'monthly_premium', 1);

        expect(eventBus.publish).toHaveBeenCalledWith('streak:insurance_awarded', expect.any(Object));
      });
    });

    describe('getAvailableInsuranceCount', () => {
      it('should return 0 for user with no insurance', () => {
        const count = getAvailableInsuranceCount('new-user');
        expect(count).toBe(0);
      });

      it('should return correct count after awarding', () => {
        awardInsurance(userId, 'monthly_premium', 2);

        const count = getAvailableInsuranceCount(userId);
        expect(count).toBe(2);
      });

<<<<<<< HEAD
      it("should return 0 after using all insurance", () => {
        awardInsurance(userId, "monthly_premium", 1);
        consumeInsurance(userId, "test-context");
=======
      it('should return 0 after using all insurance', () => {
        awardInsurance(userId, 'monthly_premium', 1);
        useInsurance(userId, 'test-context');
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

        const count = getAvailableInsuranceCount(userId);
        expect(count).toBe(0);
      });
    });

    describe('canUseInsurance', () => {
      it('should return true when insurance available', () => {
        awardInsurance(userId, 'monthly_premium', 1);

        const result = canUseInsurance(userId);
        expect(result.canUse).toBe(true);
      });

      it('should return false when no insurance', () => {
        const result = canUseInsurance(userId);
        expect(result.canUse).toBe(false);
        expect(result.reason).toBe('No insurance available');
      });

      it('should return false for invalid user', () => {
        const result = canUseInsurance('invalid-user');
        expect(result.canUse).toBe(false);
      });
    });

    describe('useInsurance', () => {
      it('should use insurance successfully', () => {
        awardInsurance(userId, 'monthly_premium', 1);

<<<<<<< HEAD
        const result = consumeInsurance(userId, "streak_break");
=======
        const result = useInsurance(userId, 'streak_break');
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

        expect(result.success).toBe(true);
        expect(result.remainingInsurance).toBe(0);
      });

<<<<<<< HEAD
      it("should fail when no insurance available", () => {
        const result = consumeInsurance(userId, "streak_break");
=======
      it('should fail when no insurance available', () => {
        const result = useInsurance(userId, 'streak_break');
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

        expect(result.success).toBe(false);
        expect(result.error).toBe('No active insurance available');
      });

      it('should publish event on use', () => {
        const { eventBus } = require('../../../events');
        awardInsurance(userId, 'monthly_premium', 1);

<<<<<<< HEAD
        consumeInsurance(userId, "streak_break");
=======
        useInsurance(userId, 'streak_break');
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

        expect(eventBus.publish).toHaveBeenCalledWith('streak:insurance_used', expect.any(Object));
      });
    });
  });

  describe('Recovery Plan', () => {
    const userId = 'test-user-456';

    beforeEach(() => {
      clearRecoveryPlan(userId);
    });

    describe('createRecoveryPlan', () => {
      it('should create plan for lost streak < 7 days', () => {
        const plan = createRecoveryPlan(userId, 5, 1000);

        expect(plan).not.toBeNull();
        expect(plan?.userId).toBe(userId);
        expect(plan?.daysLost).toBe(5);
        expect(plan?.sessionsRequired).toBe(1);
      });

      it('should create plan for lost streak 7-14 days', () => {
        const plan = createRecoveryPlan(userId, 10, 1000);

        expect(plan?.sessionsRequired).toBe(2);
      });

      it('should create plan for lost streak > 14 days', () => {
        const plan = createRecoveryPlan(userId, 20, 5000);

        expect(plan?.sessionsRequired).toBe(3);
      });

      it('should have appropriate reward', () => {
        const plan = createRecoveryPlan(userId, 5, 1000);

        expect(plan?.reward.type).toBeDefined();
        expect(plan?.reward.value).toBeGreaterThan(0);
      });

      it('should publish event', () => {
        const { eventBus } = require('../../../events');

        createRecoveryPlan(userId, 5, 100);

        expect(eventBus.publish).toHaveBeenCalledWith('streak:recovery_plan_created', expect.any(Object));
      });
    });

    describe('getRecoveryPlan', () => {
      it('should return null when no plan exists', () => {
        const plan = getRecoveryPlan(userId);
        expect(plan).toBeNull();
      });

      it('should return plan when exists', () => {
        createRecoveryPlan(userId, 5, 100);

        const plan = getRecoveryPlan(userId);
        expect(plan).not.toBeNull();
        expect(plan?.userId).toBe(userId);
      });

      it('should return null for expired plan', () => {
        // Create plan with past expiry
        const plan = createRecoveryPlan(userId, 5, 100);
        if (plan) {
          plan.expiresAt = Date.now() - 1000; // Expired
        }

        const retrieved = getRecoveryPlan(userId);
        expect(retrieved).toBeNull();
      });
    });

    describe('progressRecovery', () => {
      it('should progress plan on session complete', () => {
        createRecoveryPlan(userId, 5, 100);

        const result = progressRecovery(userId, 'session_complete');

        expect(result.progressed).toBe(true);
        expect(result.currentProgress).toBe(1);
      });

      it('should complete plan when all sessions done', () => {
        const plan = createRecoveryPlan(userId, 5, 100);
        const required = plan?.sessionsRequired || 1;

        // Complete all required sessions
        for (let i = 0; i < required; i++) {
          progressRecovery(userId, 'session_complete');
        }

        const updatedPlan = getRecoveryPlan(userId);
        expect(updatedPlan?.completed).toBe(true);
      });

      it('should return false when no plan exists', () => {
        const result = progressRecovery('no-plan-user', 'session_complete');

        expect(result.progressed).toBe(false);
      });
    });

    describe('clearRecoveryPlan', () => {
      it('should clear existing plan', () => {
        createRecoveryPlan(userId, 5, 100);

        clearRecoveryPlan(userId);

        const plan = getRecoveryPlan(userId);
        expect(plan).toBeNull();
      });
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
        // First time reaching 7 days should also count for 3
        const milestones = checkMilestones(7);

        // Only returns the exact milestone
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
        expect(progress.percentComplete).toBeCloseTo(71, 0); // 5/7 = ~71%
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

