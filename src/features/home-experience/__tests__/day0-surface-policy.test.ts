import { decideHomeSurfaces } from '../home-surface-decision';
import { enforceDay0SurfacePolicy, DEFAULT_DAY0_POLICY } from '../day0-surface-policy';
import type { HomeSurfaceMap } from '../surface-decision-schemas';

const featureAvailability = { boss: true, challenges: true, premium: true, study: true };

const studyProfile = {
  motivationStyle: 'study_focused' as const,
  primaryGoal: 'study' as const,
  gamificationIntensity: 'medium' as const,
  studyLayerName: 'Study OS',
  userStage: 'new' as const,
};

const gameLikeProfile = {
  motivationStyle: 'game_like' as const,
  primaryGoal: 'work' as const,
  gamificationIntensity: 'strong' as const,
  studyLayerName: 'Deep Work Plan',
  userStage: 'new' as const,
};

const calmProfile = {
  motivationStyle: 'calm' as const,
  primaryGoal: 'personal' as const,
  gamificationIntensity: 'minimal' as const,
  studyLayerName: 'Growth Path',
  userStage: 'new' as const,
};

const coachProfile = {
  motivationStyle: 'coach_led' as const,
  primaryGoal: 'work' as const,
  gamificationIntensity: 'minimal' as const,
  studyLayerName: 'Deep Work Plan',
  userStage: 'new' as const,
};

function baseStats() {
  return {
    totalCompletedSessions: 0,
    studyUsageRatio: 0,
    bossChallengeEngagement: 'none' as const,
    coachInteractions: 0,
    comebackSessions: 0,
    ignoredFeatures: [],
    premiumFeatureAttempts: [],
    completionStreak: 0,
  };
}

function makeDay0Map(): HomeSurfaceMap {
  return decideHomeSurfaces({
    featureAvailability,
    personalizationProfile: studyProfile,
    behaviorStats: baseStats(),
    hasActiveStudyPlan: false,
    hasActiveRecommendation: false,
    hasActiveBoss: false,
    isFirstSession: true,
  });
}

function visibleCount(map: HomeSurfaceMap): number {
  return Object.entries(map).filter(([, v]) => v !== 'hidden' && v !== 'blocked').length;
}

function visibleEntries(map: HomeSurfaceMap): string[] {
  return Object.entries(map)
    .filter(([, v]) => v !== 'hidden' && v !== 'blocked')
    .map(([k, v]) => `${k}:${v}`);
}

