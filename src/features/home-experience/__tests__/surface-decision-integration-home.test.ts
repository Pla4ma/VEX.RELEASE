import { decideHomeSurfaces } from './surface-decision-integration.helpers';

describe('Home surface decision — integration', () => {
  describe('Day 0 calm user', () => {
    const map = decideHomeSurfaces({
      featureAvailability: {
        boss: false,
        challenges: false,
        premium: false,
        study: false,
      },
      personalizationProfile: {
        motivationStyle: 'calm',
        primaryGoal: 'focus',
        gamificationIntensity: 'minimal',
        studyLayerName: 'Study OS',
        userStage: 'new',
      },
      behaviorStats: {
        totalCompletedSessions: 0,
        studyUsageRatio: 0,
        bossChallengeEngagement: 'none',
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
    });

    it('start_session is primary', () => {
      expect(map.start_session).toBe('primary');
    });
    it('coach_presence is tiny_tease', () => {
      expect(map.coach_presence).toBe('tiny_tease');
    });
    it('unlock_strip is tiny_tease', () => {
      expect(map.unlock_strip).toBe('tiny_tease');
    });
    it('boss surfaces are hidden/blocked for calm day-0 user', () => {
      expect(map.boss_teaser).toBe('hidden');
      expect(map.boss_compact).toBe('hidden');
      expect(map.boss_full_cta).toBe('blocked');
    });
    it('premium is hidden', () => {
      expect(map.premium_tease).toBe('hidden');
    });
    it('study is hidden unless selected', () => {
      expect(map.study_layer).toBe('hidden');
    });
  });

  describe('Study-focused user after first session', () => {
    const map = decideHomeSurfaces({
      featureAvailability: {
        boss: false,
        challenges: true,
        premium: false,
        study: true,
      },
      personalizationProfile: {
        motivationStyle: 'study_focused',
        primaryGoal: 'study',
        gamificationIntensity: 'medium',
        studyLayerName: 'Study OS',
        userStage: 'engaged',
      },
      behaviorStats: {
        totalCompletedSessions: 3,
        studyUsageRatio: 0.4,
        bossChallengeEngagement: 'none',
        coachInteractions: 1,
        comebackSessions: 0,
        ignoredFeatures: [],
        premiumFeatureAttempts: [],
        completionStreak: 2,
      },
      hasActiveStudyPlan: true,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });

    it('study_layer is spotlight after sessions', () => {
      expect(map.study_layer).toBe('spotlight');
    });
  });

  describe('Game-like user boss teaser', () => {
    const map = decideHomeSurfaces({
      featureAvailability: {
        boss: true,
        challenges: true,
        premium: false,
        study: false,
      },
      personalizationProfile: {
        motivationStyle: 'game_like',
        primaryGoal: 'focus',
        gamificationIntensity: 'strong',
        studyLayerName: 'Study OS',
        userStage: 'engaged',
      },
      behaviorStats: {
        totalCompletedSessions: 5,
        studyUsageRatio: 0.1,
        bossChallengeEngagement: 'low',
        coachInteractions: 0,
        comebackSessions: 0,
        ignoredFeatures: [],
        premiumFeatureAttempts: [],
        completionStreak: 3,
      },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });

    it('boss_compact is secondary for engaged game-like user', () => {
      expect(['secondary', 'spotlight', 'tiny_tease']).toContain(
        map.boss_compact,
      );
      expect(map.boss_full_cta).toBe('hidden');
    });
  });

  describe('Calm user blocks boss full CTA', () => {
    const map = decideHomeSurfaces({
      featureAvailability: {
        boss: true,
        challenges: true,
        premium: true,
        study: true,
      },
      personalizationProfile: {
        motivationStyle: 'calm',
        primaryGoal: 'focus',
        gamificationIntensity: 'minimal',
        studyLayerName: 'Study OS',
        userStage: 'power',
      },
      behaviorStats: {
        totalCompletedSessions: 15,
        studyUsageRatio: 0.1,
        bossChallengeEngagement: 'none',
        coachInteractions: 2,
        comebackSessions: 0,
        ignoredFeatures: [],
        premiumFeatureAttempts: [],
        completionStreak: 5,
      },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });

    it('boss_full_cta is blocked for calm users', () => {
      expect(map.boss_full_cta).toBe('blocked');
    });
    it('premium stays hidden before value', () => {
      expect(map.premium_tease).toBe('hidden');
    });
  });
});
