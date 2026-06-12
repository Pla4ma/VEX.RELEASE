import { getBossCopy, toScreenIntensity, nextResetLabel } from '../boss-screen-helpers';

describe('boss-screen-helpers', () => {
  describe('getBossCopy', () => {
    it('returns subtle copy for subtle intensity', () => {
      const copy = getBossCopy('subtle');
      expect(copy.title).toBe('Focus Momentum');
      expect(copy.description).toContain('momentum');
    });

    it('returns game-like copy', () => {
      const copy = getBossCopy('game-like');
      expect(copy.title).toBe('Boss Battle');
      expect(copy.description).toContain('creature');
    });

    it('returns intense copy', () => {
      const copy = getBossCopy('intense');
      expect(copy.title).toBe('Boss Battle — Full Assault');
      expect(copy.description).toContain('critical damage');
    });

    it('defaults to subtle for unknown intensity', () => {
      const copy = getBossCopy('unknown');
      expect(copy.title).toBe('Focus Momentum');
    });

    it('all copies have non-empty title and description', () => {
      const intensities = ['subtle', 'game-like', 'intense', 'unknown'];
      for (const intensity of intensities) {
        const copy = getBossCopy(intensity);
        expect(copy.title.length).toBeGreaterThan(0);
        expect(copy.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe('toScreenIntensity', () => {
    it('returns valid intensities as-is', () => {
      expect(toScreenIntensity('subtle')).toBe('subtle');
      expect(toScreenIntensity('game-like')).toBe('game-like');
      expect(toScreenIntensity('intense')).toBe('intense');
    });

    it('defaults to subtle for unknown values', () => {
      expect(toScreenIntensity('')).toBe('subtle');
      expect(toScreenIntensity('invalid')).toBe('subtle');
      expect(toScreenIntensity('HARDCORE')).toBe('subtle');
    });
  });

  describe('nextResetLabel', () => {
    it('returns a string with days and hours', () => {
      const label = nextResetLabel();
      expect(label).toMatch(/^\d+d \d+h$/);
    });

    it('returns non-zero values', () => {
      const label = nextResetLabel();
      const match = label.match(/^(\d+)d (\d+)h$/);
      expect(match).not.toBeNull();
      const days = parseInt(match![1], 10);
      const hours = parseInt(match![2], 10);
      expect(days).toBeGreaterThanOrEqual(0);
      expect(hours).toBeGreaterThanOrEqual(0);
      expect(days + hours).toBeGreaterThan(0);
    });
  });
});
