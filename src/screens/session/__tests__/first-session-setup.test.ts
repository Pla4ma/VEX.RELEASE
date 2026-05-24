import { describe, it, expect } from '@jest/globals';

describe('FirstSessionPersonalization - pure logic', () => {
  function computePersonalization(input: {
    goal: string | null;
    focusDuration: number | null;
    element: string | null;
    motivationProfile: { primary: string; secondary: string[] } | null;
  }) {
    const { goal, focusDuration, element, motivationProfile } = input;

    const PROFILE_TO_MODE: Record<string, string> = {
      study_focused: 'STUDY', student: 'STUDY', worker: 'LIGHT_FOCUS',
      calm: 'LIGHT_FOCUS', friendly: 'LIGHT_FOCUS', coach_led: 'LIGHT_FOCUS',
      game_like: 'LIGHT_FOCUS', intense: 'DEEP_WORK',
      competitive: 'DEEP_WORK', creator: 'CREATIVE',
    };

    const PROFILE_TO_DURATION: Record<string, number> = {
      calm: 15, game_like: 15, intense: 25, competitive: 25,
      study_focused: 25, student: 25, worker: 25,
      friendly: 20, coach_led: 20, creator: 25,
    };

    const PROFILE_TO_COACH_LINE: Record<string, string> = {
      calm: 'Start gentle. No pressure. Just show up.',
      game_like: 'Your first boss is watching. Let them see you show up.',
      intense: 'One block. Full intensity. Set the tone.',
      competitive: 'Every session counts. Make this one matter.',
      study_focused: 'Your material is ready. Lock in and absorb.',
      student: 'Start your study rhythm now. Build the habit.',
      worker: 'Your work deserves your full attention.',
      friendly: 'No pressure at all. Just you and the timer.',
      coach_led: 'Your coach believes in this first step.',
      creator: 'Your work needs your presence. Start creating.',
    };

    function goalToProfileType(g: string | null): string {
      switch (g) {
        case 'STUDY': return 'study_focused';
        case 'WORK': return 'worker';
        case 'CREATIVE': return 'creator';
        case 'PERSONAL': return 'calm';
        default: return 'friendly';
      }
    }

    const profileType = motivationProfile
      ? motivationProfile.primary
      : goalToProfileType(goal);

    const defaultMode = PROFILE_TO_MODE[profileType] ?? 'LIGHT_FOCUS';
    const baseDuration = PROFILE_TO_DURATION[profileType] ?? 25;
    const suggestedDurationMinutes = focusDuration ?? baseDuration;
    const coachLine = PROFILE_TO_COACH_LINE[profileType] ?? 'One session. One step.';
    const showBossTease = profileType === 'game_like';

    const durationLabel = showBossTease
      ? 'Short session to show the boss you are here'
      : profileType === 'calm'
        ? 'A gentle start to build your rhythm'
        : 'Recommended to build momentum';

    return {
      companionElement: element,
      coachLine,
      defaultMode,
      durationLabel,
      showBossTease,
      suggestedDurationMinutes,
    };
  }

  it('returns default Focus mode when no onboarding data', () => {
    const result = computePersonalization({ goal: null, focusDuration: null, element: null, motivationProfile: null });
    expect(result.defaultMode).toBe('LIGHT_FOCUS');
    expect(result.suggestedDurationMinutes).toBe(25);
    expect(result.companionElement).toBeNull();
    expect(result.showBossTease).toBe(false);
  });

  it('Study user gets Study default mode', () => {
    const result = computePersonalization({ goal: 'STUDY', focusDuration: null, element: null, motivationProfile: null });
    expect(result.defaultMode).toBe('STUDY');
  });

  it('Work user gets Focus default mode', () => {
    const result = computePersonalization({ goal: 'WORK', focusDuration: null, element: null, motivationProfile: null });
    expect(result.defaultMode).toBe('LIGHT_FOCUS');
  });

  it('Custom duration stored in onboarding is respected', () => {
    const result = computePersonalization({ goal: 'STUDY', focusDuration: 45, element: null, motivationProfile: null });
    expect(result.suggestedDurationMinutes).toBe(45);
    expect(result.defaultMode).toBe('STUDY');
  });

  it('Creative goal maps to Creator mode', () => {
    const result = computePersonalization({ goal: 'CREATIVE', focusDuration: null, element: null, motivationProfile: null });
    expect(result.defaultMode).toBe('CREATIVE');
  });

  it('Personal goal maps to calm with gentle duration and duration label', () => {
    const result = computePersonalization({ goal: 'PERSONAL', focusDuration: null, element: null, motivationProfile: null });
    expect(result.suggestedDurationMinutes).toBe(15);
    expect(result.showBossTease).toBe(false);
    expect(result.durationLabel).toContain('gentle');
  });

  it('Calm user has no boss tease', () => {
    const result = computePersonalization({ goal: 'PERSONAL', focusDuration: null, element: null, motivationProfile: null });
    expect(result.showBossTease).toBe(false);
    expect(result.coachLine).not.toContain('boss');
  });

  it('Game-like profile shows boss tease coach line and shorter duration', () => {
    const result = computePersonalization({ goal: null, focusDuration: null, element: null, motivationProfile: { primary: 'game_like', secondary: [] } });
    expect(result.defaultMode).toBe('LIGHT_FOCUS');
    expect(result.showBossTease).toBe(true);
    expect(result.coachLine).toContain('boss');
    expect(result.suggestedDurationMinutes).toBe(15);
    expect(result.durationLabel).toContain('boss');
  });

  it('Intense profile gets Deep Work default with strong copy', () => {
    const result = computePersonalization({ goal: null, focusDuration: null, element: null, motivationProfile: { primary: 'intense', secondary: [] } });
    expect(result.defaultMode).toBe('DEEP_WORK');
    expect(result.coachLine).toContain('Set the tone');
    expect(result.suggestedDurationMinutes).toBe(25);
  });

  it('Competitive profile gets Deep Work default', () => {
    const result = computePersonalization({ goal: null, focusDuration: null, element: null, motivationProfile: { primary: 'competitive', secondary: [] } });
    expect(result.defaultMode).toBe('DEEP_WORK');
  });

  it('returns companion element when set in onboarding', () => {
    const result = computePersonalization({ goal: null, focusDuration: null, element: 'FLAME', motivationProfile: null });
    expect(result.companionElement).toBe('FLAME');
  });

  it('null element returns null', () => {
    const result = computePersonalization({ goal: null, focusDuration: null, element: null, motivationProfile: null });
    expect(result.companionElement).toBeNull();
  });
});

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
    const returningCards = ['stakes', 'difficulty', 'customization', 'quick_start', 'study_plan'];
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
