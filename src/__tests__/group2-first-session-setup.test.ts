import {
  experience,
  firstWeek,
  accessFor,
  assertFullyHidden,
  assertCoreAvailable,
  getFeatureAvailability,
} from './product-journey-debloat-personalization-helpers';

describe('Group 2 — First Session Setup', () => {
  it('2a: first session setup shows only mode/duration/start', () => {
    const f0 = accessFor(0);

    assertCoreAvailable(f0, 'focus_session');
    assertCoreAvailable(f0, 'focus_tab');
    assertFullyHidden(f0, 'challenges');
    assertFullyHidden(f0, 'wagers');
    assertFullyHidden(f0, 'streak_insurance');
    expect(getFeatureAvailability(f0.premium_paywall).canNavigate).toBe(false);
  });

  it('2b: study user gets Study default', () => {
    const exp = experience('study_focused');
    expect(exp.sessionDefaults.mode).toBe('STUDY');
    expect(exp.studyLayerLabel).toBe('Study OS');
  });

  it('2c: focus user gets Focus/Deep Work default', () => {
    const fw = firstWeek();
    expect(fw.studyLayerLabel).toBe('Deep Work Plan');

    const exp = experience('calm');
    expect(exp.sessionDefaults.mode).toBe('FOCUS');
  });

  it('2d: game-like user gets subtle boss copy but no boss config', () => {
    const fw = firstWeek({
      motivationStyle: 'game_like',
      featureAvailability: { boss: true, premium: false, social: false, study: true },
    });

    expect(fw.bossIntensity).toBe('tiny_tease');
    expect(fw.allowedHomeSurfaces).not.toContain('boss_full');

    const exp = experience('game_like');
    expect(exp.boss.systemsDisabled).toEqual(
      expect.arrayContaining(['shop', 'inventory', 'premium_currency']),
    );
  });

  it('2e: no stakes/difficulty/premium/challenges in first session setup', () => {
    const f0 = accessFor(0);
    assertFullyHidden(f0, 'challenges');
    assertFullyHidden(f0, 'wagers');
    expect(getFeatureAvailability(f0.premium_paywall).canNavigate).toBe(false);

    const fw = firstWeek();
    expect(fw.hiddenSurfaces).toContain('premium_hard_sell');
  });
});
