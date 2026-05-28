export type StreakState =
  | "ACTIVE"
  | "AT_RISK"
  | "CRITICAL"
  | "BROKEN"
  | "RECOVERING"
  | "PROTECTED";

export interface StreakStateInfo {
  state: StreakState;
  label: string;
  description: string;
  color: string;
  icon: string;
  animation: string;
  urgency: "none" | "low" | "medium" | "high" | "critical";
  coachMessage: string;
  entryThreshold?: number;
  exitThreshold?: number;
}

export interface StreakMilestone {
  days: number;
  title: string;
  name: string;
  description: string;
  badgeIcon: string;
  rewardType: "COSMETIC" | "SHIELD" | "XP" | "FEATURE";
  rewardId: string;
  visualEffect: string;
  achieved: boolean;
  achievedAt: number | null;
  rewards: Array<{ type: string; value: number }>;
}

export interface StreakInsurance {
  id: string;
  userId: string;
  source: string;
  count: number;
  earnedAt: number;
}

export type InsuranceSource =
  | "MILESTONE_7"
  | "MILESTONE_14"
  | "MILESTONE_30"
  | "MILESTONE_100"
  | "ACHIEVEMENT_COMPLETE"
  | "BOSS_DEFEAT"
  | "PURCHASED"
  | "SPECIAL_EVENT"
  | "monthly_premium";

export interface StreakRecoveryPlan {
  userId: string;
  daysLost: number;
  sessionsRequired: number;
  currentProgress: number;
  completed: boolean;
  reward: { type: string; value: number };
  expiresAt: number;
  previousStreak: number;
  isRecovering: boolean;
}

export interface StreakProtectionResult {
  protected: boolean;
  method: "INSURANCE" | "SHIELD" | "NONE";
  insuranceId: string | null;
  newState: StreakState;
  message: string;
}

export interface InsuranceItem {
  id: string;
  source: string;
  status: "active" | "used";
  earnedAt: number;
}
