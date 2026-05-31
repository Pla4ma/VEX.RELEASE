import {
  awardInsurance,
  getAvailableInsuranceCount,
  getUserInsurance,
  useInsurance,
  canUseInsurance,
} from '../StreakEvolutionSystem';

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn() },
}));

describe('StreakEvolutionSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Insurance Management', () => {
    const userId = 'test-user-123';

    beforeEach(() => {
      const insurance = getUserInsurance(userId);
      if (insurance) {
        for (const ins of insurance.insurances) {
          if (ins.status === 'active') {
            useInsurance(userId, 'test-context');
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
        expect(insurance?.totalAvailable).toBe(3);
      });

      it('should publish event on award', () => {
        const { eventBus } = require('../../../events');
        awardInsurance(userId, 'monthly_premium', 1);
        expect(eventBus.publish).toHaveBeenCalledWith(
          'streak:insurance_awarded',
          expect.any(Object),
        );
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

      it('should return 0 after using all insurance', () => {
        awardInsurance(userId, 'monthly_premium', 1);
        useInsurance(userId, 'test-context');
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
        const result = useInsurance(userId, 'streak_break');
        expect(result.success).toBe(true);
        expect(result.remainingInsurance).toBe(0);
      });

      it('should fail when no insurance available', () => {
        const result = useInsurance(userId, 'streak_break');
        expect(result.success).toBe(false);
        expect(result.error).toBe('No active insurance available');
      });

      it('should publish event on use', () => {
        const { eventBus } = require('../../../events');
        awardInsurance(userId, 'monthly_premium', 1);
        useInsurance(userId, 'streak_break');
        expect(eventBus.publish).toHaveBeenCalledWith(
          'streak:insurance_used',
          expect.any(Object),
        );
      });
    });
  });
});
