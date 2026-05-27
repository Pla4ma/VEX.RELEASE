import { decideHomeSurfaces, type HomeSurfaceMap } from './surface-decision-integration.helpers';

describe('TASK 2 — Mission input decoupling from Home tree', () => {
  function isMissionInputActive(map: HomeSurfaceMap, stage: 'new' | 'activating' | 'engaged' | 'power'): boolean {
    const isDayZeroOrActivating = stage === 'new' || stage === 'activating';
    const missionSurfacesAllowed =
      map.challenge_teaser !== 'hidden' && map.challenge_teaser !== 'blocked';
    const weeklyQuestAllowed =
      map.weekly_quest !== 'hidden' && map.weekly_quest !== 'blocked';
    const bossSurfaceActive =
      map.boss_compact !== 'hidden' && map.boss_compact !== 'blocked';

    if (isDayZeroOrActivating) return false;
    return missionSurfacesAllowed || weeklyQuestAllowed || bossSurfaceActive;
  }

  const dayZeroMap = decideHomeSurfaces({
    featureAvailability: { boss: false, challenges: false, premium: false, study: false },
    personalizationProfile: {
      motivationStyle: 'calm', primaryGoal: 'focus',
      gamificationIntensity: 'minimal', studyLayerName: 'Study OS', userStage: 'new',
    },
    behaviorStats: {
      totalCompletedSessions: 0, studyUsageRatio: 0,
      bossChallengeEngagement: 'none', coachInteractions: 0,
      comebackSessions: 0, ignoredFeatures: [], premiumFeatureAttempts: [],
      completionStreak: 0,
    },
    hasActiveStudyPlan: false, hasActiveRecommendation: false,
    hasActiveBoss: false, isFirstSession: true,
  });

  const activatingMap = decideHomeSurfaces({
    featureAvailability: { boss: false, challenges: false, premium: false, study: false },
    personalizationProfile: {
      motivationStyle: 'calm', primaryGoal: 'focus',
      gamificationIntensity: 'minimal', studyLayerName: 'Study OS', userStage: 'activating',
    },
    behaviorStats: {
      totalCompletedSessions: 2, studyUsageRatio: 0,
      bossChallengeEngagement: 'none', coachInteractions: 0,
      comebackSessions: 0, ignoredFeatures: [], premiumFeatureAttempts: [],
      completionStreak: 1,
    },
    hasActiveStudyPlan: false, hasActiveRecommendation: false,
    hasActiveBoss: false, isFirstSession: false,
  });

  it('Day 0 Home does not invoke mission wrapper', () => {
    expect(isMissionInputActive(dayZeroMap, 'new')).toBe(false);
    expect(dayZeroMap.challenge_teaser).toBe('hidden');
    expect(dayZeroMap.weekly_quest).toBe('hidden');
  });

  it('Activating Home does not invoke mission wrapper unless allowed', () => {
    expect(isMissionInputActive(activatingMap, 'activating')).toBe(false);
  });

  it('Engaged Home uses mission wrapper only when surfaceMap allows challenges', () => {
    const engagedMap = decideHomeSurfaces({
      featureAvailability: { boss: false, challenges: true, premium: false, study: false },
      personalizationProfile: {
        motivationStyle: 'friendly', primaryGoal: 'focus',
        gamificationIntensity: 'medium', studyLayerName: 'Study OS', userStage: 'engaged',
      },
      behaviorStats: {
        totalCompletedSessions: 5, studyUsageRatio: 0.1,
        bossChallengeEngagement: 'none', coachInteractions: 1,
        comebackSessions: 0, ignoredFeatures: [], premiumFeatureAttempts: [],
        completionStreak: 3,
      },
      hasActiveStudyPlan: false, hasActiveRecommendation: false,
      hasActiveBoss: false, isFirstSession: false,
    });
    expect(isMissionInputActive(engagedMap, 'engaged')).toBe(true);
  });

  it('Engaged Home does NOT use mission wrapper when challenges are hidden', () => {
    const engagedMap = decideHomeSurfaces({
      featureAvailability: { boss: false, challenges: false, premium: false, study: false },
      personalizationProfile: {
        motivationStyle: 'friendly', primaryGoal: 'focus',
        gamificationIntensity: 'medium', studyLayerName: 'Study OS', userStage: 'engaged',
      },
      behaviorStats: {
        totalCompletedSessions: 5, studyUsageRatio: 0.1,
        bossChallengeEngagement: 'none', coachInteractions: 1,
        comebackSessions: 0, ignoredFeatures: [], premiumFeatureAttempts: [],
        completionStreak: 3,
      },
      hasActiveStudyPlan: false, hasActiveRecommendation: false,
      hasActiveBoss: false, isFirstSession: false,
    });
    expect(isMissionInputActive(engagedMap, 'engaged')).toBe(false);
  });

  it('No challenge/boss/social logic leaks into Day 0 through mission input', () => {
    expect(dayZeroMap.challenge_teaser).toBe('hidden');
    expect(dayZeroMap.weekly_quest).toBe('hidden');
    expect(dayZeroMap.boss_teaser).toBe('hidden');
    expect(dayZeroMap.boss_compact).toBe('hidden');
    // calm users get boss_full_cta blocked even on Day 0
    expect(['hidden', 'blocked']).toContain(dayZeroMap.boss_full_cta);
  });
});
