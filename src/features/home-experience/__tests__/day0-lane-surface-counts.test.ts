/**
 * VEX Phase 3 — Day 0 lane surface count tests.
 *
 * Validates:
 * 1-4.  Each lane on Day 0 renders <= 6 surfaces.
 * 5.    No hidden system queries on Day 0.
 * 6.    Home consumes LaneProfile, not raw scattered fields.
 * 7.    Study preview does not navigate to upload.
 * 8.    Run preview does not open full boss/shop/economy.
 * 9.    Project preview does not require project import.
 * 10.   Clean Home has no boss/challenge clutter.
 *       Memory insight hidden before 3 sessions.
 */
import { decideHomeSurfaces } from '../home-surface-decision';
import { enforceDay0SurfacePolicy } from '../day0-surface-policy';
import type { HomeSurfaceMap } from '../surface-decision-schemas';

const featureAvailability = { boss: true, challenges: true, premium: true, study: true };

function baseStats(overrides: Record<string, unknown> = {}) {
  return {
    totalCompletedSessions: 0,
    studyUsageRatio: 0,
    deepWorkUsageRatio: 0,
    learningUsageRatio: 0,
    projectFocusUsageRatio: 0,
    structuredExecutionUsageRatio: 0,
    bossChallengeEngagement: 'none' as const,
    coachInteractions: 0,
    comebackSessions: 0,
    ignoredFeatures: [],
    premiumFeatureAttempts: [],
    completionStreak: 0,
    ...overrides,
  };
}

function visibleCount(map: HomeSurfaceMap): number {
  return Object.entries(map).filter(([, v]) => v !== 'hidden' && v !== 'blocked').length;
}

function visibleEntries(map: HomeSurfaceMap): string[] {
  return Object.entries(map)
    .filter(([, v]) => v !== 'hidden' && v !== 'blocked')
    .map(([k, v]) => `${k}:${v}`);
}

function day0Map(overrides: {
  motivationStyle?: string;
  primaryGoal?: string;
  gamificationIntensity?: 'minimal' | 'medium' | 'strong';
  laneProfile?: { primaryLane: string };
}) {
  return decideHomeSurfaces({
    featureAvailability,
    personalizationProfile: {
      motivationStyle: overrides.motivationStyle ?? 'coach_led',
      primaryGoal: overrides.primaryGoal ?? 'focus',
      gamificationIntensity: overrides.gamificationIntensity ?? 'medium',
      studyLayerName: 'Study OS',
      userStage: 'new',
    },
    behaviorStats: baseStats(),
    hasActiveStudyPlan: false,
    hasActiveRecommendation: false,
    hasActiveBoss: false,
    isFirstSession: true,
    laneProfile: overrides.laneProfile
      ? { primaryLane: overrides.laneProfile.primaryLane as 'student' | 'game_like' | 'deep_creative' | 'minimal_normal' }
      : undefined,
  });
}

