/**
 * Tests for boss display-policy
 */

import {
  shouldShowBossPreview,
  isCombatAllowed,
  isBossVisibleAtSurface,
  useBossDisplayPolicy,
  getBossDisplayCopy,
  isBossVisibleAtHome,
} from '../display-policy';

describe('display-policy', () => {
  it('shouldShowBossPreview returns false', () => {
    expect(shouldShowBossPreview()).toBe(false);
  });

  it('isCombatAllowed returns false', () => {
    expect(isCombatAllowed()).toBe(false);
  });

  it('isCombatAllowed ignores policy argument', () => {
    expect(isCombatAllowed({ some: 'policy' })).toBe(false);
  });

  it('isBossVisibleAtSurface returns false', () => {
    expect(isBossVisibleAtSurface()).toBe(false);
  });

  it('useBossDisplayPolicy returns not visible and combat not allowed', () => {
    const policy = useBossDisplayPolicy();
    expect(policy.isVisible).toBe(false);
    expect(policy.combatAllowed).toBe(false);
  });

  it('useBossDisplayPolicy ignores context argument', () => {
    const policy = useBossDisplayPolicy('home');
    expect(policy.isVisible).toBe(false);
    expect(policy.combatAllowed).toBe(false);
  });

  it('getBossDisplayCopy returns empty title and subtitle', () => {
    const copy = getBossDisplayCopy();
    expect(copy.title).toBe('');
    expect(copy.subtitle).toBe('');
  });

  it('isBossVisibleAtHome is false', () => {
    expect(isBossVisibleAtHome).toBe(false);
  });
});
