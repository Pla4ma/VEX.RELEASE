import { makeProfile, makeStats, defaultAvailability, resolveVexExperience } from './helpers';

describe('Personalization v3 — behavior adaptations', () => {
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

describe('Adaptive Study OS naming', () => {
  it('student user sees Study OS', () => {
    const profile = makeProfile({
      primaryGoal: 'study',
      motivationStyle: 'study_focused',
      studyLayerName: 'Study OS',
    });
    const result = resolveVexExperience(profile, makeStats(), defaultAvailability);
    expect(result.studyLayerLabel).toBe('Study OS');
    expect(result.home.studyName).toBe('Study OS');
  });

  it('work user sees Deep Work Plan, never school wording', () => {
    const profile = makeProfile({
      primaryGoal: 'work',
      motivationStyle: 'coach_led',
      studyLayerName: 'Deep Work Plan',
    });
    const result = resolveVexExperience(
      profile,
      makeStats({ totalCompletedSessions: 5 }),
      { boss: true, challenges: true, premium: false, study: true },
    );
    expect(result.studyLayerLabel).toBe('Deep Work Plan');
    expect(result.home.studyName).toBe('Deep Work Plan');
    const joinedCopy = [result.home.coachCopy, result.home.studyName].join(' ');
    expect(joinedCopy.toLowerCase()).not.toMatch(/quiz|homework|chapter|study streak/i);
  });

  it('creative user sees Project Focus Path', () => {
    const profile = makeProfile({
      primaryGoal: 'creative',
      motivationStyle: 'friendly',
      studyLayerName: 'Project Focus Path',
      coachMode: 'mentor',
    });
    const result = resolveVexExperience(profile, makeStats(), defaultAvailability);
    expect(result.studyLayerLabel).toBe('Project Focus Path');
    expect(result.home.studyName).toBe('Project Focus Path');
  });

  it('learning user sees Learning OS', () => {
    const profile = makeProfile({
      primaryGoal: 'learning',
      motivationStyle: 'study_focused',
      studyLayerName: 'Learning OS',
    });
    const result = resolveVexExperience(profile, makeStats(), defaultAvailability);
    expect(result.studyLayerLabel).toBe('Learning OS');
    expect(result.home.studyName).toBe('Learning OS');
  });

  it('personal growth user sees Growth Path', () => {
    const profile = makeProfile({
      primaryGoal: 'personal',
      motivationStyle: 'calm',
      studyLayerName: 'Growth Path',
    });
    const result = resolveVexExperience(profile, makeStats(), defaultAvailability);
    expect(result.studyLayerLabel).toBe('Growth Path');
    expect(result.home.studyName).toBe('Growth Path');
  });
});
