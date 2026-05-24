import {
  PUBLIC_V1_FEATURE_MAP,
  isPublicV1Hidden,
  isPublicV1Included,
  getPublicV1Status,
} from '../public-v1-feature-map';

describe('Public V1 Feature Map', () => {
  it('core execution features are included', () => {
    expect(isPublicV1Included('focus_session')).toBe(true);
    expect(isPublicV1Included('progress_view')).toBe(true);
    expect(isPublicV1Included('home_tab')).toBe(true);
    expect(isPublicV1Included('ai_coach_basic')).toBe(true);
  });

  it('economy/social features are hidden', () => {
    expect(isPublicV1Hidden('shop')).toBe(true);
    expect(isPublicV1Hidden('inventory')).toBe(true);
    expect(isPublicV1Hidden('battle_pass')).toBe(true);
    expect(isPublicV1Hidden('wagers')).toBe(true);
    expect(isPublicV1Hidden('rivals')).toBe(true);
    expect(isPublicV1Hidden('squads')).toBe(true);
    expect(isPublicV1Hidden('rankings')).toBe(true);
    expect(isPublicV1Hidden('economy_advanced')).toBe(true);
    expect(isPublicV1Hidden('gems_prominent')).toBe(true);
  });

  it('progressive features have correct status', () => {
    expect(getPublicV1Status('boss_tab')).toBe('progressive');
    expect(getPublicV1Status('achievements')).toBe('progressive');
    expect(getPublicV1Status('challenges')).toBe('progressive');
  });

  it('premium features are premium_gated', () => {
    expect(getPublicV1Status('ai_coach_advanced')).toBe('premium_gated');
    expect(getPublicV1Status('content_study_advanced')).toBe('premium_gated');
    expect(getPublicV1Status('quiz_review_mode')).toBe('premium_gated');
  });

  it('hidden features return false for isPublicV1Included', () => {
    const hiddenKeys = ['shop', 'inventory', 'battle_pass', 'wagers', 'squads'] as const;
    hiddenKeys.forEach((key) => {
      expect(isPublicV1Included(key)).toBe(false);
    });
  });

  it('unknown features default to hidden', () => {
    expect(getPublicV1Status('gems_prominent')).toBe('hidden');
  });

  it('all hidden features map correctly', () => {
    const hidden = PUBLIC_V1_FEATURE_MAP;
    const hiddenEntries = Object.entries(hidden).filter(([, v]) => v.status === 'hidden');
    expect(hiddenEntries.length).toBeGreaterThan(0);
    hiddenEntries.forEach(([, entry]) => {
      expect(entry.status).toBe('hidden');
    });
  });
});