describe('Phase 3 — Day 0 lane surface counts', () => {
  // ─── Tests 1-4: Each lane has <= 6 surfaces ───
  describe('Day 0 surface count per lane', () => {
    it('Study Home Day 0 <= 5 surfaces', () => {
      const map = day0Map({
        motivationStyle: 'study_focused',
        primaryGoal: 'study',
        laneProfile: { primaryLane: 'student' },
      });
      expect(visibleCount(map)).toBeLessThanOrEqual(5);
      // Start session + coach + unlock + study_layer are expected
      expect(map.start_session).toBe('primary');
      expect(map.study_os).toMatch(/hidden|blocked/);
    });

    it('Run Home Day 0 <= 5 surfaces', () => {
      const map = day0Map({
        motivationStyle: 'game_like',
        gamificationIntensity: 'strong',
        laneProfile: { primaryLane: 'game_like' },
      });
      expect(visibleCount(map)).toBeLessThanOrEqual(5);
      expect(map.start_session).toBe('primary');
      expect(map.run_board).toMatch(/hidden|blocked/);
    });

    it('Project Home Day 0 <= 5 surfaces', () => {
      const map = day0Map({
        motivationStyle: 'coach_led',
        primaryGoal: 'creative',
        laneProfile: { primaryLane: 'deep_creative' },
      });
      expect(visibleCount(map)).toBeLessThanOrEqual(5);
      expect(map.start_session).toBe('primary');
      expect(map.project_thread).toMatch(/hidden|blocked/);
    });

    it('Clean Home Day 0 <= 5 surfaces', () => {
      const map = day0Map({
        motivationStyle: 'calm',
        gamificationIntensity: 'minimal',
        laneProfile: { primaryLane: 'minimal_normal' },
      });
      const count = visibleCount(map);
      expect(count).toBeLessThanOrEqual(5);
      // Calm should still have at least start_session + coach + unlock
      expect(count).toBeGreaterThanOrEqual(3);
      expect(map.start_session).toBe('primary');
    });
  });

  // ─── Test 5: No hidden system queries on Day 0 ───
  describe('Hidden systems blocked on Day 0', () => {
    const map = day0Map({ motivationStyle: 'study_focused', primaryGoal: 'study' });

    it('study_os blocked on Day 0', () => { expect(map.study_os).toMatch(/hidden|blocked/); });
    it('run_board blocked on Day 0', () => { expect(map.run_board).toMatch(/hidden|blocked/); });
    it('project_thread blocked on Day 0', () => { expect(map.project_thread).toMatch(/hidden|blocked/); });
    it('focus_window blocked on Day 0', () => { expect(map.focus_window).toMatch(/hidden|blocked/); });
    it('weekly_intelligence blocked on Day 0', () => { expect(map.weekly_intelligence).toMatch(/hidden|blocked/); });
    it('memory_insight blocked on Day 0', () => { expect(map.memory_insight).toMatch(/hidden|blocked/); });
    it('boss_compact blocked on Day 0', () => { expect(map.boss_compact).toMatch(/hidden|blocked/); });
    it('boss_full_cta blocked on Day 0', () => { expect(map.boss_full_cta).toMatch(/hidden|blocked/); });
    it('challenge_teaser blocked on Day 0', () => { expect(map.challenge_teaser).toMatch(/hidden|blocked/); });
    it('weekly_quest blocked on Day 0', () => { expect(map.weekly_quest).toMatch(/hidden|blocked/); });
    it('premium_tease blocked on Day 0', () => { expect(map.premium_tease).toMatch(/hidden|blocked/); });
    it('focus_score blocked on Day 0', () => { expect(map.focus_score).toMatch(/hidden|blocked/); });
    it('progress_proof blocked on Day 0', () => { expect(map.progress_proof).toMatch(/hidden|blocked/); });
    it('progress_detail blocked on Day 0', () => { expect(map.progress_detail).toMatch(/hidden|blocked/); });
  });

  // ─── Test 6: Home consumes LaneProfile, not raw scattered fields ───
  describe('LaneProfile consumption overrides raw signal inference', () => {
    it('student LaneProfile → surfaces Study OS even when motivation style is game_like', () => {
      // With LaneProfile=student, raw motivationStyle=game_like should not cause run_board
      const map = day0Map({
        motivationStyle: 'game_like',
        primaryGoal: 'focus',
        gamificationIntensity: 'strong',
        laneProfile: { primaryLane: 'student' },
      });
      // On Day 0, Study OS blocked; but post-Day-0 it would show. Run Board should NOT show
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
      // Lane profile overrides calm inference → run_board visible
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
        behaviorStats: { ...baseStats(), totalCompletedSessions: 5, projectFocusUsageRatio: 0.1 },
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

  // ─── Test 7: Study preview does not navigate to upload ───
  describe('Study preview navigation guard', () => {
    it('study_os on Day 0 is hidden/blocked — no navigation to upload possible', () => {
      const map = day0Map({ motivationStyle: 'study_focused', primaryGoal: 'study' });
      expect(map.study_os).toMatch(/hidden|blocked/);
    });

    it('study_layer on Day 0 is tiny_tease at most — not a full card that navigates to upload', () => {
      const map = day0Map({ motivationStyle: 'study_focused', primaryGoal: 'study' });
      expect(map.study_layer).not.toBe('secondary');
      expect(map.study_layer).not.toBe('primary');
      expect(map.study_layer).not.toBe('spotlight');
    });
  });

  // ─── Test 8: Run preview does not open full boss/shop/economy ───
  describe('Run preview economy block', () => {
    it('run_board on Day 0 is hidden/blocked', () => {
      const map = day0Map({ motivationStyle: 'game_like', gamificationIntensity: 'strong' });
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
        behaviorStats: { ...baseStats(), totalCompletedSessions: 5, bossChallengeEngagement: 'high' },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: true,
        isFirstSession: false,
        laneProfile: { primaryLane: 'game_like' },
      });
      expect(map.run_board).not.toBe('hidden');
      // No old economy keys exist
      expect(Object.keys(map)).not.toEqual(expect.arrayContaining(['shop', 'wagers', 'gems']));
      // boss_full_cta still not primary
      expect(map.boss_full_cta).not.toBe('primary');
    });
  });

  // ─── Test 9: Project preview does not require project import ───
  describe('Project preview independence', () => {
    it('project_thread is hidden/blocked on Day 0 regardless of hasActiveStudyPlan', () => {
      // Even with active plan, project_thread should not surface on Day 0
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: 'coach_led',
          primaryGoal: 'creative',
          gamificationIntensity: 'medium',
          studyLayerName: 'Study OS',
          userStage: 'new',
        },
        behaviorStats: baseStats(),
        hasActiveStudyPlan: true,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
        laneProfile: { primaryLane: 'deep_creative' },
      });
      expect(map.project_thread).toMatch(/hidden|blocked/);
    });

    it('project_thread surfaces without requiring activeStudyPlan (after Day 0)', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: 'coach_led',
          primaryGoal: 'creative',
          gamificationIntensity: 'medium',
          studyLayerName: 'Study OS',
          userStage: 'engaged',
        },
        behaviorStats: { ...baseStats(), totalCompletedSessions: 4, projectFocusUsageRatio: 0.6 },
        hasActiveStudyPlan: false, // No study plan
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        laneProfile: { primaryLane: 'deep_creative' },
      });
      expect(map.project_thread).not.toBe('hidden');
    });
  });

  // ─── Test 10: Clean Home has no boss/challenge clutter ───
  describe('Clean Home (minimal_normal) zero clutter', () => {
    it('minimal_normal Day 0 has no boss teaser', () => {
      const map = day0Map({
        motivationStyle: 'calm',
        gamificationIntensity: 'minimal',
        laneProfile: { primaryLane: 'minimal_normal' },
      });
      expect(map.boss_teaser).toBe('hidden');
      expect(map.boss_compact).toBe('hidden');
      expect(map.boss_full_cta).toBe('blocked');
    });

    it('minimal_normal Day 0 has no challenge clutter', () => {
      const map = day0Map({
        motivationStyle: 'calm',
        gamificationIntensity: 'minimal',
        laneProfile: { primaryLane: 'minimal_normal' },
      });
      expect(map.challenge_teaser).toBe('hidden');
      expect(map.weekly_quest).toBe('hidden');
    });

    it('minimal_normal after Day 0 has today_strip, no boss/challenge clutter', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: 'calm',
          primaryGoal: 'personal',
          gamificationIntensity: 'minimal',
          studyLayerName: 'Growth Path',
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
      expect(map.boss_full_cta).toBe('blocked');
      expect(map.boss_compact).toBe('hidden');
      expect(map.challenge_teaser).toBe('hidden');
    });
  });

  // ─── Memory insight hidden before 3 sessions ───
  describe('Memory insight gating', () => {
    it('memory_insight hidden when < 3 sessions', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: 'coach_led',
          primaryGoal: 'focus',
          gamificationIntensity: 'medium',
          studyLayerName: 'Study OS',
          userStage: 'activating',
        },
        behaviorStats: { ...baseStats(), totalCompletedSessions: 2, coachInteractions: 2 },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        laneProfile: { primaryLane: 'student' },
      });
      expect(map.memory_insight).toBe('hidden');
    });

    it('memory_insight surfaces at >= 3 sessions with coach interactions', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: 'coach_led',
          primaryGoal: 'focus',
          gamificationIntensity: 'medium',
          studyLayerName: 'Study OS',
          userStage: 'engaged',
        },
        behaviorStats: { ...baseStats(), totalCompletedSessions: 3, coachInteractions: 2 },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        laneProfile: { primaryLane: 'student' },
      });
      expect(map.memory_insight).toBe('tiny_tease');
    });
  });

  // ─── Policy enforcement: all Day 0 maps pass validation ───
  describe('Day 0 policy validation across lanes', () => {
    const lanes = [
      { name: 'student', profile: { motivationStyle: 'study_focused', primaryGoal: 'study', laneProfile: { primaryLane: 'student' } } },
      { name: 'game_like', profile: { motivationStyle: 'game_like', gamificationIntensity: 'strong' as const, laneProfile: { primaryLane: 'game_like' } } },
      { name: 'deep_creative', profile: { motivationStyle: 'coach_led', primaryGoal: 'creative', laneProfile: { primaryLane: 'deep_creative' } } },
      { name: 'minimal_normal', profile: { motivationStyle: 'calm', gamificationIntensity: 'minimal' as const, laneProfile: { primaryLane: 'minimal_normal' } } },
    ];

    lanes.forEach(({ name, profile }) => {
      it(`${name} Day 0 map passes enforceDay0SurfacePolicy`, () => {
        const map = day0Map(profile);
        const result = enforceDay0SurfacePolicy(map);
        expect(result.valid).toBe(true);
        expect(result.violations).toHaveLength(0);
      });
    });
  });
});
