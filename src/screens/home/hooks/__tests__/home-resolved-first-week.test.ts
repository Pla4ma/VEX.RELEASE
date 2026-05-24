/**
 * Tests for firstWeek phase integration and decision hierarchy in home resolved experience.
 */
import { decideHomeSurfaces } from '../../../../features/home-experience/home-surface-decision';

function makeBaseInput(overrides: Record<string, unknown> = {}) {
  return {
    featureAvailability: { boss: true, challenges: true, premium: true, study: true },
    personalizationProfile: {
      motivationStyle: 'calm' as const,
      primaryGoal: 'focus' as const,
      gamificationIntensity: 'minimal' as const,
      studyLayerName: 'Deep Work Plan',
      userStage: 'new' as const,
    },
    behaviorStats: {
      totalCompletedSessions: 0,
      studyUsageRatio: 0,
      bossChallengeEngagement: 'none' as const,
      coachInteractions: 0,
      comebackSessions: 0,
      ignoredFeatures: [],
      premiumFeatureAttempts: [],
      completionStreak: 0,
    },
    hasActiveStudyPlan: false,
    hasActiveRecommendation: false,
    hasActiveBoss: false,
    isFirstSession: true,
    ...overrides,
  };
}

describe('Home resolved experience — firstWeek phase integration', () => {
  describe('First-week boss gating', () => {
    it('blocks boss when firstWeek bossIntensity is hidden', () => {
      const map = decideHomeSurfaces(makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'game_like', primaryGoal: 'work',
          gamificationIntensity: 'strong', studyLayerName: 'Deep Work Plan',
          userStage: 'engaged',
        },
        behaviorStats: {
          totalCompletedSessions: 5, studyUsageRatio: 0.1,
          bossChallengeEngagement: 'medium', coachInteractions: 0,
          comebackSessions: 0, ignoredFeatures: [],
          premiumFeatureAttempts: [], completionStreak: 3,
        },
        isFirstSession: false, hasActiveBoss: true,
        firstWeekPhase: { bossIntensity: 'hidden' as const },
      }));
      expect(map.boss_teaser).toBe('hidden');
      expect(map.boss_compact).toBe('hidden');
      expect(map.boss_full_cta).toBe('blocked');
    });
  });

  describe('First-week premium gating', () => {
    it('hides premium when firstWeek premiumMoment is none', () => {
      const map = decideHomeSurfaces(makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'coach_led', primaryGoal: 'work',
          gamificationIntensity: 'medium', studyLayerName: 'Deep Work Plan',
          userStage: 'engaged',
        },
        behaviorStats: {
          totalCompletedSessions: 6, studyUsageRatio: 0,
          bossChallengeEngagement: 'none', coachInteractions: 0,
          comebackSessions: 0, ignoredFeatures: [],
          premiumFeatureAttempts: ['weekly_intelligence'], completionStreak: 3,
        },
        isFirstSession: false,
        firstWeekPhase: { premiumMoment: 'none' as const },
      }));
      expect(map.premium_tease).toBe('hidden');
    });

    it('shows soft tease when firstWeek allows it', () => {
      const map = decideHomeSurfaces(makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'coach_led', primaryGoal: 'work',
          gamificationIntensity: 'medium', studyLayerName: 'Deep Work Plan',
          userStage: 'engaged',
        },
        behaviorStats: {
          totalCompletedSessions: 6, studyUsageRatio: 0,
          bossChallengeEngagement: 'none', coachInteractions: 0,
          comebackSessions: 0, ignoredFeatures: [],
          premiumFeatureAttempts: ['weekly_intelligence'], completionStreak: 3,
        },
        isFirstSession: false,
        firstWeekPhase: { premiumMoment: 'soft_tease' as const },
      }));
      expect(map.premium_tease).toBe('tiny_tease');
    });
  });

  describe('First-week spotlight override', () => {
    it('uses firstWeek spotlight for study_deep_work_path', () => {
      const map = decideHomeSurfaces(makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'calm', primaryGoal: 'focus',
          gamificationIntensity: 'minimal', studyLayerName: 'Deep Work Plan',
          userStage: 'engaged',
        },
        behaviorStats: {
          totalCompletedSessions: 5, studyUsageRatio: 0.5,
          bossChallengeEngagement: 'none', coachInteractions: 0,
          comebackSessions: 0, ignoredFeatures: [],
          premiumFeatureAttempts: [], completionStreak: 3,
        },
        isFirstSession: false,
        firstWeekPhase: { spotlightSurface: 'study_deep_work_path' as const },
      }));
      expect(map.study_layer).toBe('spotlight');
    });

    it('uses firstWeek spotlight for progress_proof', () => {
      const map = decideHomeSurfaces(makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'calm', primaryGoal: 'focus',
          gamificationIntensity: 'minimal', studyLayerName: 'Deep Work Plan',
          userStage: 'engaged',
        },
        behaviorStats: {
          totalCompletedSessions: 1, studyUsageRatio: 0,
          bossChallengeEngagement: 'none', coachInteractions: 0,
          comebackSessions: 0, ignoredFeatures: [],
          premiumFeatureAttempts: [], completionStreak: 1,
        },
        isFirstSession: false,
        firstWeekPhase: { spotlightSurface: 'progress_proof' as const },
      }));
      expect(map.progress_proof).toBe('spotlight');
    });
  });
});

