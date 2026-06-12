import { getContrastRatio, auditColorContrast } from '../contrast-checker';

describe('contrast-checker', () => {
  describe('getContrastRatio', () => {
    it('calculates correct ratio for black on white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).not.toBeNull();
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('calculates correct ratio for white on black', () => {
      const ratio = getContrastRatio('#ffffff', '#000000');
      expect(ratio).not.toBeNull();
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('returns same ratio regardless of argument order', () => {
      const ratio1 = getContrastRatio('#ff0000', '#000000');
      const ratio2 = getContrastRatio('#000000', '#ff0000');
      expect(ratio1).toBeCloseTo(ratio2!, 2);
    });

    it('returns null for invalid hex', () => {
      expect(getContrastRatio('not-a-color', '#ffffff')).toBeNull();
      expect(getContrastRatio('#ffffff', 'not-a-color')).toBeNull();
    });

    it('returns null for wrong-length hex', () => {
      expect(getContrastRatio('#fff', '#ffffff')).toBeNull();
      expect(getContrastRatio('#gggggg', '#ffffff')).toBeNull();
    });

    it('returns ratio of 1 for same color', () => {
      const ratio = getContrastRatio('#808080', '#808080');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('calculates low contrast for similar colors', () => {
      const ratio = getContrastRatio('#777777', '#888888');
      expect(ratio).not.toBeNull();
      expect(ratio!).toBeLessThan(2);
    });
  });

  describe('auditColorContrast', () => {
    it('returns empty array when all pairs meet WCAG AA', () => {
      const pairs = [
        { background: '#ffffff', foreground: '#000000', label: 'black on white' },
      ];
      const failures = auditColorContrast(pairs);
      expect(failures).toEqual([]);
    });

    it('returns failure for low contrast pairs', () => {
      const pairs = [
        { background: '#aaaaaa', foreground: '#bbbbbb', label: 'gray on gray' },
      ];
      const failures = auditColorContrast(pairs);
      expect(failures.length).toBeGreaterThan(0);
      expect(failures[0]).toContain('gray on gray');
      expect(failures[0]).toContain('contrast');
    });

    it('handles multiple pairs', () => {
      const pairs = [
        { background: '#ffffff', foreground: '#000000', label: 'good' },
        { background: '#aaaaaa', foreground: '#bbbbbb', label: 'bad' },
      ];
      const failures = auditColorContrast(pairs);
      expect(failures.length).toBe(1);
      expect(failures[0]).toContain('bad');
    });
  });
});
