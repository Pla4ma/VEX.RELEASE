// Test the isPlaceholderKey logic from revenuecat-service.ts
// Since it's a private function, we test it by replicating the logic

const PLACEHOLDER_PATTERN = /^(your[_\-].*|test[_\-].*|placeholder|REPLACE_ME|TODO|rc_(sk|pub)_(test|live)_)/i;

function isPlaceholderKey(key: string | undefined): boolean {
  if (!key || key.length === 0) {return true;}
  return PLACEHOLDER_PATTERN.test(key.trim());
}

describe('isPlaceholderKey (from revenuecat-service)', () => {
  it('returns true for undefined key', () => {
    expect(isPlaceholderKey(undefined)).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isPlaceholderKey('')).toBe(true);
  });

  it('returns true for "your_*" keys', () => {
    expect(isPlaceholderKey('your_ios_key')).toBe(true);
    expect(isPlaceholderKey('your-android-key')).toBe(true);
    expect(isPlaceholderKey('your_key_here')).toBe(true);
  });

  it('returns true for "test_*" keys', () => {
    expect(isPlaceholderKey('test_key')).toBe(true);
    expect(isPlaceholderKey('test-key')).toBe(true);
  });

  it('returns true for "placeholder"', () => {
    expect(isPlaceholderKey('placeholder')).toBe(true);
    expect(isPlaceholderKey('PLACEHOLDER')).toBe(true);
  });

  it('returns true for "REPLACE_ME"', () => {
    expect(isPlaceholderKey('REPLACE_ME')).toBe(true);
    expect(isPlaceholderKey('replace_me')).toBe(true);
  });

  it('returns true for "TODO"', () => {
    expect(isPlaceholderKey('TODO')).toBe(true);
    expect(isPlaceholderKey('todo')).toBe(true);
  });

  it('returns true for rc_sk_test_* / rc_pub_live_* patterns', () => {
    expect(isPlaceholderKey('rc_sk_test_abc123')).toBe(true);
    expect(isPlaceholderKey('rc_pub_live_xyz789')).toBe(true);
  });

  it('returns false for real-looking API keys', () => {
    expect(isPlaceholderKey('live_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456')).toBe(false);
    expect(isPlaceholderKey('pub_1234567890abcdef1234567890abcdef')).toBe(false);
    expect(isPlaceholderKey('appl_1234567890')).toBe(false);
    expect(isPlaceholderKey('goog_abcdefghijklmnop')).toBe(false);
  });

  it('trims whitespace before testing', () => {
    expect(isPlaceholderKey('  your_key  ')).toBe(true);
    expect(isPlaceholderKey('  real_key  ')).toBe(false);
  });
});
