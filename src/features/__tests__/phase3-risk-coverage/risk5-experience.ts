import {
  resolveFirstWeekExperience,
  decideNudge,
  baseLaneProfile,
  baseStats,
} from './helpers';
import type { FirstWeekResolverInput } from './helpers';

describe('Risk 5 — Experience Resolution', () => {
  it('resolveFirstWeekExperience stages through all days', () => {
    const base: Partial<FirstWeekResolverInput> = {
      behaviorStats: baseStats,
      daysSinceLastSession: null,
      featureAvailability: {
        boss: false,
        premium: false,
        social: false,
        study: true,
      },
      motivationStyle: 'study_focused',
      premiumState: 'unavailable',
      primaryGoal: 'study',
      laneProfile: baseLaneProfile({ primaryLane: 'student' }),
    };
    const day0 = resolveFirstWeekExperience({
      ...base,
      completedSessions: 0,
      daysSinceOnboarding: 0,
    } as FirstWeekResolverInput);
    expect(day0.currentDayStage).toBe('DAY_0_NOT_STARTED');
    const day3 = resolveFirstWeekExperience({
      ...base,
      completedSessions: 3,
      daysSinceOnboarding: 3,
    } as FirstWeekResolverInput);
    expect(day3.currentDayStage).toBe('DAY_3_COMPANION_CONNECTION');
    const day7 = resolveFirstWeekExperience({
      ...base,
      completedSessions: 7,
      daysSinceOnboarding: 7,
    } as FirstWeekResolverInput);
    expect(day7.currentDayStage).toBe('DAY_7_DEEPER_MODE');
    const post = resolveFirstWeekExperience({
      ...base,
      completedSessions: 10,
      daysSinceOnboarding: 14,
    } as FirstWeekResolverInput);
    expect(post.currentDayStage).toBe('POST_DAY_7');
  });

  it('Clean end-to-end: max 1 notif, no boss', () => {
    const day0 = resolveFirstWeekExperience({
      behaviorStats: baseStats,
      completedSessions: 0,
      daysSinceLastSession: null,
      daysSinceOnboarding: 0,
      featureAvailability: {
        boss: false,
        premium: false,
        social: false,
        study: false,
      },
      motivationStyle: 'calm',
      premiumState: 'unavailable',
      primaryGoal: 'work',
      laneProfile: baseLaneProfile({ primaryLane: 'minimal_normal' }),
    });
    expect(day0.allowedHomeSurfaces).not.toContain('tiny_boss_teaser');
    const nudge = decideNudge({
      lane: 'minimal_normal',
      completedSessions: 3,
      daysSinceOnboarding: 3,
      sentToday: 1,
      recentDismissals: 0,
      quietHoursActive: false,
      userMuted: false,
      manuallyScheduled: false,
      now: Date.now(),
      context: 'none',
      pausedCategories: [],
    });
    expect(nudge.allowed).toBe(false);
  });

  it('comeback state progression: none → missed_1 → missed_week → long_gap', () => {
    const base: Partial<FirstWeekResolverInput> = {
      behaviorStats: baseStats,
      featureAvailability: {
        boss: false,
        premium: false,
        social: false,
        study: true,
      },
      motivationStyle: 'coach_led',
      premiumState: 'unavailable',
      primaryGoal: 'work',
      completedSessions: 0,
      daysSinceOnboarding: 0,
    };
    expect(
      resolveFirstWeekExperience({
        ...base,
        daysSinceLastSession: 0,
      } as FirstWeekResolverInput).comebackState,
    ).toBe('none');
    expect(
      resolveFirstWeekExperience({
        ...base,
        daysSinceLastSession: 2,
      } as FirstWeekResolverInput).comebackState,
    ).toBe('missed_1_day');
    expect(
      resolveFirstWeekExperience({
        ...base,
        daysSinceLastSession: 7,
      } as FirstWeekResolverInput).comebackState,
    ).toBe('missed_week');
    expect(
      resolveFirstWeekExperience({
        ...base,
        daysSinceLastSession: 30,
      } as FirstWeekResolverInput).comebackState,
    ).toBe('returning_after_long_gap');
  });

  it('final release: economy surfaces permanently hidden', () => {
    for (const sessions of [0, 3, 7, 10]) {
      const result = resolveFirstWeekExperience({
        behaviorStats: baseStats,
        completedSessions: sessions,
        daysSinceLastSession: null,
        daysSinceOnboarding: sessions,
        featureAvailability: {
          boss: true,
          premium: true,
          social: true,
          study: true,
        },
        motivationStyle: 'coach_led',
        premiumState: 'configured',
        primaryGoal: 'work',
      });
      const blocked = [
        'shop',
        'inventory',
        'battle_pass',
        'wagers',
        'rivals',
        'squads',
        'leaderboards',
        'premium_currency',
        'premium_hard_sell',
        'advanced_economy',
      ];
      for (const b of blocked) {
        expect(result.hiddenSurfaces).toContain(
          b as (typeof result.hiddenSurfaces)[number],
        );
      }
    }
  });
});
