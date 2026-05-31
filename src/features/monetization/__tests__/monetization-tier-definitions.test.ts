import {
  TIERS,
  FREE_FEATURE_STRS,
  PREMIUM_FEATURE_STRS,
  hasFeature,
  getMaxActiveStudyPlans,
} from '../tier-definitions';

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn() },
}));

describe('monetization feature — comprehensive tests', () => {
  describe('tier-definitions', () => {
    it('TIERS has free and premium tiers', () => {
      expect(TIERS.free).toBeDefined();
      expect(TIERS.premium).toBeDefined();
    });
    it('free tier has null price', () => {
      expect(TIERS.free.monthlyPrice).toBeNull();
      expect(TIERS.free.yearlyPrice).toBeNull();
    });
    it('premium tier has monthly and yearly prices', () => {
      expect(TIERS.premium.monthlyPrice).toBeGreaterThan(0);
      expect(TIERS.premium.yearlyPrice).toBeGreaterThan(0);
    });
    it('premium tier has trial days > 0', () => {
      expect(TIERS.premium.trialDays).toBeGreaterThan(0);
    });
    it('hasFeature returns false for all free features', () => {
      expect(hasFeature('free', 'deepCoachMemory')).toBe(false);
      expect(hasFeature('free', 'advancedStudyOS')).toBe(false);
      expect(hasFeature('free', 'progressIntelligence')).toBe(false);
    });
    it('hasFeature returns true for all premium features', () => {
      expect(hasFeature('premium', 'deepCoachMemory')).toBe(true);
      expect(hasFeature('premium', 'advancedStudyOS')).toBe(true);
      expect(hasFeature('premium', 'progressIntelligence')).toBe(true);
    });
    it('getMaxActiveStudyPlans returns 1 for free, Infinity for premium', () => {
      expect(getMaxActiveStudyPlans('free')).toBe(1);
      expect(getMaxActiveStudyPlans('premium')).toBe(Infinity);
    });
    it('FREE_FEATURE_STRS and PREMIUM_FEATURE_STRS are non-empty arrays', () => {
      expect(FREE_FEATURE_STRS.length).toBeGreaterThan(0);
      expect(PREMIUM_FEATURE_STRS.length).toBeGreaterThan(0);
    });
  });
});
