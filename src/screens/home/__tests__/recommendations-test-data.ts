import type { HomeData } from './home-screen-recommendations-helpers';

export function createRecommendationsHomeData(): HomeData {
  return {
    companionMood: 'steady',
    controller: {
      activeStudyPlanQuery: { data: null },
      currentStreak: 5,
      disclosure: { features: { companion_detail: { isUnlocked: false } } },
      isLoading: false,
      isOnline: true,
      openSetup: jest.fn(),
      primaryRecommendation: {
        id: 'rec-1',
        reasoning: '6 PM is your best focus window.',
        suggestedDifficulty: 'NORMAL',
        suggestedDuration: 1800,
      },
      progressionQuery: { data: { level: 3 } },
      user: { avatar: null, firstName: 'Jamie' },
      userId: 'user-1',
    },
    dismissIntervention: jest.fn(),
    intervention: null,
    showToast: jest.fn(),
    streakHoursRemaining: 10,
    unreadNotificationCount: 0,
  };
}

export function resetRecommendationsMocks(
  mockState: { homeData: HomeData },
  createHomeData: () => HomeData,
): void {
  jest.clearAllMocks();
  mockState.homeData = createHomeData();
}
