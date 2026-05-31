import { decideHomeSurfaces } from '../home-surface-decision';

const featureAvailability = {
  boss: true,
  challenges: true,
  premium: true,
  study: true,
};

function baseStats(overrides = {}) {
  return {
    bossChallengeEngagement: 'none' as const,
    coachInteractions: 0,
    comebackSessions: 0,
    completionStreak: 0,
    ignoredFeatures: [],
    premiumFeatureAttempts: [],
    studyUsageRatio: 0,
    totalCompletedSessions: 6,
    ...overrides,
  };
}

function profile(overrides = {}) {
  return {
    gamificationIntensity: 'medium' as const,
    motivationStyle: 'coach_led' as const,
    primaryGoal: 'work' as const,
    studyLayerName: 'Focus Plan',
    userStage: 'engaged' as const,
    ...overrides,
  };
}

describe('home lane surfaces', () => {
  it('student lane can surface Study OS without boss full CTA', () => {
    const map = decideHomeSurfaces({
      behaviorStats: baseStats({ studyUsageRatio: 0.7 }),
      featureAvailability,
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: true,
      isFirstSession: false,
      personalizationProfile: profile({
        motivationStyle: 'student',
        primaryGoal: 'study',
        studyLayerName: 'Study OS',
      }),
    });

    expect(map.study_os).toBe('secondary');
    expect(map.boss_full_cta).not.toBe('primary');
  });

  it('game-like lane gets run board while old economy remains absent', () => {
    const map = decideHomeSurfaces({
      behaviorStats: baseStats({ bossChallengeEngagement: 'high' }),
      featureAvailability,
      hasActiveBoss: true,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: profile({
        gamificationIntensity: 'strong',
        motivationStyle: 'game_like',
      }),
    });

    expect(map.run_board).toBe('secondary');
    expect(Object.keys(map)).not.toEqual(
      expect.arrayContaining(['shop', 'wagers', 'gems']),
    );
  });

  it('deep creative lane gets project continuity surfaces', () => {
    const map = decideHomeSurfaces({
      behaviorStats: baseStats({ projectFocusUsageRatio: 0.6 }),
      featureAvailability,
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: profile({ primaryGoal: 'creative' }),
    });

    expect(map.project_thread).toBe('secondary');
    expect(map.focus_window).toBe('secondary');
  });

  it('minimal lane gets today strip and blocks boss noise', () => {
    const map = decideHomeSurfaces({
      behaviorStats: baseStats({ bossChallengeEngagement: 'high' }),
      featureAvailability,
      hasActiveBoss: true,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: profile({
        gamificationIntensity: 'minimal',
        motivationStyle: 'calm',
      }),
      laneProfile: { primaryLane: 'minimal_normal' },
    });

    expect(map.today_strip).toBe('secondary');
    expect(map.boss_full_cta).toBe('blocked');
    expect(map.boss_compact).toBe('hidden');
  });

  it('clean lane user can switch to game_like lane to unlock more gamification', () => {
    const cleanMap = decideHomeSurfaces({
      behaviorStats: baseStats({
        totalCompletedSessions: 6,
        bossChallengeEngagement: 'high',
      }),
      featureAvailability,
      hasActiveBoss: true,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: profile({
        gamificationIntensity: 'minimal',
        motivationStyle: 'calm',
      }),
      laneProfile: { primaryLane: 'minimal_normal' },
    });
    expect(cleanMap.boss_compact).toBe('hidden');
    expect(cleanMap.boss_full_cta).toBe('blocked');

    const gameMap = decideHomeSurfaces({
      behaviorStats: baseStats({
        totalCompletedSessions: 6,
        bossChallengeEngagement: 'high',
      }),
      featureAvailability,
      hasActiveBoss: true,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: profile({
        gamificationIntensity: 'strong',
        motivationStyle: 'game_like',
      }),
      laneProfile: { primaryLane: 'game_like' },
    });
    expect(gameMap.run_board).not.toBe('hidden');
    expect(gameMap.boss_compact).not.toBe('hidden');
  });

  it('suppresses hidden lane surfaces before query hooks can request them', () => {
    const map = decideHomeSurfaces({
      behaviorStats: baseStats({ ignoredFeatures: ['study_os', 'rescue_cta'] }),
      featureAvailability,
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: true,
      isFirstSession: false,
      personalizationProfile: profile({
        motivationStyle: 'student',
        primaryGoal: 'study',
      }),
    });

    expect(map.study_os).toBe('hidden');
    expect(map.rescue_cta).toBe('hidden');
  });
});
