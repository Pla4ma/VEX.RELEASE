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
    it('has free and premium tiers', () => {
      expect(TIER_CONFIGS.free).toBeDefined();
      expect(TIER_CONFIGS.premium).toBeDefined();
    });

    it('free tier has zero price', () => {
      expect(TIER_CONFIGS.free.price).toBe(0);
    });

    it('premium tier has correct price', () => {
      expect(TIER_CONFIGS.premium.price).toBe(9.99);
    });

    it('each tier has features', () => {
      expect(TIER_CONFIGS.free.features.length).toBeGreaterThan(0);
      expect(TIER_CONFIGS.premium.features.length).toBeGreaterThan(0);
    });

    it('free tier features — basic session loop stays free', () => {
      const features = TIER_CONFIGS.free.features.join(' ');
      expect(features).toMatch(/focus/i);
      expect(features).toMatch(/streak/i);
      expect(features).toMatch(/coach/i);
    });
  });

  describe('calculateLadderPosition', () => {
    it('calculates position for new free user', () => {
      const position = calculateLadderPosition('free', 0, 0, false);
      expect(position.currentTier).toBe('free');
      expect(position.nextRecommendedTier).toBe('premium');
      expect(position.upgradeUrgency).toBe('low');
      expect(position.discountEligible).toBe(false);
    });

    it('detects medium urgency after 7 sessions and 7 days', () => {
      const position = calculateLadderPosition('free', 7, 7, false);
      expect(position.upgradeUrgency).toBe('medium');
    });

    it('detects high urgency after 20 sessions and 14 days', () => {
      const position = calculateLadderPosition('free', 20, 14, false);
      expect(position.upgradeUrgency).toBe('high');
      expect(position.discountEligible).toBe(true);
      expect(position.discountPercent).toBe(20);
    });

    it('grants discount for high interest + sessions', () => {
      const position = calculateLadderPosition('free', 6, 5, true);
      expect(position.discountEligible).toBe(true);
      expect(position.discountPercent).toBe(15);
    });

    it('premium already stays premium', () => {
      const position = calculateLadderPosition('premium', 100, 50, false);
      expect(position.nextRecommendedTier).toBe('premium');
      expect(position.upgradeUrgency).toBe('low');
    });
  });

  describe('getUpgradeMessage', () => {
    it('returns high urgency message', () => {
      const position = {
        currentTier: 'free' as const,
        sessionsCompleted: 25,
        daysActive: 15,
        nextRecommendedTier: 'premium' as const,
        upgradeUrgency: 'high' as const,
        discountEligible: true,
        discountPercent: 20,
      };
      expect(getUpgradeMessage(position)).toContain('full execution system');
    });

    it('returns medium urgency message', () => {
      const position = {
        currentTier: 'free' as const,
        sessionsCompleted: 10,
        daysActive: 7,
        nextRecommendedTier: 'premium' as const,
        upgradeUrgency: 'medium' as const,
        discountEligible: false,
      };
      expect(getUpgradeMessage(position)).toContain('momentum');
    });

    it('returns discount message when eligible', () => {
      const position = {
        currentTier: 'free' as const,
        sessionsCompleted: 6,
        daysActive: 5,
        nextRecommendedTier: 'premium' as const,
        upgradeUrgency: 'low' as const,
        discountEligible: true,
        discountPercent: 15,
      };
      expect(getUpgradeMessage(position)).toContain('15% off');
    });
  });

  describe('getPaywallTiming', () => {
    it('does not show if recently shown', () => {
      const timing = getPaywallTiming(10, 1, 90);
      expect(timing.shouldShow).toBe(false);
      expect(timing.trigger).toBe('none');
    });

    it('shows after quality session', () => {
      const timing = getPaywallTiming(5, 10, 90);
      expect(timing.shouldShow).toBe(true);
      expect(timing.trigger).toBe('post_session');
      expect(timing.delayMinutes).toBe(2);
    });

    it('shows at session 7', () => {
      const timing = getPaywallTiming(7, 10, 70);
      expect(timing.shouldShow).toBe(true);
      expect(timing.trigger).toBe('session_7');
    });

    it('does not show with low quality', () => {
      const timing = getPaywallTiming(5, 10, 50);
      expect(timing.shouldShow).toBe(false);
    });
  });

  describe('calculateUpgradeDiscount', () => {
    it('returns 15% for loyal users (30+ days)', () => {
      const discount = calculateUpgradeDiscount('free', 'premium', 35);
      expect(discount.eligible).toBe(true);
      expect(discount.discountPercent).toBe(15);
      expect(discount.reason).toContain('rhythm');
    });

    it('returns 10% for 14+ days', () => {
      const discount = calculateUpgradeDiscount('free', 'premium', 20);
      expect(discount.eligible).toBe(true);
      expect(discount.discountPercent).toBe(10);
    });

    it('returns no discount for new user', () => {
      const discount = calculateUpgradeDiscount('free', 'premium', 5);
      expect(discount.eligible).toBe(false);
      expect(discount.discountPercent).toBe(0);
    });
  });

  describe('formatTierPrice', () => {
    it('formats price without discount', () => {
      const formatted = formatTierPrice('premium');
      expect(formatted.fullPrice).toBe('$9.99');
      expect(formatted.discountedPrice).toBe('$9.99');
      expect(formatted.savings).toBe('');
    });

    it('formats price with discount', () => {
      const formatted = formatTierPrice('premium', 20);
      expect(formatted.fullPrice).toBe('$9.99');
      expect(formatted.discountedPrice).toBe('$7.99');
      expect(formatted.savings).toContain('Save');
    });

    it('calculates correct savings', () => {
      const formatted = formatTierPrice('premium', 50);
      expect(formatted.savings).toBe('Save $5.00');
    });
  });

  describe('getFeatureComparison', () => {
    it('finds new features when upgrading', () => {
      const comparison = getFeatureComparison('free', 'premium');
      expect(comparison.newFeatures.length).toBeGreaterThan(0);
    });

    it('returns empty for same tier', () => {
      const comparison = getFeatureComparison('premium', 'premium');
      expect(comparison.newFeatures.length).toBe(0);
    });
  });

  describe('trackLadderInteraction', () => {
    it('tracks view without error', async () => {
      await expect(
        trackLadderInteraction('user-1', 'viewed', 'premium'),
      ).resolves.not.toThrow();
    });

    it('tracks selection without error', async () => {
      await expect(
        trackLadderInteraction('user-1', 'selected_tier', 'premium'),
      ).resolves.not.toThrow();
    });
  });
});
