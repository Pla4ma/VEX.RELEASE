import { buildSquadCode, buildSquadShareMessage, parseSquadCodeFromUrl } from '../share';

describe('squads share utilities', () => {
  describe('buildSquadCode', () => {
    it('returns first 8 characters of squad ID', () => {
      expect(buildSquadCode('123e4567-e89b-12d3-a456-426614174000')).toBe('123e4567');
      expect(buildSquadCode('abcdefghijklmnop')).toBe('abcdefgh');
    });

    it('handles short IDs', () => {
      expect(buildSquadCode('abc')).toBe('abc');
    });
  });

  describe('buildSquadShareMessage', () => {
    it('includes squad name, focus hours, and URL', () => {
      const message = buildSquadShareMessage(
        { name: 'Focus Squad', focusHours: 12 },
        'abc12345'
      );
      expect(message).toContain('Focus Squad');
      expect(message).toContain('12h');
      expect(message).toContain('https://vex.app/squad/abc12345');
    });

    it('formats focus hours correctly', () => {
      const message = buildSquadShareMessage(
        { name: 'Squad', focusHours: 1 },
        'code1234'
      );
      expect(message).toContain('1h');
    });
  });

  describe('parseSquadCodeFromUrl', () => {
    it('extracts squad code from valid URL', () => {
      expect(parseSquadCodeFromUrl('https://vex.app/squad/abc12345')).toBe('abc12345');
      expect(parseSquadCodeFromUrl('https://vex.app/squad/XYZ78901')).toBe('XYZ78901');
    });

    it('handles URLs with trailing path', () => {
      expect(parseSquadCodeFromUrl('https://vex.app/squad/abc12345/join')).toBe('abc12345');
    });

    it('returns null for invalid URLs', () => {
      expect(parseSquadCodeFromUrl('https://vex.app/other/abc12345')).toBeNull();
      expect(parseSquadCodeFromUrl('https://other.app/squad/abc12345')).toBeNull();
      expect(parseSquadCodeFromUrl('not-a-url')).toBeNull();
      expect(parseSquadCodeFromUrl('')).toBeNull();
    });

    it('is case insensitive', () => {
      expect(parseSquadCodeFromUrl('https://VEX.APP/SQUAD/abc12345')).toBe('abc12345');
    });
  });
});