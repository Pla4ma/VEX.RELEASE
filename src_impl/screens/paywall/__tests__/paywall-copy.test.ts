import { FEATURE_HIGHLIGHT_MAP, FREE_BOUNDARY_COPY, PREMIUM_FEATURES } from '../paywall-copy';

describe('paywall copy', () => {
  it('sells deeper personalization instead of rewards or economy', () => {
    const joined = [
      FREE_BOUNDARY_COPY,
      ...PREMIUM_FEATURES.flatMap((feature) => [feature.title, feature.description]),
      ...Object.values(FEATURE_HIGHLIGHT_MAP).flatMap((feature) => [feature.title, feature.benefit]),
    ].join(' ');

    expect(joined).toContain('Core sessions');
    expect(joined).toMatch(/coach memory|progress intelligence|execution system/i);
    expect(joined).not.toMatch(/xp boost|season rewards|reward boost|streak protection|premium rewards/i);
  });
});
