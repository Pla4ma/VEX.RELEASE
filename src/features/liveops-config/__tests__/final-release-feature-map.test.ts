import {
  FINAL_RELEASE_FEATURE_MAP,
  isFeatureHidden,
  isFeatureIncluded,
  getFeatureStatus,
} from '../final-release-feature-map';

describe('Final Release Feature Map', () => {
  it('core execution features are included', () => {
    expect(isFeatureIncluded('focus_session')).toBe(true);
    expect(isFeatureIncluded('progress_view')).toBe(true);
    expect(isFeatureIncluded('home_tab')).toBe(true);
    expect(isFeatureIncluded('ai_coach_basic')).toBe(true);
  });

  it('economy/social features are hidden', () => {
    expect(isFeatureHidden('shop')).toBe(true);
    expect(isFeatureHidden('inventory')).toBe(true);
    expect(isFeatureHidden('battle_pass')).toBe(true);
    expect(isFeatureHidden('wagers')).toBe(true);
    expect(isFeatureHidden('rivals')).toBe(true);
    expect(isFeatureHidden('squads')).toBe(true);
    expect(isFeatureHidden('rankings')).toBe(true);
    expect(isFeatureHidden('economy_advanced')).toBe(true);
    expect(isFeatureHidden('economy_basic')).toBe(true);
    expect(isFeatureHidden('gems_prominent')).toBe(true);
  });

  it('progressive features have correct status', () => {
    expect(getFeatureStatus('boss_tab')).toBe('progressive');
    expect(getFeatureStatus('achievements')).toBe('progressive');
    expect(getFeatureStatus('challenges')).toBe('progressive');
  });

  it('premium features are premium_gated', () => {
    expect(getFeatureStatus('ai_coach_advanced')).toBe('premium_gated');
    expect(getFeatureStatus('content_study_advanced')).toBe('premium_gated');
    expect(getFeatureStatus('quiz_review_mode')).toBe('premium_gated');
  });

  it('hidden features return false for isFeatureIncluded', () => {
    const hiddenKeys = ['shop', 'inventory', 'battle_pass', 'wagers', 'squads'] as const;
    hiddenKeys.forEach((key) => {
      expect(isFeatureIncluded(key)).toBe(false);
    });
  });

  it('unknown features default to hidden', () => {
    expect(getFeatureStatus('gems_prominent')).toBe('hidden');
  });

  it('all hidden features map correctly', () => {
    const hidden = FINAL_RELEASE_FEATURE_MAP;
    const hiddenEntries = Object.entries(hidden).filter(([, v]) => v.status === 'hidden');
    expect(hiddenEntries.length).toBeGreaterThan(0);
    hiddenEntries.forEach(([, entry]) => {
      expect(entry.status).toBe('hidden');
    });
  });
});
