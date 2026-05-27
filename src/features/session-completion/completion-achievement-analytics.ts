import { capture } from "../../shared/analytics/analytics-service";

export function trackSessionRewardMultiplierActivated(
  userId: string,
  sessionId: string,
  multiplierId: string,
  multiplierType: string,
  multiplierValue: number,
  duration: number,
  activatedAt: Date,
  trigger: {
    type: string;
    condition: string;
    value: unknown;
  },
  scope: {
    sessions: string[];
    rewards: string[];
    conditions: unknown[];
  },
  cost: {
    type: string;
    amount: number;
    source: string;
  },
  benefits: {
    estimated: number;
    actual?: number;
    efficiency: number;
  },
): void {
  capture("session_completion_reward_multiplier_activated", {
    user_id: userId,
    session_id: sessionId,
    multiplier_id: multiplierId,
    multiplier_type: multiplierType,
    multiplier_value: multiplierValue,
    duration,
    activated_at: activatedAt.toISOString(),
    trigger,
    scope,
    cost,
    benefits,
  });
}

// ============================================================================
// ACHIEVEMENT ANALYTICS
// ============================================================================

export function trackSessionAchievementUnlocked(
  userId: string,
  sessionId: string,
  achievementId: string,
  achievementName: string,
  achievementType:
    | "completion"
    | "performance"
    | "streak"
    | "special"
    | "hidden",
  progress: {
    current: number;
    required: number;
    percentage: number;
  },
  criteria: {
    type: string;
    condition: string;
    value: unknown;
    met: boolean;
  }[],
  rarity: string,
  points: number,
  rewards: {
    experience: number;
    currency: number;
    items: unknown[];
    titles: string[];
  },
  recognition: {
    badge: string;
    celebration: boolean;
    shareable: boolean;
    public: boolean;
  },
  firstTime: boolean,
  chainProgress?: {
    chainId: string;
    current: number;
    total: number;
    next: string;
  },
): void {
  capture("session_completion_achievement_unlocked", {
    user_id: userId,
    session_id: sessionId,
    achievement_id: achievementId,
    achievement_name: achievementName,
    achievement_type: achievementType,
    progress,
    criteria,
    rarity,
    points,
    rewards,
    recognition,
    first_time: firstTime,
    chain_progress: chainProgress,
  });
}

export function trackSessionAchievementProgressUpdated(
  userId: string,
  sessionId: string,
  achievementId: string,
  previousProgress: number,
  currentProgress: number,
  requiredProgress: number,
  increment: number,
  contributingAction: string,
  context: {
    sessionId: string;
    objective: string;
    performance: unknown;
  },
  nextMilestone?: {
    progress: number;
    reward: unknown;
    celebration: boolean;
  },
  estimatedCompletion?: {
    sessions: number;
    timeframe: number;
    confidence: number;
  },
): void {
  capture("session_completion_achievement_progress_updated", {
    user_id: userId,
    session_id: sessionId,
    achievement_id: achievementId,
    previous_progress: previousProgress,
    current_progress: currentProgress,
    required_progress: requiredProgress,
    increment,
    contributing_action: contributingAction,
    context,
    next_milestone: nextMilestone,
    estimated_completion: estimatedCompletion,
  });
}

// ============================================================================
// FEEDBACK ANALYTICS
// ============================================================================
