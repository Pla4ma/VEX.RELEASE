import { VALID_DEEP_LINK_PATHS } from '../deep-link-types';

describe('deep-link-types', () => {
  it('contains all expected deep link paths', () => {
    expect(VALID_DEEP_LINK_PATHS).toContain('session');
    expect(VALID_DEEP_LINK_PATHS).toContain('boss');
    expect(VALID_DEEP_LINK_PATHS).toContain('duels');
    expect(VALID_DEEP_LINK_PATHS).toContain('squad');
    expect(VALID_DEEP_LINK_PATHS).toContain('profile');
    expect(VALID_DEEP_LINK_PATHS).toContain('settings');
    expect(VALID_DEEP_LINK_PATHS).toContain('invite');
    expect(VALID_DEEP_LINK_PATHS).toContain('study');
    expect(VALID_DEEP_LINK_PATHS).toContain('coach');
    expect(VALID_DEEP_LINK_PATHS).toContain('shop');
    expect(VALID_DEEP_LINK_PATHS).toContain('rescue');
  });

  it('has exactly 12 valid deep link paths', () => {
    expect(VALID_DEEP_LINK_PATHS).toHaveLength(12);
  });

  it('contains only unique paths', () => {
    const unique = new Set(VALID_DEEP_LINK_PATHS);
    expect(unique.size).toBe(VALID_DEEP_LINK_PATHS.length);
  });
});
