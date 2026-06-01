import {
  calculateLadderPosition,
  getUpgradeMessage,
  TIER_CONFIGS,
} from './value-ladder.helpers';

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

    it('detects medium urgency after 40 sessions and 14 days', () => {
      const position = calculateLadderPosition('free', 40, 14, false);
      expect(position.upgradeUrgency).toBe('medium');
    });

    it('detects high urgency after 60 sessions and 30 days', () => {
      const position = calculateLadderPosition('free', 60, 30, false);
      expect(position.upgradeUrgency).toBe('high');
      expect(position.discountEligible).toBe(true);
      expect(position.discountPercent).toBe(20);
    });

    it('grants discount for high interest + 20 sessions', () => {
      const position = calculateLadderPosition('free', 20, 10, true);
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
});
