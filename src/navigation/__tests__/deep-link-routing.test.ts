import { FEATURE_FLAGS } from '../../constants/features';
import { isDeepLinkDisabled } from '../deep-link-routing';

const ALL_TRUE: Record<string, boolean> = {
  [FEATURE_FLAGS.BASIC_SOLO_BOSS]: true,
  [FEATURE_FLAGS.SQUADS_ACCOUNTABILITY]: true,
};
const ALL_FALSE: Record<string, boolean> = {
  [FEATURE_FLAGS.BASIC_SOLO_BOSS]: false,
  [FEATURE_FLAGS.SQUADS_ACCOUNTABILITY]: false,
};

describe('isDeepLinkDisabled', () => {
  it('returns false for boss when flag is true', () => {
    expect(isDeepLinkDisabled('boss', ALL_TRUE)).toBe(false);
  });

  it('returns true for boss when flag is false', () => {
    expect(isDeepLinkDisabled('boss', ALL_FALSE)).toBe(true);
  });

  it('returns false for paths without feature flags', () => {
    expect(isDeepLinkDisabled('session', ALL_FALSE)).toBe(false);
    expect(isDeepLinkDisabled('duels', ALL_FALSE)).toBe(false);
    expect(isDeepLinkDisabled('squad', ALL_FALSE)).toBe(false);
    expect(isDeepLinkDisabled('invite', ALL_FALSE)).toBe(false);
    expect(isDeepLinkDisabled('profile', ALL_FALSE)).toBe(false);
    expect(isDeepLinkDisabled('settings', ALL_FALSE)).toBe(false);
    expect(isDeepLinkDisabled('study', ALL_FALSE)).toBe(false);
    expect(isDeepLinkDisabled('coach', ALL_FALSE)).toBe(false);
    expect(isDeepLinkDisabled('shop', ALL_FALSE)).toBe(false);
  });
});
