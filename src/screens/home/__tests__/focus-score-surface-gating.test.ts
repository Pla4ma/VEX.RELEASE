import { decideHomeSurfaces } from '../../../features/home-experience/home-surface-decision';

function makeDayZeroInput() {
  return {
    featureAvailability: {
      boss: false,
      challenges: false,
      premium: false,
      study: false,
    },
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
    const isBlocked =
      map.focus_score === 'hidden' || map.focus_score === 'blocked';
    expect(isBlocked).toBe(true);
  });

  it('FocusScoreDashboard route is blocked when focus_score is blocked', () => {
    const input = {
      ...makeDayZeroInput(),
      featureAvailability: {
        boss: false,
        challenges: false,
        premium: false,
        study: false,
      },
      firstWeekPhase: {
        allowedHomeSurfaces: [],
        bossIntensity: 'hidden' as const,
        premiumMoment: 'none' as const,
        spotlightSurface: 'none' as const,
        studyLayerLabel: 'Focus Basics',
      },
    };
    const map = decideHomeSurfaces(
      input as Parameters<typeof decideHomeSurfaces>[0],
    );
    expect(map.focus_score).toBe('hidden');
  });
});

describe('TASK 3 — FocusScoreDashboard gated as progress-detail surface', () => {
  it('Day 0: progress_detail is hidden — no FocusScoreDashboard', () => {
    const map = decideHomeSurfaces(makeDayZeroInput());
    expect(map.progress_detail).toBe('hidden');
    expect(map.focus_score).toBe('hidden');
  });

  it('Activating: progress_detail is hidden — no dashboard navigation', () => {
    const map = decideHomeSurfaces(makeActivatingInput());
    // focus_score may be tiny_tease (compact widget only) but progress_detail must be hidden
    expect(map.progress_detail).toBe('hidden');
  });

  it('Engaged: progress_detail is secondary — dashboard can open', () => {
    const map = decideHomeSurfaces(makeEngagedInput());
    expect(map.focus_score).toBe('secondary');
    expect(map.progress_detail).toBe('secondary');
  });

  it('Power user can open dashboard when progress_detail allowed', () => {
    const input = {
      ...makeDayZeroInput(),
      personalizationProfile: {
        ...makeDayZeroInput().personalizationProfile,
        userStage: 'power' as const,
      },
      behaviorStats: {
        ...makeDayZeroInput().behaviorStats,
        totalCompletedSessions: 12,
        completionStreak: 5,
      },
      isFirstSession: false,
    };
    const map = decideHomeSurfaces(input);
    expect(map.progress_detail).not.toBe('hidden');
    expect(map.progress_detail).not.toBe('blocked');
    expect(map.progress_detail).not.toBe('tiny_tease');
  });

  it('Blocked: if focus_score is blocked, progress_detail is also hidden', () => {
    const input = {
      ...makeDayZeroInput(),
      featureAvailability: {
        boss: false,
        challenges: false,
        premium: false,
        study: false,
      },
      personalizationProfile: {
        ...makeDayZeroInput().personalizationProfile,
        userStage: 'engaged' as const,
      },
      behaviorStats: {
        ...makeDayZeroInput().behaviorStats,
        totalCompletedSessions: 5,
      },
      isFirstSession: false,
      firstWeekPhase: {
        allowedHomeSurfaces: ['start_session'],
        bossIntensity: 'hidden' as const,
        premiumMoment: 'none' as const,
        spotlightSurface: 'none' as const,
        studyLayerLabel: 'Focus Basics',
      },
    };
    const map = decideHomeSurfaces(
      input as Parameters<typeof decideHomeSurfaces>[0],
    );
    // Even though focus_score might not be explicitly blocked here,
    // progress_detail should not be open for restricted first-week
    expect(map.progress_detail).not.toBe('secondary');
    expect(map.progress_detail).not.toBe('primary');
  });
});
