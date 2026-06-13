import {
  generateDeepLink,
  generateInviteLink,
  generateSessionShareLink,
  generateProfileShareLink,
  validateInviteCode,
} from '../deep-link-utils';

describe('generateDeepLink', () => {
  it('generates basic deep link without params', () => {
    expect(generateDeepLink('session')).toBe('vex://session');
  });

  it('generates deep link with query params', () => {
    const link = generateDeepLink('session', { id: 'abc123' });
    expect(link).toBe('vex://session?id=abc123');
  });

  it('encodes special characters in params', () => {
    const link = generateDeepLink('session', { name: 'hello world' });
    expect(link).toBe('vex://session?name=hello%20world');
  });

  it('handles multiple params', () => {
    const link = generateDeepLink('profile', { userId: '123', tab: 'stats' });
    expect(link).toContain('vex://profile?');
    expect(link).toContain('userId=123');
    expect(link).toContain('tab=stats');
  });
});

describe('generateInviteLink', () => {
  it('generates invite link with squad ID and code', () => {
    const link = generateInviteLink('squad-123', 'ABC12345');
    expect(link).toBe('https://vex.app/invite/squad/squad-123?code=ABC12345');
  });
});

describe('generateSessionShareLink', () => {
  it('generates session share link', () => {
    const link = generateSessionShareLink('sess-456');
    expect(link).toBe('https://vex.app/session/sess-456');
  });
});

describe('generateProfileShareLink', () => {
  it('generates profile share link', () => {
    const link = generateProfileShareLink('user-789');
    expect(link).toBe('https://vex.app/profile/user-789');
  });
});

describe('validateInviteCode', () => {
  it('validates correct 8-char alphanumeric codes', () => {
    expect(validateInviteCode('ABC12345')).toBe(true);
    expect(validateInviteCode('12345678')).toBe(true);
    expect(validateInviteCode('ABCDEFGH')).toBe(true);
  });

  it('rejects codes shorter than 8 chars', () => {
    expect(validateInviteCode('ABC1234')).toBe(false);
  });

  it('rejects codes longer than 8 chars', () => {
    expect(validateInviteCode('ABC123456')).toBe(false);
  });

  it('rejects codes with lowercase letters', () => {
    expect(validateInviteCode('abc12345')).toBe(false);
  });

  it('rejects codes with special characters', () => {
    expect(validateInviteCode('ABC-1234')).toBe(false);
    expect(validateInviteCode('ABC 1234')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateInviteCode('')).toBe(false);
  });
});
