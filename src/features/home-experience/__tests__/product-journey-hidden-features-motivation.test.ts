import { buildHomeExperienceModel } from '../service';
import { decideHomeSurfaces } from '../home-surface-decision';
import {
  featureAvailability, calmProfile, baseStats, visibleNonHidden,
} from './product-journey-helpers';

describe('product journey — final release hidden features', () => {
  it('does not expose shop inventory battle_pass social squads rivals', () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: null,
      totalCompletedSessions: 25,
    });
    expect(model.mustNotRun).toContain('locked_route_registration');
    expect(model.mustNotRun).not.toContain('boss_query');

    const visible = visibleNonHidden(
      decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: calmProfile,
        behaviorStats: {
          ...baseStats(25),
          completionStreak: 10,
          coachInteractions: 8,
          studyUsageRatio: 0.2,
        },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      }),
    );
    const hasForbidden = visible.some((s) =>
      ['shop', 'inventory', 'battle_pass', 'social', 'squads', 'rivals'].some((fw) =>
        s.includes(fw),
      ),
    );
    expect(hasForbidden).toBe(false);
  });
});

describe('product journey — motivation style progression', () => {
  it.each([
    [0, 0, 'none'],
    [1, 0, 'progress_rhythm'],
    [3, 0, 'progress_rhythm'],
    [5, 0, 'progress_rhythm'],
    [10, 0, 'progress_rhythm'],
  ] as const)('calm user at %i sessions gets spotlight: %s', (sessions, _streak, expected) => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'calm',
      totalCompletedSessions: sessions,
    });
    expect(model.spotlight).toBe(expected);
  });

  it.each([
    [0, 'none'],
    [5, 'study'],
    [12, 'study'],
  ] as const)('study_focused user at %i sessions gets spotlight: %s', (sessions, expected) => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'study_focused',
      totalCompletedSessions: sessions,
    });
    expect(model.spotlight).toBe(expected);
  });

  it.each([
    [0, 'none'],
    [1, 'progress_rhythm'],
    [5, 'boss_progress'],
    [12, 'boss_progress'],
  ] as const)('game_like user at %i sessions gets spotlight: %s', (sessions, expected) => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'game_like',
      totalCompletedSessions: sessions,
    });
    expect(model.spotlight).toBe(expected);
  });

  it.each([
    [0, 'none'],
    [1, 'progress_rhythm'],
    [5, 'coach'],
    [12, 'coach'],
  ] as const)('coach_led user at %i sessions gets spotlight: %s', (sessions, expected) => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'coach_led',
      totalCompletedSessions: sessions,
    });
    expect(model.spotlight).toBe(expected);
  });
});
