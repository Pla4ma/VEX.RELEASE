import {
  resolveCompletionExperiencePolicy,
  resolveFirstWeekExperience,
  SessionMode,
  TEST_UUID,
  sess,
  baseStats,
} from './helpers';
import type { CompletionExperiencePolicyInput } from './helpers';

describe('Risk 2 — Premium Gating', () => {
  const compDefaults = {
    consequences: undefined,
    featureAvailability: {
      boss: true,
      challenges: true,
      progress: true,
      study: true,
      contractUsed: false,
    },
    firstWeekStage: null,
  } as const;

  it('premiumState premium: Study keeps progress, hides currency', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...compDefaults,
      lane: 'student',
      motivationStyle: 'study_focused',
      premiumState: 'premium',
      primaryGoal: 'STUDY',
      sessionMode: SessionMode.STUDY,
      summary: sess({
        sessionMode: SessionMode.STUDY,
        sessionId: TEST_UUID,
        userId: TEST_UUID,
      }),
    } as CompletionExperiencePolicyInput);
    expect(policy.adaptivePayoff).toBe('study_progress');
    expect(policy.hiddenCompletionSurfaces).toContain('coins_gems_wallet');
    expect(policy.hiddenCompletionSurfaces).toContain('premium_chest');
  });

  it('premiumState premium: Run boss_damage fires, currency still hidden', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...compDefaults,
      lane: 'game_like',
      motivationStyle: 'game_like',
      premiumState: 'premium',
      primaryGoal: 'WORK',
      consequences: { boss: { damage: 50 } },
      sessionMode: SessionMode.SPRINT,
      summary: sess({
        sessionMode: SessionMode.SPRINT,
        sessionId: TEST_UUID,
        userId: TEST_UUID,
      }),
    } as CompletionExperiencePolicyInput);
    expect(policy.adaptivePayoff).toBe('boss_damage');
    expect(policy.hiddenCompletionSurfaces).toContain('coins_gems_wallet');
  });

  it('premiumState premium: Clean stays minimal', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...compDefaults,
      lane: 'minimal_normal',
      motivationStyle: 'calm',
      premiumState: 'premium',
      primaryGoal: 'WORK',
      sessionMode: SessionMode.LIGHT_FOCUS,
      summary: sess({
        sessionMode: SessionMode.LIGHT_FOCUS,
        sessionId: TEST_UUID,
        userId: TEST_UUID,
      }),
    } as CompletionExperiencePolicyInput);
    expect(policy.animationLevel).toBe('minimal');
    expect(policy.heroBeat.surface).toBe('hero_minimal');
  });

  it('firstWeek: premiumState configured unlocks premium moments at DAY_5/DAY_7', () => {
    const day5 = resolveFirstWeekExperience({
      behaviorStats: baseStats,
      completedSessions: 5,
      daysSinceLastSession: null,
      daysSinceOnboarding: 6,
      featureAvailability: {
        boss: true,
        premium: true,
        social: false,
        study: true,
      },
      motivationStyle: 'coach_led',
      premiumState: 'configured',
      primaryGoal: 'work',
    });
    expect(day5.premiumMoment).toBe('soft_tease');

    const day7 = resolveFirstWeekExperience({
      behaviorStats: baseStats,
      completedSessions: 7,
      daysSinceLastSession: null,
      daysSinceOnboarding: 7,
      featureAvailability: {
        boss: true,
        premium: true,
        social: false,
        study: true,
      },
      motivationStyle: 'coach_led',
      premiumState: 'configured',
      primaryGoal: 'work',
    });
    expect(day7.premiumMoment).toBe('weekly_value');
  });

  it('premiumState unavailable: premiumMoment always none', () => {
    for (const sessions of [0, 5, 7]) {
      const result = resolveFirstWeekExperience({
        behaviorStats: baseStats,
        completedSessions: sessions,
        daysSinceLastSession: null,
        daysSinceOnboarding: sessions,
        featureAvailability: {
          boss: true,
          premium: true,
          social: false,
          study: true,
        },
        motivationStyle: 'coach_led',
        premiumState: 'unavailable',
        primaryGoal: 'work',
      });
      expect(result.premiumMoment).toBe('none');
    }
  });

  it('all four modes produce valid completion with premiumState premium', () => {
    for (const lane of [
      'student',
      'game_like',
      'deep_creative',
      'minimal_normal',
    ] as const) {
      const policy = resolveCompletionExperiencePolicy({
        ...compDefaults,
        lane,
        consequences:
          lane === 'game_like' ? { boss: { damage: 50 } } : undefined,
        featureAvailability: {
          boss: true,
          challenges: true,
          progress: true,
          study: true,
          contractUsed: false,
        },
        motivationStyle:
          lane === 'game_like'
            ? 'game_like'
            : lane === 'minimal_normal'
              ? 'calm'
              : 'coach_led',
        premiumState: 'premium',
        primaryGoal: lane === 'student' ? 'STUDY' : 'WORK',
        sessionMode:
          lane === 'student'
            ? SessionMode.STUDY
            : lane === 'game_like'
              ? SessionMode.SPRINT
              : SessionMode.LIGHT_FOCUS,
        summary: sess({
          sessionMode:
            lane === 'student'
              ? SessionMode.STUDY
              : lane === 'game_like'
                ? SessionMode.SPRINT
                : SessionMode.LIGHT_FOCUS,
          sessionId: TEST_UUID,
          userId: TEST_UUID,
        }),
      } as CompletionExperiencePolicyInput);
      expect(policy.heroBeat).toBeDefined();
      expect(policy.nextAction).toBeDefined();
      expect(policy.hiddenCompletionSurfaces).toContain('premium_chest');
    }
  });
});
