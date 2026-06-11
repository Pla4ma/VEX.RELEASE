import {
  getDegradedBlockedSurfaces,
  getDegradedFallbackSurface,
  shouldBlockFullSurface,
  FINAL_RELEASE_INCLUDED_SYSTEMS,
  FINAL_RELEASE_HIDDEN_SYSTEMS,
} from '../FeatureFlagService';

describe('FeatureFlagService — degraded surfaces', () => {
  it('returns blocked surfaces for degraded features', () => {
    const result = getDegradedBlockedSurfaces(['premium_paywall']);
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns empty array for empty input', () => {
    expect(getDegradedBlockedSurfaces([])).toEqual([]);
  });

  it('blocks full surface for degraded feature with config', () => {
    expect(shouldBlockFullSurface('premium_paywall', true)).toBe(true);
  });

  it('does not block full surface for non-degraded feature', () => {
    expect(shouldBlockFullSurface('premium_paywall', false)).toBe(false);
  });

  it('returns fallback surface for known degraded feature', () => {
    const result = getDegradedFallbackSurface('premium_paywall');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('returns start_session for unknown feature', () => {
    expect(getDegradedFallbackSurface('content_study')).toBe('start_session');
  });
});

describe('FeatureFlagService — final release constants', () => {
  it('has non-empty included systems list', () => {
    expect(FINAL_RELEASE_INCLUDED_SYSTEMS.length).toBeGreaterThan(0);
  });

  it('has non-empty hidden systems list', () => {
    expect(FINAL_RELEASE_HIDDEN_SYSTEMS.length).toBeGreaterThan(0);
  });

  it('includes core systems in included list', () => {
    const included = FINAL_RELEASE_INCLUDED_SYSTEMS as readonly string[];
    expect(included).toContain('start_session');
    expect(included).toContain('session_completion');
  });
});