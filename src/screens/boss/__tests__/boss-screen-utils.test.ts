import {
  ATTACK_PRESETS,
  getBossScreenCopy,
  estimateDamage,
  formatDuration,
  type BossIntensity,
} from '../boss-screen-utils';

describe('boss-screen-utils', () => {
  describe('ATTACK_PRESETS', () => {
    it('has 3 presets', () => {
      expect(ATTACK_PRESETS).toHaveLength(3);
    });

    it('has expected minute values', () => {
      expect(ATTACK_PRESETS[0].minutes).toBe(15);
      expect(ATTACK_PRESETS[1].minutes).toBe(25);
      expect(ATTACK_PRESETS[2].minutes).toBe(60);
    });
  });

  describe('getBossScreenCopy', () => {
    it('returns subtle copy for subtle intensity', () => {
      const copy = getBossScreenCopy('subtle');
      expect(copy.title).toBe('Focus Momentum');
      expect(copy.actionLabel).toBe('Start focus block');
      expect(copy.historyTitle).toBe('Momentum history');
    });

    it('returns intense copy for intense intensity', () => {
      const copy = getBossScreenCopy('intense');
      expect(copy.title).toBe('Boss Focus');
      expect(copy.actionLabel).toBe('Start focused push');
      expect(copy.historyTitle).toBe('Recent pressure');
    });

    it('returns game-like copy for default intensity', () => {
      const copy = getBossScreenCopy('game-like');
      expect(copy.title).toBe('Boss Health');
      expect(copy.actionLabel).toBe('Start boss focus');
      expect(copy.historyTitle).toBe('Recent hits');
    });

    it('all intensities return all required fields', () => {
      const intensities: BossIntensity[] = ['subtle', 'game-like', 'intense'];
      for (const intensity of intensities) {
        const copy = getBossScreenCopy(intensity);
        expect(copy.actionLabel).toBeDefined();
        expect(copy.historyTitle).toBeDefined();
        expect(copy.intro).toBeDefined();
        expect(copy.metricLabel).toBeDefined();
        expect(copy.title).toBeDefined();
      }
    });

    it('all intros are non-empty', () => {
      const intensities: BossIntensity[] = ['subtle', 'game-like', 'intense'];
      for (const intensity of intensities) {
        expect(getBossScreenCopy(intensity).intro.length).toBeGreaterThan(0);
      }
    });
  });

  describe('estimateDamage', () => {
    it('calculates damage correctly', () => {
      expect(estimateDamage(25, 1)).toBe(38); // 25 * 1 * 1.5 = 37.5 -> 38
      expect(estimateDamage(15, 2)).toBe(45); // 15 * 2 * 1.5 = 45
    });

    it('returns at least 1', () => {
      expect(estimateDamage(0, 0)).toBe(1);
      expect(estimateDamage(1, 0)).toBe(1);
    });

    it('scales with streak multiplier', () => {
      const base = estimateDamage(25, 1);
      const doubled = estimateDamage(25, 2);
      expect(doubled).toBeGreaterThan(base);
      expect(doubled).toBeCloseTo(base * 2, 0);
    });

    it('scales with minutes', () => {
      const short = estimateDamage(15, 1);
      const long = estimateDamage(30, 1);
      expect(long).toBeGreaterThan(short);
      expect(long).toBeCloseTo(short * 2, 0);
    });
  });

  describe('formatDuration', () => {
    it('formats seconds to minutes', () => {
      expect(formatDuration(60)).toBe('1 min');
      expect(formatDuration(1500)).toBe('25 min'); // 1500/60 = 25
      expect(formatDuration(3600)).toBe('60 min');
    });

    it('returns at least 1 min', () => {
      expect(formatDuration(0)).toBe('1 min');
      expect(formatDuration(30)).toBe('1 min');
    });

    it('rounds to nearest minute', () => {
      expect(formatDuration(89)).toBe('1 min'); // 89/60 = 1.48 -> 1
      expect(formatDuration(90)).toBe('2 min'); // 90/60 = 1.5 -> 2
    });
  });
});
