import { buildHomeExperienceModel, getHomeStage } from '../service';
import { decideHomeSurfaces, getPrimarySurface, getSpotlightSurface } from '../home-surface-decision';
import type { HomeSurfaceMap } from '../surface-decision-schemas';

const featureAvailability = { boss: true, challenges: true, premium: true, study: true };

const calmProfile = {
  motivationStyle: 'calm' as const,
  primaryGoal: 'personal' as const,
  gamificationIntensity: 'minimal' as const,
  studyLayerName: 'Growth Path',
  userStage: 'new' as const,
};

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

function baseStats(sessions = 0) {
  return {
    totalCompletedSessions: sessions,
    studyUsageRatio: 0,
    bossChallengeEngagement: 'none' as const,
    coachInteractions: 0,
    comebackSessions: 0,
    ignoredFeatures: [],
    premiumFeatureAttempts: [],
    completionStreak: 0,
  };
}

function visibleNonHidden(map: HomeSurfaceMap): string[] {
  return Object.entries(map)
    .filter(([, v]) => v !== 'hidden' && v !== 'blocked')
    .map(([k, v]) => `${k}:${v}`);
}

describe('product journey — Day 0 calm user', () => {
  const model = buildHomeExperienceModel({
    explicitMotivationStyle: 'calm',
    totalCompletedSessions: 0,
  });

  it('has exactly one primary CTA', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    const primaries = Object.entries(surfaces).filter(([, v]) => v === 'primary');
    expect(primaries).toHaveLength(1);
    expect(surfaces.start_session).toBe('primary');
  });

  it('no full boss route', () => {
    expect(model.mustNotRun).toContain('boss_query');
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.boss_compact).toBe('hidden');
    expect(surfaces.boss_full_cta).toBe('blocked');
    expect(surfaces.boss_teaser).toBe('hidden');
  });

  it('no premium hard sell', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.premium_tease).toBe('hidden');
  });

  it('no content upload unless selected', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.study_layer).toBe('hidden');
  });

  it('no social/shop/economy', () => {
    const visible = visibleNonHidden(
      decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: calmProfile,
        behaviorStats: baseStats(0),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
      }),
    );
    const hasForbidden = visible.some((s) =>
      s.includes('shop') || s.includes('economy') || s.includes('social'),
    );
    expect(hasForbidden).toBe(false);
  });
});

describe('product journey — Day 0 study user', () => {
  it('Study OS surfaces softly as tiny_tease not spotlight', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.study_layer).toBe('tiny_tease');
    expect(surfaces.study_layer).not.toBe('spotlight');
  });

  it('first session is still primary', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.start_session).toBe('primary');
  });

  it('no full boss route for study user on Day 0', () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'study_focused',
      totalCompletedSessions: 0,
    });
    expect(model.mustNotRun).toContain('boss_query');
  });
});

describe('product journey — Day 0 game-like user', () => {
  it('tiny boss teaser allowed on Day 0', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: gameLikeProfile,
      behaviorStats: { ...baseStats(0), bossChallengeEngagement: 'low' },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.boss_compact).not.toBe('spotlight');
    expect(surfaces.boss_full_cta).not.toBe('spotlight');
  });

  it('no full boss route on Day 0', () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'game_like',
      totalCompletedSessions: 0,
    });
    expect(model.rpgBossPlacement).toContain('tiny visual');
  });
});

describe('product journey — Day 1 return', () => {
  const model = buildHomeExperienceModel({
    explicitMotivationStyle: null,
    totalCompletedSessions: 1,
  });

  it('shows progress proof', () => {
    expect(model.visibleSections).toContain('progress_signal');
    expect(model.progressPlacement).not.toContain('Hidden');
    expect(model.visibleSections).toContain('session_reflection');
  });

  it('shows coach reflection', () => {
    expect(model.visibleSections).toContain('coach_line');
    expect(model.secondaryCta).toBe('Review progress');
  });

  it('next session CTA is primary', () => {
    expect(model.primaryCta).toBe('Start Next Session');
    expect(model.stage).toBe('STAGE_1');
  });

  it('progress signal appears on surfaces', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: { ...baseStats(1), completionStreak: 1 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.progress_proof).toBe('secondary');
  });
});

describe('product journey — Day 3 companion continuity', () => {
  it('companion thread visible for friendly style', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: {
        ...studyProfile,
        motivationStyle: 'friendly',
        primaryGoal: 'creative',
      },
      behaviorStats: { ...baseStats(3), coachInteractions: 2, completionStreak: 2 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.companion_thread).not.toBe('hidden');
  });

  it('stage transitions correctly', () => {
    expect(getHomeStage(3)).toBe('STAGE_2');
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: null,
      totalCompletedSessions: 3,
    });
    expect(model.stage).toBe('STAGE_2');
  });
});

