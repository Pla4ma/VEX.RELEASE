import { describe, it, expect } from '@jest/globals';
import {
  resolveVexExperience,
  makeProfile,
  makeStats,
  defaultAvailability,
} from './personalization.helpers';

describe('Intense user', () => {
  it('gets tactical coach and direct tone', () => {
    const profile = makeProfile({
      motivationStyle: 'intense',
      preferredTone: 'direct',
      coachMode: 'tactical',
    });
    const result = resolveVexExperience(profile, makeStats({ totalCompletedSessions: 10 }), { boss: true, challenges: true, premium: true, study: false });
    expect(result.coachTone).toBe('direct');
    expect(result.bossIntensity).toBe('intense');
  });
});

describe('Coach-led user', () => {
  it('gets mentor coach and strategic tone', () => {
    const profile = makeProfile({
      motivationStyle: 'coach_led',
      preferredTone: 'strategic',
      coachMode: 'mentor',
    });
    const result = resolveVexExperience(profile, makeStats({ totalCompletedSessions: 3 }), defaultAvailability);
    expect(result.coachTone).toBe('strategic');
    expect(result.homeLayoutVariant).toBe('coach_first');
  });
});

describe('Behavior-based adaptations', () => {
  it('user who ignores boss → boss_ignored in adaptations', () => {
    const profile = makeProfile({ motivationStyle: 'game_like' });
    const result = resolveVexExperience(
      profile,
      makeStats({
        totalCompletedSessions: 8,
        completedSessionDurations: [25, 30, 25],
        ignoredFeatures: ['boss_tab'],
      }),
      { boss: true, challenges: true, premium: false, study: false },
    );
    expect(result.behaviorAdaptations).toContain('boss_ignored');
  });

  it('user who uses study heavily → study_heavy in adaptations', () => {
    const profile = makeProfile({ primaryGoal: 'study', motivationStyle: 'study_focused' });
    const result = resolveVexExperience(
      profile,
      makeStats({
        totalCompletedSessions: 5,
        completedSessionDurations: [30, 45, 30, 25, 30],
        studyUsageRatio: 0.7,
      }),
      { boss: true, challenges: true, premium: false, study: true },
    );
    expect(result.behaviorAdaptations).toContain('study_heavy');
  });

  it('user who abandons sessions → abandonment_aware in adaptations', () => {
    const profile = makeProfile({ motivationStyle: 'calm' });
    const result = resolveVexExperience(
      profile,
      makeStats({
        totalCompletedSessions: 5,
        completedSessionDurations: [25, 30, 25],
        abandonedSessionDurations: [10, 5],
      }),
      defaultAvailability,
    );
    expect(result.behaviorAdaptations).toContain('abandonment_aware');
  });

  it('user with comeback sessions → comeback_adaptive in adaptations', () => {
    const profile = makeProfile({ motivationStyle: 'calm' });
    const result = resolveVexExperience(
      profile,
      makeStats({
        totalCompletedSessions: 5,
        completedSessionDurations: [25, 30, 25],
        comebackSessions: 2,
      }),
      defaultAvailability,
    );
    expect(result.behaviorAdaptations).toContain('comeback_adaptive');
  });

  it('user with coach interactions → coach_responsive in adaptations', () => {
    const profile = makeProfile({ motivationStyle: 'coach_led' });
    const result = resolveVexExperience(
      profile,
      makeStats({
        totalCompletedSessions: 5,
        completedSessionDurations: [25, 30, 25],
        coachInteractions: 5,
      }),
      defaultAvailability,
    );
    expect(result.behaviorAdaptations).toContain('coach_responsive');
  });
});

describe('Premium moment resolution', () => {
  it('no premium when < 5 sessions', () => {
    const profile = makeProfile({ motivationStyle: 'calm' });
    const result = resolveVexExperience(
      profile,
      makeStats({ totalCompletedSessions: 3 }),
      { boss: false, challenges: false, premium: true, study: false },
    );
    expect(result.premium.trigger).toBe('none');
    expect(result.premium.shouldTease).toBe(false);
  });
});
