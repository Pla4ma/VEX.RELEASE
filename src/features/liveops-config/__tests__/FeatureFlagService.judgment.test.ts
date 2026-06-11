import {
  isFeatureHidden,
  isFeatureIncluded,
  getFeatureStatus,
} from '../FeatureFlagService';

describe('FeatureFlagService — feature judgment', () => {
  it('returns true for hidden features', () => {
    expect(isFeatureHidden('shop')).toBe(true);
    expect(isFeatureHidden('inventory')).toBe(true);
    expect(isFeatureHidden('battle_pass')).toBe(true);
  });

  it('returns false for non-hidden features', () => {
    expect(isFeatureHidden('boss_tab')).toBe(false);
    expect(isFeatureHidden('challenges')).toBe(false);
  });

  it('returns false for hidden features (isFeatureIncluded)', () => {
    expect(isFeatureIncluded('shop')).toBe(false);
  });

  it('returns true for included features', () => {
    expect(isFeatureIncluded('focus_session')).toBe(true);
  });

  it('returns false for progressive features', () => {
    expect(isFeatureIncluded('boss_tab')).toBe(false);
  });

  it('returns false for premium_gated features', () => {
    expect(isFeatureIncluded('ai_coach_advanced')).toBe(false);
  });

  it('returns hidden status for hidden features', () => {
    expect(getFeatureStatus('shop')).toBe('hidden');
  });

  it('returns included for included features', () => {
    expect(getFeatureStatus('focus_session')).toBe('included');
  });

  it('returns progressive for progressive features', () => {
    expect(getFeatureStatus('boss_tab')).toBe('progressive');
  });

  it('returns premium_gated for premium_gated features', () => {
    expect(getFeatureStatus('ai_coach_advanced')).toBe('premium_gated');
  });
});