export type ProgressMetric = {
  id: string;
  label: string;
  value: string;
  progress: number;
  accent: string;
  reward?: string;
  icon?: string;
  showPlusBadge?: boolean;
};

export type StudyProgress = {
  progressLabel: string;
  taskLabel: string;
  taskTitle: string;
  progress: number;
  isCompleting: boolean;
  error: string | null;
  onMarkComplete: () => void;
  onSkip: () => void;
  // Enhanced study progress details (10.2)
  planTitle: string;
  chaptersCompleted: number;
  totalChapters: number;
  quizAccuracy: number | null;
  totalStudyTimeMinutes: number;
  nextSessionGoal: {
    topic: string;
    suggestedDurationMinutes: number;
  } | null;
};

export type SessionProgressionCardProps = {
  isRewardSyncing: boolean;
  levelMetric: ProgressMetric | null;
  rewardCreditStatus: 'idle' | 'crediting' | 'success' | 'retrying' | 'failed';
  rewardError: string | null;
  streakLabel: string;
  streakIncreased: boolean;
  studyProgress: StudyProgress | null;
  onRetryRewards: () => void;
  onStartNewSession: () => void;
};
