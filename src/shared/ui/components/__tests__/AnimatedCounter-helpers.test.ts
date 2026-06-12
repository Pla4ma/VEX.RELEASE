import { formatNumber, getCurrencySymbol, getSizeConfig } from '../AnimatedCounter.helpers';
import type { CounterSize, CounterVariant } from '../AnimatedCounter.helpers';

describe('AnimatedCounter.helpers', () => {
  describe('formatNumber', () => {
    it('formats plain numbers', () => {
      expect(formatNumber(42, 'default', 0, 1000, 'en-US')).toBe('42');
    });

    it('formats with decimals', () => {
      expect(formatNumber(3.14, 'default', 2, 1000, 'en-US')).toBe('3.14');
    });

    it('formats percentage', () => {
      expect(formatNumber(95.5, 'percentage', 1, 1000, 'en-US')).toBe('95.5%');
    });

    it('formats compact for large currency values', () => {
      const result = formatNumber(1500, 'currency', 0, 1000, 'en-US');
      expect(result).toContain('1.5');
    });

    it('formats compact variant', () => {
      const result = formatNumber(2500, 'compact', 0, 1000, 'en-US');
      expect(result).toContain('2.5');
    });

    it('does not compact small currency values', () => {
      const result = formatNumber(500, 'currency', 0, 1000, 'en-US');
      expect(result).toBe('500');
    });
  });

  describe('getCurrencySymbol', () => {
    it('returns symbol for known currencies', () => {
      expect(getCurrencySymbol('coins')).toBe('\uD83E\uDE99');
      expect(getCurrencySymbol('gems')).toBe('\uD83D\uDC8E');
      expect(getCurrencySymbol('xp')).toBe('\u2B50');
      expect(getCurrencySymbol('usd')).toBe('$');
      expect(getCurrencySymbol('eur')).toBe('\u20AC');
      expect(getCurrencySymbol('gbp')).toBe('\u00A3');
    });

    it('returns currency code for unknown currencies', () => {
      expect(getCurrencySymbol('xyz')).toBe('xyz');
    });
  });

  describe('getSizeConfig', () => {
    it('returns config for all sizes', () => {
      const sizes: CounterSize[] = ['xs', 'sm', 'md', 'lg', 'xl', 'hero'];
      for (const size of sizes) {
        const config = getSizeConfig(size);
        expect(config.fontSize).toBeGreaterThan(0);
        expect(config.fontWeight).toBeDefined();
        expect(config.trendSize).toBeGreaterThan(0);
      }
    });

    it('font sizes increase with size', () => {
      const sizes: CounterSize[] = ['xs', 'sm', 'md', 'lg', 'xl', 'hero'];
      let prevSize = 0;
      for (const size of sizes) {
        const config = getSizeConfig(size);
        expect(config.fontSize).toBeGreaterThan(prevSize);
        prevSize = config.fontSize;
      }
    });

    it('hero is the largest', () => {
      const hero = getSizeConfig('hero');
      const xl = getSizeConfig('xl');
      expect(hero.fontSize).toBeGreaterThan(xl.fontSize);
    });
  });
});
