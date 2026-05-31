export interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  currentProgress: number;
  targetProgress: number;
  rewardAmount: number;
  rewardType: 'XP' | 'COINS' | 'GEMS';
  isCompleted: boolean;
  isClaimed: boolean;
  timeRemainingMinutes: number;
}

export interface TodaysChallengesWidgetProps {
  /** Today's challenges */
  challenges: ChallengeItem[];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Navigate to challenges screen */
  onViewAll: () => void;
  /** Claim reward handler */
  onClaimReward?: (challengeId: string) => void;
  /** Retry handler for error state */
  onRetry?: () => void;
}
