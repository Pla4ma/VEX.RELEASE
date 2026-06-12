import { PREMIUM_BENEFITS } from '../paywall-data';

describe('paywall-data', () => {
  describe('PREMIUM_BENEFITS', () => {
    it('has 6 benefit entries', () => {
      expect(PREMIUM_BENEFITS).toHaveLength(6);
    });

    it('each benefit has title and description', () => {
      for (const benefit of PREMIUM_BENEFITS) {
        expect(benefit).toHaveLength(2);
        expect(benefit[0].length).toBeGreaterThan(0);
        expect(benefit[1].length).toBeGreaterThan(0);
      }
    });

    it('contains expected benefit titles', () => {
      const titles = PREMIUM_BENEFITS.map(b => b[0]);
      expect(titles).toContain('Deep Coach Memory');
      expect(titles).toContain('Monthly Focus Report');
      expect(titles).toContain('Progress Intelligence');
      expect(titles).toContain('Advanced Study / Deep Work OS');
      expect(titles).toContain('Visual Identity');
      expect(titles).toContain('Premium Session Modes');
    });
  });
});
