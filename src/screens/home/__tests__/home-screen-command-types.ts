export type Recommendation = {
  id: string;
  reasoning: string;
  suggestedDifficulty: string;
  suggestedDuration: number;
};

export type HomeData = {
  companionMood: string;
  controller: {
    activeStudyPlanQuery: { data: { title: string } | null };
    currentStreak: number;
    disclosure: { features: { companion_detail: { isUnlocked: boolean } } };
    isLoading: boolean;
    isOnline: boolean;
    learningExecutionLayer: {
      copy: { homeCta: string; homeTitle: string; layerName: string };
    };
    openSetup: () => void;
    primaryRecommendation: Recommendation | null;
    progressionQuery: { data: { level: number } };
    user: { avatar: string | null; firstName: string };
    userId: string;
  };
  dismissIntervention: () => void;
  intervention: null;
  showToast: () => void;
  streakHoursRemaining: number;
  unreadNotificationCount: number;
};
