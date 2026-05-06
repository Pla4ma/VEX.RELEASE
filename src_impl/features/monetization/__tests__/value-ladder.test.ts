import {
  calculateLadderPosition,
  calculateUpgradeDiscount,
  formatTierPrice,
  getFeatureComparison,
  getPaywallTiming,
  getUpgradeMessage,
  TIER_CONFIGS,
  trackLadderInteraction,
} from '../value-ladder';

describe('Value Ladder Service', () => {
  describe('TIER_CONFIGS', () => {
    it('has all 4 tiers defined', () => {
      expect(TIER_CONFIGS.free).toBeDefined();
      expect(TIER_CONFIGS.plus).toBeDefined();
      expect(TIER_CONFIGS.pro).toBeDefined();
      expect(TIER_CONFIGS.elite).toBeDefined();
    });

    it('free tier has zero price', () => {
      expect(TIER_CONFIGS.free.price).toBe(0);
    });

    it('each tier has features', () => {
      Object.values(TIER_CONFIGS).forEach((tier) => {
        expect(tier.features.length).toBeGreaterThan(0);
      });
    });
  });

  describe('calculateLadderPosition', () => {
    it('calculates position for new free user', () => {
      const position = calculateLadderPosition('free', 0, 0, false);

      expect(position.currentTier).toBe('free');
      expect(position.nextRecommendedTier).toBe('plus');
      expect(position.upgradeUrgency).toBe('low');
      expect(position.discountEligible).toBe(false);
    });

    it('detects medium urgency after 10 sessions', () => {
      const position = calculateLadderPosition('free', 10, 3, false);

      expect(position.upgradeUrgency).toBe('medium');
    });

    it('detects high urgency after 20 sessions', () => {
      const position = calculateLadderPosition('free', 20, 7, false);

      expect(position.upgradeUrgency).toBe('high');
      expect(position.discountEligible).toBe(true);
      expect(position.discountPercent).toBe(20);
    });

    it('recommends pro after plus', () => {
      const position = calculateLadderPosition('plus', 30, 10, false);

      expect(position.nextRecommendedTier).toBe('pro');
    });

    it('recommends elite after pro', () => {
      const position = calculateLadderPosition('pro', 50, 20, false);

      expect(position.nextRecommendedTier).toBe('elite');
    });

    it('elite has no next tier', () => {
      const position = calculateLadderPosition('elite', 100, 50, false);

      expect(position.nextRecommendedTier).toBe('elite');
    });

    it('grants discount for high engagement', () => {
      const position = calculateLadderPosition('free', 60, 15, true);

      expect(position.discountEligible).toBe(true);
      expect(position.discountPercent).toBe(15);
    });
  });

  describe('getUpgradeMessage', () => {
    it('returns high urgency message', () => {
      const position = {
        currentTier: 'free',
        sessionsCompleted: 25,
        daysActive: 10,
        nextRecommendedTier: 'plus',
        upgradeUrgency: 'high',
        discountEligible: true,
        discountPercent: 20,
      };

      expect(getUpgradeMessage(position)).toContain('crushing it');
    });

    it('returns medium urgency message', () => {
      const position = {
        currentTier: 'free',
        sessionsCompleted: 15,
        daysActive: 5,
        nextRecommendedTier: 'plus',
        upgradeUrgency: 'medium',
        discountEligible: false,
      };

      expect(getUpgradeMessage(position)).toContain('level up');
    });

    it('returns discount message when eligible', () => {
      const position = {
        currentTier: 'free',
        sessionsCompleted: 60,
        daysActive: 20,
        nextRecommendedTier: 'plus',
        upgradeUrgency: 'low',
        discountEligible: true,
        discountPercent: 15,
      };

      expect(getUpgradeMessage(position)).toContain('15% off');
    });
  });

  describe('getPaywallTiming', () => {
    it('should not show if recently shown', () => {
      const timing = getPaywallTiming(10, 1, 90);

      expect(timing.shouldShow).toBe(false);
      expect(timing.trigger).toBe('none');
    });

    it('should show after quality session', () => {
      const timing = getPaywallTiming(5, 5, 90);

      expect(timing.shouldShow).toBe(true);
      expect(timing.trigger).toBe('post_session');
      expect(timing.delayMinutes).toBe(2);
    });

    it('should show at 7-day streak', () => {
      const timing = getPaywallTiming(7, 5, 70);

      expect(timing.shouldShow).toBe(true);
      expect(timing.trigger).toBe('streak_milestone');
    });

    it('should show at 14-day streak', () => {
      const timing = getPaywallTiming(14, 5, 80);

      expect(timing.shouldShow).toBe(true);
      expect(timing.trigger).toBe('streak_milestone');
    });

    it('should not show with low quality', () => {
      const timing = getPaywallTiming(5, 5, 50);

      expect(timing.shouldShow).toBe(false);
    });
  });

  describe('calculateUpgradeDiscount', () => {
    it('returns 25% for big tier jump', () => {
      const discount = calculateUpgradeDiscount('free', 'elite', 10);

      expect(discount.eligible).toBe(true);
      expect(discount.discountPercent).toBe(25);
      expect(discount.reason).toContain('Big upgrade');
    });

    it('returns 15% for loyal users', () => {
      const discount = calculateUpgradeDiscount('plus', 'pro', 40);

      expect(discount.eligible).toBe(true);
      expect(discount.discountPercent).toBe(15);
      expect(discount.reason).toContain('Loyal');
    });

    it('returns no discount for small jump and new user', () => {
      const discount = calculateUpgradeDiscount('plus', 'pro', 10);

      expect(discount.eligible).toBe(false);
      expect(discount.discountPercent).toBe(0);
    });
  });

  describe('formatTierPrice', () => {
    it('formats price without discount', () => {
      const formatted = formatTierPrice('plus');

      expect(formatted.fullPrice).toBe('$4.99');
      expect(formatted.discountedPrice).toBe('$4.99');
      expect(formatted.savings).toBe('');
    });

    it('formats price with discount', () => {
      const formatted = formatTierPrice('plus', 20);

      expect(formatted.fullPrice).toBe('$4.99');
      expect(formatted.discountedPrice).toBe('$3.99');
      expect(formatted.savings).toContain('Save');
    });

    it('calculates correct savings', () => {
      const formatted = formatTierPrice('pro', 50);

      expect(formatted.savings).toBe('Save $5.00');
    });
  });

  describe('getFeatureComparison', () => {
    it('finds new features when upgrading', () => {
      const comparison = getFeatureComparison('free', 'plus');

      expect(comparison.newFeatures.length).toBeGreaterThan(0);
    });

    it('returns empty for same tier', () => {
      const comparison = getFeatureComparison('plus', 'plus');

      expect(comparison.newFeatures.length).toBe(0);
    });
  });

  describe('trackLadderInteraction', () => {
    it('tracks view without error', async () => {
      await expect(
        trackLadderInteraction('user-1', 'viewed', 'plus')
      ).resolves.not.toThrow();
    });

    it('tracks selection without error', async () => {
      await expect(
        trackLadderInteraction('user-1', 'selected_tier', 'pro')
      ).resolves.not.toThrow();
    });
  });
});
