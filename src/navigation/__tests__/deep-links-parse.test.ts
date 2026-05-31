import {
  deepLinkToNavigationParams,
  parseDeepLink,
} from '../deep-links';
describe('Deep Links – parsing and navigation', () => {
  describe('parseDeepLink', () => {
    it('parses valid vex:// URL', () => {
      const result = parseDeepLink('vex://session?presetId=123');
      expect(result.valid).toBe(true);
      expect(result.link?.path).toBe('session');
      expect(result.link?.params.presetId).toBe('123');
    });
    it('parses valid https:// URL', () => {
      const result = parseDeepLink('https://vex.app/boss');
      expect(result.valid).toBe(true);
      expect(result.link?.path).toBe('boss');
    });
    it('returns error for invalid scheme', () => {
      const result = parseDeepLink('ftp://vex.app/session');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
    it('returns error for unknown path', () => {
      const result = parseDeepLink('vex://unknown-path');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unknown path');
    });
    it('returns error for invalid URL', () => {
      const result = parseDeepLink('not-a-valid-url');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid URL format');
    });
    it('parses path parameters', () => {
      const result = parseDeepLink('vex://profile/user-123');
      expect(result.valid).toBe(true);
      expect(result.link?.path).toBe('profile');
      expect(result.link?.params.userId).toBe('user-123');
    });
    it('parses query parameters', () => {
      const result = parseDeepLink('vex://invite?code=ABC12345');
      expect(result.valid).toBe(true);
      expect(result.link?.path).toBe('invite');
      expect(result.link?.params.code).toBe('ABC12345');
    });
  });
  describe('deepLinkToNavigationParams', () => {
    it('converts session link', () => {
      const result = deepLinkToNavigationParams({
        path: 'session',
        params: { presetId: '123', comebackMultiplier: '2' },
        query: { presetId: '123' },
      });
      expect(result).not.toBeNull();
      expect(result?.screen).toBe('SessionStack');
    });
    it('converts boss link', () => {
      const result = deepLinkToNavigationParams({
        path: 'boss',
        params: {},
        query: {},
      });
      expect(result?.screen).toBe('Main');
    });
    it('converts duels link', () => {
      const result = deepLinkToNavigationParams({
        path: 'duels',
        params: { duelId: 'duel-123' },
        query: {},
      });
      expect(result?.screen).toBe('Main');
    });
    it('converts squad link', () => {
      const result = deepLinkToNavigationParams({
        path: 'squad',
        params: {},
        query: {},
      });
      expect(result?.screen).toBe('Main');
    });
    it('converts profile link', () => {
      const result = deepLinkToNavigationParams({
        path: 'profile',
        params: { userId: 'user-123' },
        query: {},
      });
      expect(result?.screen).toBe('Main');
    });
    it('converts invite link', () => {
      const result = deepLinkToNavigationParams({
        path: 'invite',
        params: { code: 'ABC12345' },
        query: {},
      });
      expect(result?.screen).toBe('Main');
    });
    it('converts shop link', () => {
      const result = deepLinkToNavigationParams({
        path: 'shop',
        params: {},
        query: {},
      });
      expect(result?.screen).toBe('Main');
    });
    it('converts coach link', () => {
      const result = deepLinkToNavigationParams({
        path: 'coach',
        params: {},
        query: {},
      });
      expect(result?.screen).toBe('Main');
    });
    it('converts settings link', () => {
      const result = deepLinkToNavigationParams({
        path: 'settings',
        params: {},
        query: {},
      });
      expect(result?.screen).toBe('Settings');
    });
    it('converts study link', () => {
      const result = deepLinkToNavigationParams({
        path: 'study',
        params: {},
        query: {},
      });
      expect(result?.screen).toBe('SessionStack');
    });
  });
});
