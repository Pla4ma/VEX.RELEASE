import {
  experience,
  firstWeek,
  accessFor,
  assertFullyHidden,
} from './debloat-test-helpers';
import { getFeatureAvailability } from '../features/liveops-config/feature-access';

describe('Group 2 — First Session Setup', () => {
  it('2a: first session setup shows only mode/duration/start', () => {
    const f0 = accessFor(0);

    expect(getFeatureAvailability(f0.focus_session).canRenderEntryPoint).toBe(
      true,
    );
    expect(getFeatureAvailability(f0.focus_session).canNavigate).toBe(true);
    expect(getFeatureAvailability(f0.focus_session).canQuery).toBe(true);
    assertFullyHidden(f0, 'challenges');
    assertFullyHidden(f0, 'wagers');
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
      featureAvailability: {
        boss: true,
        premium: false,
        social: false,
        study: true,
      },
    });

    expect(fw.bossIntensity).toBe('tiny_tease');
    expect(fw.allowedHomeSurfaces).not.toContain('boss_full');

    const exp = experience('game_like');
    expect(exp.boss.systemsDisabled).toEqual([]);
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
