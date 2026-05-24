import { resolveFirstWeekExperience } from '../first-week-service';
import type { FirstWeekResolverInput } from '../first-week-schemas';

const baseInput: FirstWeekResolverInput = {
  behaviorStats: {
    bossEngagement: 'none',
    studyUsageRatio: 0,
  },
  completedSessions: 0,
  daysSinceLastSession: null,
  daysSinceOnboarding: 0,
  featureAvailability: {
    boss: false,
    premium: false,
    social: false,
    study: true,
  },
  motivationStyle: 'calm',
  premiumState: 'unavailable',
  primaryGoal: 'work',
};

describe('resolveFirstWeekExperience', () => {
  it('keeps a zero-session calm user focused on first session only', () => {
    const result = resolveFirstWeekExperience(baseInput);

    expect(result.currentDayStage).toBe('DAY_0_NOT_STARTED');
    expect(result.primaryCTA.intent).toBe('START_SESSION');
    expect(result.allowedHomeSurfaces).toEqual([
      'motivation_confirmation',
      'coach_presence_line',
      'start_session',
      'tiny_unlock_preview',
    ]);
    expect(result.hiddenSurfaces).toEqual(
      expect.arrayContaining(['boss_full', 'shop', 'inventory', 'squads', 'premium_hard_sell']),
    );
    expect(result.bossIntensity).toBe('hidden');
    expect(result.premiumMoment).toBe('none');
  });

  it('allows only a tiny boss teaser on day zero for game-like users', () => {
    const result = resolveFirstWeekExperience({
      ...baseInput,
      motivationStyle: 'game_like',
      featureAvailability: { ...baseInput.featureAvailability, boss: true },
    });

    expect(result.currentDayStage).toBe('DAY_0_NOT_STARTED');
    expect(result.spotlightSurface).toBe('tiny_boss_teaser');
    expect(result.bossIntensity).toBe('tiny_tease');
    expect(result.allowedHomeSurfaces).not.toContain('boss_full');
  });

  it('uses session count before calendar age when data conflicts', () => {
    const result = resolveFirstWeekExperience({
      ...baseInput,
      completedSessions: 0,
      daysSinceOnboarding: 8,
    });

    expect(result.currentDayStage).toBe('DAY_0_NOT_STARTED');
    expect(result.primaryCTA.label).toBe('Start first session');
  });

  it('forms a path after five sessions without a hard premium sell', () => {
    const result = resolveFirstWeekExperience({
      ...baseInput,
      completedSessions: 5,
      daysSinceOnboarding: 5,
      featureAvailability: { ...baseInput.featureAvailability, premium: true },
      premiumState: 'configured',
      primaryGoal: 'learning',
    });

    expect(result.currentDayStage).toBe('DAY_5_PATH_FORMING');
    expect(result.studyLayerLabel).toBe('Learning OS');
    expect(result.premiumMoment).toBe('soft_tease');
    expect(result.hiddenSurfaces).toContain('premium_hard_sell');
  });

  it('handles comeback without shame or backlog pressure', () => {
    const result = resolveFirstWeekExperience({
      ...baseInput,
      completedSessions: 3,
      daysSinceLastSession: 7,
      daysSinceOnboarding: 9,
      motivationStyle: 'coach_led',
    });

    expect(result.comebackState).toBe('missed_week');
    expect(result.primaryMessage).toContain('Reset');
    expect(result.primaryMessage).not.toMatch(/failed|behind|lost/i);
    expect(result.allowedHomeSurfaces).toContain('recovery_cta');
  });
});
