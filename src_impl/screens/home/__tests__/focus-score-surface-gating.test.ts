import { decideHomeSurfaces } from '../../../features/home-experience/home-surface-decision';

function makeDayZeroInput() {
  return {
    featureAvailability: { boss: false, challenges: false, premium: false, study: false },
    personalizationProfile: {
      motivationStyle: 'friendly' as const,
      primaryGoal: 'focus' as const,
      gamificationIntensity: 'medium' as const,
      studyLayerName: 'Study OS',
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
    firstWeekPhase: undefined,
  };
}

function makeActivatingInput() {
  return {
    ...makeDayZeroInput(),
    personalizationProfile: {
      ...makeDayZeroInput().personalizationProfile,
      userStage: 'activating' as const,
    },
    behaviorStats: {
      ...makeDayZeroInput().behaviorStats,
      totalCompletedSessions: 2,
    },
    isFirstSession: false,
  };
}

function makeEngagedInput() {
  return {
    ...makeDayZeroInput(),
    personalizationProfile: {
      ...makeDayZeroInput().personalizationProfile,
      userStage: 'engaged' as const,
    },
    behaviorStats: {
      ...makeDayZeroInput().behaviorStats,
      totalCompletedSessions: 5,
      completionStreak: 3,
    },
    isFirstSession: false,
  };
}

describe('HomeFocusScore surface gating', () => {
  it('Day 0: focus_score is hidden — no FocusScoreDashboard CTA', () => {
    const map = decideHomeSurfaces(makeDayZeroInput());
    expect(map.focus_score).toBe('hidden');
    expect(map.progress_proof).toBe('hidden');
  });

  it('Activating user: focus_score is tiny_tease (compact progress only)', () => {
    const map = decideHomeSurfaces(makeActivatingInput());
    expect(map.focus_score).toBe('tiny_tease');
  });

  it('Engaged user: focus_score is secondary (can see focus score)', () => {
    const map = decideHomeSurfaces(makeEngagedInput());
    expect(map.focus_score).toBe('secondary');
  });

  it('FocusScoreDashboard route is not reachable when focus_score is hidden', () => {
    const map = decideHomeSurfaces(makeDayZeroInput());
    const isBlocked = map.focus_score === 'hidden' || map.focus_score === 'blocked';
    expect(isBlocked).toBe(true);
  });

  it('FocusScoreDashboard route is blocked when focus_score is blocked', () => {
    const input = {
      ...makeDayZeroInput(),
      featureAvailability: { boss: false, challenges: false, premium: false, study: false },
      firstWeekPhase: {
        allowedHomeSurfaces: [],
        bossIntensity: 'hidden' as const,
        premiumMoment: 'none' as const,
        spotlightSurface: 'none' as const,
        studyLayerLabel: 'Focus Basics',
      },
    };
    const map = decideHomeSurfaces(input as Parameters<typeof decideHomeSurfaces>[0]);
    expect(map.focus_score).toBe('hidden');
  });
});
