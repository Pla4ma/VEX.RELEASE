import {
  calculateLadderPosition,
  getUpgradeMessage,
  getPaywallTiming,
  calculateUpgradeDiscount,
  formatTierPrice,
  getFeatureComparison,
  TIER_CONFIGS,
} from '../value-ladder';

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
  describe('value-ladder', () => {
    describe('calculateLadderPosition', () => {
      it('returns low urgency for premium user', () => {
        const pos = calculateLadderPosition('premium', 50, 30, false);
        expect(pos.upgradeUrgency).toBe('low');
        expect(pos.discountEligible).toBe(false);
      });
      it('returns low urgency for new free user', () => {
        const pos = calculateLadderPosition('free', 5, 3, false);
        expect(pos.upgradeUrgency).toBe('low');
      });
      it('returns medium urgency for 40+ sessions and 14+ days', () => {
        const pos = calculateLadderPosition('free', 40, 14, false);
        expect(pos.upgradeUrgency).toBe('medium');
      });
      it('returns high urgency with discount for 60+ sessions and 30+ days', () => {
        const pos = calculateLadderPosition('free', 60, 30, false);
        expect(pos.upgradeUrgency).toBe('high');
        expect(pos.discountEligible).toBe(true);
        expect(pos.discountPercent).toBe(20);
      });
      it('gives 15% discount for interested users with 20+ sessions', () => {
        const pos = calculateLadderPosition('free', 25, 5, true);
        expect(pos.discountEligible).toBe(true);
        expect(pos.discountPercent).toBe(15);
      });
    });
    describe('getUpgradeMessage', () => {
      it('returns already premium for premium users', () => {
        const msg = getUpgradeMessage({
          currentTier: 'premium',
          sessionsCompleted: 0,
          daysActive: 0,
          nextRecommendedTier: 'premium',
          upgradeUrgency: 'low',
          discountEligible: false,
        });
        expect(msg).toContain('Premium');
      });
      it('returns high urgency message', () => {
        const msg = getUpgradeMessage({
          currentTier: 'free',
          sessionsCompleted: 60,
          daysActive: 30,
          nextRecommendedTier: 'premium',
          upgradeUrgency: 'high',
          discountEligible: false,
        });
        expect(msg).toContain('rhythm');
      });
      it('returns medium urgency message', () => {
        const msg = getUpgradeMessage({
          currentTier: 'free',
          sessionsCompleted: 40,
          daysActive: 14,
          nextRecommendedTier: 'premium',
          upgradeUrgency: 'medium',
          discountEligible: false,
        });
        expect(msg).toContain('momentum');
      });
    });
    describe('getPaywallTiming', () => {
      it('does not show paywall within 7 days of last', () => {
        const result = getPaywallTiming(50, 3, 90);
        expect(result.shouldShow).toBe(false);
      });
      it('shows paywall for high quality session after 7 days', () => {
        const result = getPaywallTiming(50, 8, 90);
        expect(result.shouldShow).toBe(true);
        expect(result.trigger).toBe('post_session');
      });
      it('does not show for low quality session', () => {
        const result = getPaywallTiming(50, 8, 50);
        expect(result.shouldShow).toBe(false);
      });
    });
    describe('calculateUpgradeDiscount', () => {
      it('returns 15% for 30+ active days', () => {
        const result = calculateUpgradeDiscount('free', 'premium', 30);
        expect(result.eligible).toBe(true);
        expect(result.discountPercent).toBe(15);
      });
      it('returns 10% for 14+ active days', () => {
        const result = calculateUpgradeDiscount('free', 'premium', 14);
        expect(result.eligible).toBe(true);
        expect(result.discountPercent).toBe(10);
      });
      it('returns not eligible for < 14 days', () => {
        const result = calculateUpgradeDiscount('free', 'premium', 5);
        expect(result.eligible).toBe(false);
      });
    });
    describe('formatTierPrice', () => {
      it('formats free tier price as $0.00', () => {
        const result = formatTierPrice('free');
        expect(result.fullPrice).toBe('$0.00');
        expect(result.discountedPrice).toBe('$0.00');
      });
      it('applies discount to premium tier', () => {
        const result = formatTierPrice('premium', 20);
        expect(result.fullPrice).toContain('$9.99');
        expect(result.savings).toContain('Save');
      });
      it('returns no savings for 0 discount', () => {
        const result = formatTierPrice('premium', 0);
        expect(result.savings).toBe('');
      });
    });
    describe('getFeatureComparison', () => {
      it('returns new features when upgrading from free to premium', () => {
        const result = getFeatureComparison('free', 'premium');
        expect(result.newFeatures.length).toBeGreaterThan(0);
      });
      it('returns empty for same tier upgrade', () => {
        const result = getFeatureComparison('premium', 'premium');
        expect(result.newFeatures).toHaveLength(0);
      });
    });
    it('TIER_CONFIGS has free and premium entries', () => {
      expect(TIER_CONFIGS.free).toBeDefined();
      expect(TIER_CONFIGS.premium).toBeDefined();
    });
  });
});
