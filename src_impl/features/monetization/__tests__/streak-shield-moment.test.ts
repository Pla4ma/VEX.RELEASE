import {
  STREAK_SHIELD_COPY,
  assessStreakShieldMoment,
} from '../service';

const now = Date.UTC(2026, 4, 20, 12);

describe('streak shield monetization moment', () => {
  it('shows the moment only for free users with a 5 day A/S session streak', () => {
    const result = assessStreakShieldMoment({
      finalScore: 91,
      isPremium: false,
      lastShownAt: null,
      lastShownSessionId: null,
      now,
      paywallShownThisSession: false,
      sessionId: 'session-1',
      streakDays: 5,
      userId: 'user-1',
    });

    expect(result.shouldShow).toBe(true);
    expect(result.copy).toEqual(STREAK_SHIELD_COPY);
    expect(result.routeParams).toEqual({
      contextBody: STREAK_SHIELD_COPY.body,
      contextCta: STREAK_SHIELD_COPY.cta,
      contextHeadline: STREAK_SHIELD_COPY.headline,
      gatedFeature: 'streak_freeze',
      source: 'post_session_streak_shield',
    });
  });

  it('suppresses premium users, weak grades, short streaks, current-session repeats, and cooldowns', () => {
    const base = {
      finalScore: 91,
      isPremium: false,
      lastShownAt: null,
      lastShownSessionId: null,
      now,
      paywallShownThisSession: false,
      sessionId: 'session-1',
      streakDays: 5,
      userId: 'user-1',
    };

    expect(assessStreakShieldMoment({ ...base, isPremium: true }).reason).toBe('premium');
    expect(assessStreakShieldMoment({ ...base, finalScore: 83 }).reason).toBe('grade');
    expect(assessStreakShieldMoment({ ...base, streakDays: 4 }).reason).toBe('streak');
    expect(assessStreakShieldMoment({ ...base, paywallShownThisSession: true }).reason).toBe('session');
    expect(assessStreakShieldMoment({ ...base, lastShownSessionId: 'session-1' }).reason).toBe('session');
    expect(assessStreakShieldMoment({ ...base, lastShownAt: now - 60_000 }).reason).toBe('cooldown');
  });
});