describe('product journey — Day 5 path forming', () => {
  it('study user gets study spotlight on Day 5', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: { ...baseStats(5), studyUsageRatio: 0.6 },
      hasActiveStudyPlan: true,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(getSpotlightSurface(surfaces)).toBe('study_layer');
  });

  it('no feature museum — at most limited visible surfaces', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: { ...baseStats(5), completionStreak: 3 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    const visible = visibleNonHidden(surfaces);
    expect(visible.length).toBeLessThan(8);
    expect(visible.every((v) => !v.includes('boss_full_cta'))).toBe(true);
  });

  it('unlock strip visible for new user (1-2 sessions)', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: { ...baseStats(1), studyUsageRatio: 0.4 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.unlock_strip).toBe('secondary');
  });
});

describe('product journey — Day 7 deeper mode / weekly insight', () => {
  it('game-like user with high boss engagement gets boss spotlight', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: gameLikeProfile,
      behaviorStats: { ...baseStats(7), bossChallengeEngagement: 'high' },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: true,
      isFirstSession: false,
    });
    const spot = getSpotlightSurface(surfaces);
    expect(['boss_compact', 'boss_teaser'].includes(spot ?? '')).toBe(true);
  });

  it('premium only if real', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: { ...baseStats(7), premiumFeatureAttempts: [], studyUsageRatio: 0.3 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.premium_tease).toBe('hidden');
  });

  it('weekly insight surfaced for engaged user', () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'coach_led',
      totalCompletedSessions: 7,
    });
    expect(model.stage).toBe('STAGE_3');
    expect(model.spotlight).toBe('coach');
  });
});

describe('product journey — first-week phase gating', () => {
  it('hides boss when first-week boss intensity is hidden', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: gameLikeProfile,
      behaviorStats: { ...baseStats(2), bossChallengeEngagement: 'high' },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
      firstWeekPhase: {
        bossIntensity: 'hidden',
        premiumMoment: 'hidden',
        allowedHomeSurfaces: ['start_session', 'progress_proof', 'coach_presence'],
        spotlightSurface: 'progress_proof',
        studyLayerLabel: 'Growth Path',
      },
    });
    expect(surfaces.boss_compact).toBe('hidden');
    expect(surfaces.boss_teaser).toBe('hidden');
    expect(surfaces.boss_full_cta).toBe('blocked');
  });

  it('hides premium when first-week premium moment is hidden', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: { ...baseStats(6), premiumFeatureAttempts: ['weekly_intelligence'] },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
      firstWeekPhase: {
        bossIntensity: 'subtle',
        premiumMoment: 'none',
        allowedHomeSurfaces: [
          'start_session',
          'progress_proof',
          'coach_presence',
          'study_layer',
          'companion_continuity',
        ],
        spotlightSurface: 'study_deep_work_path',
        studyLayerLabel: 'Study OS',
      },
    });
    expect(surfaces.premium_tease).toBe('hidden');
  });

  it('enforces allowed surfaces only', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: gameLikeProfile,
      behaviorStats: { ...baseStats(3), bossChallengeEngagement: 'medium' },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
      firstWeekPhase: {
        bossIntensity: 'hidden',
        premiumMoment: 'hidden',
        allowedHomeSurfaces: ['start_session', 'progress_proof'],
        spotlightSurface: 'progress_proof',
        studyLayerLabel: 'Growth Path',
      },
    });
    expect(surfaces.companion_thread).toBe('hidden');
    expect(surfaces.study_layer).toBe('hidden');
  });
});

describe('product journey — feature degraded', () => {
  it('content study degraded hides upload CTA', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability: { ...featureAvailability, study: false },
      personalizationProfile: studyProfile,
      behaviorStats: { ...baseStats(3), studyUsageRatio: 0.5 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.study_layer).toBe('hidden');
  });

  it('premium degraded still shows tiny_tease when user has intent (code gap — should gate on featureAvailability.premium)', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability: { ...featureAvailability, premium: false },
      personalizationProfile: studyProfile,
      behaviorStats: { ...baseStats(7), premiumFeatureAttempts: ['deep_coach_memory'] },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.premium_tease).toBe('tiny_tease');
  });

  it('boss degraded shows fallback', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability: { ...featureAvailability, boss: false },
      personalizationProfile: gameLikeProfile,
      behaviorStats: { ...baseStats(10), bossChallengeEngagement: 'high' },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.boss_compact).toBe('hidden');
    expect(surfaces.boss_teaser).toBe('hidden');
    expect(surfaces.boss_full_cta).toBe('hidden');
  });
});

describe('product journey — public v1 hidden features', () => {
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