describe('Decision hierarchy', () => {
  it('HomePriority OPEN_BOSS is filtered when boss surface blocked', () => {
    const map = decideHomeSurfaces(makeBaseInput({
      personalizationProfile: {
        motivationStyle: 'calm', primaryGoal: 'focus',
        gamificationIntensity: 'minimal', studyLayerName: 'Deep Work Plan',
        userStage: 'power',
      },
      behaviorStats: {
        totalCompletedSessions: 12, studyUsageRatio: 0.1,
        bossChallengeEngagement: 'high', coachInteractions: 2,
        comebackSessions: 0, ignoredFeatures: [],
        premiumFeatureAttempts: [], completionStreak: 6,
      },
      isFirstSession: false,
    }));
    expect(map.boss_full_cta).toBe('blocked');
    expect(map.start_session).toBe('primary');
  });

  it('Day 0 Home has exactly one primary CTA', () => {
    const map = decideHomeSurfaces(makeBaseInput());
    const primaries = Object.entries(map).filter(([, v]) => v === 'primary');
    expect(primaries).toHaveLength(1);
    expect(map.start_session).toBe('primary');
  });

  it('calm user does not get boss CTA', () => {
    const map = decideHomeSurfaces(makeBaseInput({
      personalizationProfile: {
        motivationStyle: 'calm', primaryGoal: 'personal',
        gamificationIntensity: 'minimal',         studyLayerName: 'Growth Path',
        userStage: 'power',
      },
      behaviorStats: {
        totalCompletedSessions: 15, studyUsageRatio: 0,
        bossChallengeEngagement: 'high', coachInteractions: 5,
        comebackSessions: 0, ignoredFeatures: [],
        premiumFeatureAttempts: [], completionStreak: 7,
      },
      isFirstSession: false,
    }));
    expect(map.boss_full_cta).not.toBe('primary');
    expect(map.boss_full_cta).not.toBe('spotlight');
    expect(map.boss_full_cta).not.toBe('secondary');
  });

  it('study user gets Study/Deep Work CTA', () => {
    const map = decideHomeSurfaces(makeBaseInput({
      personalizationProfile: {
        motivationStyle: 'study_focused', primaryGoal: 'study',
        gamificationIntensity: 'medium', studyLayerName: 'Study OS',
        userStage: 'engaged',
      },
      behaviorStats: {
        totalCompletedSessions: 5, studyUsageRatio: 0.8,
        bossChallengeEngagement: 'none', coachInteractions: 1,
        comebackSessions: 0, ignoredFeatures: [],
        premiumFeatureAttempts: [], completionStreak: 3,
      },
      hasActiveStudyPlan: true, isFirstSession: false,
    }));
    expect(map.study_layer).toBe('spotlight');
    expect(map.start_session).toBe('secondary');
  });

  it('premium hidden before value even with premium available', () => {
    const map = decideHomeSurfaces(makeBaseInput({
      personalizationProfile: {
        motivationStyle: 'game_like', primaryGoal: 'work',
        gamificationIntensity: 'strong', studyLayerName: 'Deep Work Plan',
        userStage: 'engaged',
      },
      behaviorStats: {
        totalCompletedSessions: 2, studyUsageRatio: 0,
        bossChallengeEngagement: 'low', coachInteractions: 0,
        comebackSessions: 0, ignoredFeatures: [],
        premiumFeatureAttempts: [], completionStreak: 2,
      },
      isFirstSession: false,
    }));
    expect(map.premium_tease).toBe('hidden');
  });
});
