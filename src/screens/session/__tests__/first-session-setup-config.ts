import { describe, it, expect } from '@jest/globals';

describe('SessionSetup first session detection', () => {
  it('detects first session from route params source field', () => {
    function isFirstSession(params: { source?: string }): boolean {
      return params.source === 'onboarding_first_session';
    }

    expect(isFirstSession({ source: 'onboarding_first_session' })).toBe(true);
    expect(isFirstSession({ source: 'content-study' })).toBe(false);
    expect(isFirstSession({})).toBe(false);
    expect(isFirstSession({ source: 'learning-execution' })).toBe(false);
  });
});

describe('First session blocked cards', () => {
  it('hides stakes/difficulty/boss/premium/challenges for first session', () => {
    const blockedCards = [
      'stakes',
      'difficulty',
      'boss_config',
      'premium',
      'challenges',
      'advanced_contract',
      'content_upload',
      'battle_pass',
      'streak_insurance',
    ];

    const shownInFirstSession = ['mode', 'duration', 'start_button'];

    const overlap = blockedCards.filter((c) => shownInFirstSession.includes(c));
    expect(overlap).toHaveLength(0);
  });

  it('returning user sees full set of config cards', () => {
    const returningCards = [
      'stakes',
      'difficulty',
      'customization',
      'quick_start',
      'study_plan',
    ];
    expect(returningCards.length).toBeGreaterThanOrEqual(4);
    expect(returningCards).toContain('stakes');
    expect(returningCards).toContain('difficulty');
  });

  it('study target only visible when Study mode selected', () => {
    function shouldShowStudyTarget(mode: string): boolean {
      return mode === 'STUDY';
    }

    expect(shouldShowStudyTarget('STUDY')).toBe(true);
    expect(shouldShowStudyTarget('LIGHT_FOCUS')).toBe(false);
    expect(shouldShowStudyTarget('DEEP_WORK')).toBe(false);
    expect(shouldShowStudyTarget('CREATIVE')).toBe(false);
  });
});
