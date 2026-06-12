import { TIER_CONFIG, type ChestTier } from '../tier-config';

describe('tier-config', () => {
  describe('TIER_CONFIG', () => {
    it('has config for all tiers', () => {
      const tiers: ChestTier[] = ['WOOD', 'SILVER', 'GOLD', 'LEGENDARY'];
      for (const tier of tiers) {
        expect(TIER_CONFIG[tier]).toBeDefined();
      }
    });

    it('each tier has required fields', () => {
      for (const [tier, config] of Object.entries(TIER_CONFIG)) {
        expect(config.colors).toBeDefined();
        expect(config.colors.length).toBeGreaterThan(0);
        expect(config.emoji).toBeDefined();
        expect(config.label).toBeDefined();
        expect(config.glow).toBeDefined();
      }
    });

    it('has correct labels', () => {
      expect(TIER_CONFIG.WOOD.label).toBe('Wood Chest');
      expect(TIER_CONFIG.SILVER.label).toBe('Silver Chest');
      expect(TIER_CONFIG.GOLD.label).toBe('Gold Chest');
      expect(TIER_CONFIG.LEGENDARY.label).toBe('Legendary Chest');
    });

    it('has correct emojis', () => {
      expect(TIER_CONFIG.WOOD.emoji).toBe('\uD83D\uDC66');
      expect(TIER_CONFIG.SILVER.emoji).toBe('\uD83E\uDD48');
      expect(TIER_CONFIG.GOLD.emoji).toBe('\uD83C\uDFC6');
      expect(TIER_CONFIG.LEGENDARY.emoji).toBe('\uD83D\uDC51');
    });

    it('LEGENDARY has 3 colors, others have fewer', () => {
      expect(TIER_CONFIG.LEGENDARY.colors.length).toBe(3);
      expect(TIER_CONFIG.WOOD.colors.length).toBe(2);
      expect(TIER_CONFIG.SILVER.colors.length).toBe(2);
      expect(TIER_CONFIG.GOLD.colors.length).toBe(2);
    });
  });
});
