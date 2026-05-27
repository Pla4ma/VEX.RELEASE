import { decideHomeSurfaces } from '../../../../features/home-experience/home-surface-decision';
import { makeBaseInput } from './home-resolved-first-week-helpers';

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
