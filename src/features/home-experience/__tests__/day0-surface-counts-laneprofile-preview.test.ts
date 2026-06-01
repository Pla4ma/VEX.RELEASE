import { decideHomeSurfaces } from '../home-surface-decision';
import {
  featureAvailability,
  baseStats,
  day0Map,
} from './day0-surface-counts-helpers';

describe('Phase 3 — Day 0 lane surface counts', () => {
  describe('LaneProfile consumption overrides raw signal inference', () => {
    it('student LaneProfile → surfaces Study OS even when motivation style is game_like', () => {
      const map = day0Map({
        motivationStyle: 'game_like',
        primaryGoal: 'focus',
        gamificationIntensity: 'strong',
        laneProfile: { primaryLane: 'student' },
      });
      expect(map.run_board).toBe('hidden');
    });

    it('game_like LaneProfile → surfaces run_board even when motivation style is calm', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: 'calm',
          primaryGoal: 'focus',
          gamificationIntensity: 'minimal',
          studyLayerName: 'Study OS',
          userStage: 'engaged',
        },
        behaviorStats: { ...baseStats(), totalCompletedSessions: 3 },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        laneProfile: { primaryLane: 'game_like' },
      });
      expect(map.run_board).not.toBe('hidden');
    });

    it('deep_creative LaneProfile → surfaces project/focus even when primary goal is study', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: 'study_focused',
          primaryGoal: 'study',
          gamificationIntensity: 'medium',
          studyLayerName: 'Study OS',
          userStage: 'engaged',
        },
        behaviorStats: {
          ...baseStats(),
          totalCompletedSessions: 5,
          projectFocusUsageRatio: 0.1,
        },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        laneProfile: { primaryLane: 'deep_creative' },
      });
      expect(map.project_thread).not.toBe('hidden');
      expect(map.focus_window).not.toBe('hidden');
    });

    it('minimal_normal LaneProfile → surfaces today_strip even when behavior is game-like', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: 'game_like',
          primaryGoal: 'focus',
          gamificationIntensity: 'strong',
          studyLayerName: 'Study OS',
          userStage: 'engaged',
        },
        behaviorStats: { ...baseStats(), totalCompletedSessions: 5 },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        laneProfile: { primaryLane: 'minimal_normal' },
      });
      expect(map.today_strip).not.toBe('hidden');
    });
  });

  describe('Study preview navigation guard', () => {
    it('study_os on Day 0 is hidden/blocked — no navigation to upload possible', () => {
      const map = day0Map({
        motivationStyle: 'study_focused',
        primaryGoal: 'study',
      });
      expect(map.study_os).toMatch(/hidden|blocked/);
    });

    it('study_layer on Day 0 is tiny_tease at most — not a full card that navigates to upload', () => {
      const map = day0Map({
        motivationStyle: 'study_focused',
        primaryGoal: 'study',
      });
      expect(map.study_layer).not.toBe('secondary');
      expect(map.study_layer).not.toBe('primary');
      expect(map.study_layer).not.toBe('spotlight');
    });
  });

  describe('Run preview economy block', () => {
    it('run_board on Day 0 is hidden/blocked', () => {
      const map = day0Map({
        motivationStyle: 'game_like',
        gamificationIntensity: 'strong',
      });
      expect(map.run_board).toMatch(/hidden|blocked/);
    });

    it('boss_full_cta blocked on Day 0 even for game-like', () => {
      const map = day0Map({
        motivationStyle: 'game_like',
        gamificationIntensity: 'strong',
      });
      expect(map.boss_full_cta).toMatch(/hidden|blocked/);
    });

    it('after Day 0, game-like lane gets run_board but NO shop/wagers/gems in surface keys', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: 'game_like',
          primaryGoal: 'focus',
          gamificationIntensity: 'strong',
          studyLayerName: 'Study OS',
          userStage: 'engaged',
        },
        behaviorStats: {
          ...baseStats(),
          totalCompletedSessions: 5,
          bossChallengeEngagement: 'high',
        },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: true,
        isFirstSession: false,
        laneProfile: { primaryLane: 'game_like' },
      });
      expect(map.run_board).not.toBe('hidden');
      expect(Object.keys(map)).not.toEqual(
        expect.arrayContaining(['shop', 'wagers', 'gems']),
      );
      expect(map.boss_full_cta).not.toBe('primary');
    });
  });
});