describe('Day 0 Surface Policy', () => {
  describe('decideHomeSurfaces enforces policy', () => {
    it('Day 0 Home renders 3-5 visible elements', () => {
      const map = makeDay0Map();
      const count = visibleCount(map);
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(5);
    });

    it('Day 0 has exactly one primary CTA', () => {
      const map = makeDay0Map();
      const primaries = Object.entries(map).filter(([, v]) => v === 'primary');
      expect(primaries).toHaveLength(1);
      expect(map.start_session).toBe('primary');
    });

    it('Day 0 does not render battle pass / shop / squad', () => {
      const map = makeDay0Map();
      expect(map.study_layer).not.toBe('secondary');
      expect(map.study_layer).not.toBe('primary');
      expect(map.boss_compact).not.toBe('secondary');
      expect(map.boss_compact).not.toBe('primary');
      expect(map.challenge_teaser).toMatch(/hidden|blocked/);
      expect(map.weekly_quest).toMatch(/hidden|blocked/);
    });

    it('Day 0 does not render full boss card', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: gameLikeProfile,
        behaviorStats: { ...baseStats(), bossChallengeEngagement: 'high' },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: true,
        isFirstSession: true,
      });
      expect(map.boss_full_cta).toMatch(/hidden|blocked/);
      expect(map.boss_compact).toMatch(/hidden|blocked/);
    });

    it('Day 0 does not render premium paywall', () => {
      const map = makeDay0Map();
      expect(map.premium_tease).toMatch(/hidden|blocked/);
    });

    it('Game-like Day 0 can show tiny boss teaser', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: gameLikeProfile,
        behaviorStats: { ...baseStats(), bossChallengeEngagement: 'medium' },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
      });
      expect(map.boss_teaser).toBe('tiny_tease');
    });

    it('Calm Day 0 hides boss entirely', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: calmProfile,
        behaviorStats: { ...baseStats(), bossChallengeEngagement: 'medium' },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
      });
      expect(map.boss_teaser).toBe('hidden');
      expect(map.boss_compact).toBe('hidden');
    });

    it('Study Day 0 can show study_layer as tiny_tease but not as full card', () => {
      const map = makeDay0Map();
      const val = map.study_layer as string;
      expect(val === 'hidden' || val === 'tiny_tease').toBe(true);
      expect(val).not.toBe('secondary');
      expect(val).not.toBe('primary');
    });
  });

  describe('enforceDay0SurfacePolicy validation', () => {
    function makeViolatingMap(): HomeSurfaceMap {
      return {
        start_session: 'primary',
        coach_presence: 'spotlight',
        progress_proof: 'secondary',
        focus_score: 'secondary',
        progress_detail: 'tiny_tease',
        study_layer: 'secondary',
        companion_thread: 'secondary',
        boss_teaser: 'tiny_tease',
        boss_compact: 'tiny_tease',
        boss_full_cta: 'tiny_tease',
        challenge_teaser: 'tiny_tease',
        unlock_strip: 'tiny_tease',
        premium_tease: 'tiny_tease',
        weekly_quest: 'secondary',
      };
    }

    it('corrects blocked surfaces to hidden', () => {
      const { violations, corrected } = enforceDay0SurfacePolicy(makeViolatingMap());
      expect(corrected.progress_proof).toBe('hidden');
      expect(corrected.focus_score).toBe('hidden');
      expect(corrected.challenge_teaser).toBe('hidden');
      expect(corrected.premium_tease).toBe('hidden');
      expect(violations.length).toBeGreaterThan(0);
    });

    it('ensures no more than maxVisibleSurfaces', () => {
      const { corrected } = enforceDay0SurfacePolicy(makeViolatingMap());
      const count = visibleCount(corrected);
      expect(count).toBeLessThanOrEqual(DEFAULT_DAY0_POLICY.maxVisibleSurfaces);
    });

    it('ensures exactly one primary CTA', () => {
      const map = makeViolatingMap();
      map.start_session = 'primary';
      const { corrected } = enforceDay0SurfacePolicy(map);
      const primaries = Object.entries(corrected).filter(([, v]) => v === 'primary');
      expect(primaries.length).toBeLessThanOrEqual(1);
    });

    it('does not modify a valid Day 0 map', () => {
      const map = makeDay0Map();
      const result = enforceDay0SurfacePolicy(map);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });

  describe('no advanced features on Day 0', () => {
    it('blocks boss_full_cta', () => {
      const map = makeDay0Map();
      expect(map.boss_full_cta).toMatch(/hidden|blocked/);
    });

    it('blocks challenge_teaser', () => {
      const map = makeDay0Map();
      expect(map.challenge_teaser).toMatch(/hidden|blocked/);
    });

    it('blocks weekly_quest', () => {
      const map = makeDay0Map();
      expect(map.weekly_quest).toMatch(/hidden|blocked/);
    });

    it('blocks progress_proof', () => {
      const map = makeDay0Map();
      expect(map.progress_proof).toMatch(/hidden|blocked/);
    });

    it('blocks focus_score', () => {
      const map = makeDay0Map();
      expect(map.focus_score).toMatch(/hidden|blocked/);
    });

    it('blocks progress_detail', () => {
      const map = makeDay0Map();
      expect(map.progress_detail).toMatch(/hidden|blocked/);
    });
  });

  describe('Day 0 personalization', () => {
    it('coach_led gets coach_presence as tiny_tease', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: coachProfile,
        behaviorStats: baseStats(),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
      });
      expect(map.coach_presence).toBe('tiny_tease');
    });

    it('shows unlock_strip on Day 0', () => {
      const map = makeDay0Map();
      expect(map.unlock_strip).toBe('tiny_tease');
    });

    it('all visible surfaces are valid decision values', () => {
      const map = makeDay0Map();
      const allowed = ['primary', 'secondary', 'spotlight', 'tiny_tease', 'hidden', 'blocked'];
      for (const [, val] of Object.entries(map)) {
        expect(allowed).toContain(val);
      }
    });

    it('start_session is always primary on Day 0', () => {
      for (const profile of [studyProfile, gameLikeProfile, calmProfile, coachProfile]) {
        const map = decideHomeSurfaces({
          featureAvailability,
          personalizationProfile: profile,
          behaviorStats: baseStats(),
          hasActiveStudyPlan: false,
          hasActiveRecommendation: false,
          hasActiveBoss: false,
          isFirstSession: true,
        });
        expect(map.start_session).toBe('primary');
      }
    });
  });
});
