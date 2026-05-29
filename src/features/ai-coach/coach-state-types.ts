import type { MessageCategory, DeliveryMethod } from "./coach-message-types";
import type {
  BehaviorProfile,
  SignalType,
  TriggerType,
} from "./coach-intervention-types";

export type RecommendationType =
  | "OPTIMAL_TIME"
  | "STREAK_PROTECTION"
  | "COMEBACK_BUILDER"
  | "DIFFICULTY_ADJUST"
  | "CHALLENGE_SYNC"
  | "BOSS_PREP"
  | "HABIT_BUILDER"
  | "ENERGY_BASED";

export type RecommendationSource =
  | "HISTORICAL_PATTERN"
  | "STREAK_DATA"
  | "LEVEL_PROGRESS"
  | "CHALLENGE_DEADLINE"
  | "BOSS_STATUS"
  | "ENERGY_LEVEL"
  | "TIME_OF_DAY";

export type RecommendationStatus =
  | "ACTIVE"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

export type ReminderType =
  | "STREAK_WARNING"
  | "STREAK_CHECK"
  | "OPTIMAL_SESSION_TIME"
  | "CHALLENGE_DEADLINE"
  | "BOSS_TIMEOUT"
  | "COMEBACK_OPPORTUNITY"
  | "MILESTONE_APPROACHING"
  | "PERSONALIZED_MOTIVATION"
  | "BREAK_REMINDER";

export type ComebackStatus =
  | "OFFERED"
  | "ACTIVE"
  | "COMPLETED"
  | "EXPIRED"
  | "DECLINED";

export type CoachUserState =
  | "COLD_START"
  | "LOW_CONFIDENCE"
  | "HIGH_CONFIDENCE"
  | "STREAK_AT_RISK"
  | "COMEBACK_MODE"
  | "POST_FAILURE_SUPPORT"
  | "MILESTONE_HYPE"
  | "OVERLOAD_PROTECTION"
  | "MUTED_MODE";

export interface SessionRecommendation {
  id: string;
  userId: string;
  type: RecommendationType;
  suggestedDuration: number;
  suggestedDifficulty: "EASY" | "NORMAL" | "CHALLENGING" | "PUSH";
  reasoning: string;
  confidence: number;
  basedOn: RecommendationSource[];
  expiresAt: number;
  status: RecommendationStatus;
}

export interface ReminderPlan {
  id: string;
  userId: string;
  reminderType: ReminderType;
  scheduledFor: number;
  messageId: string;
  priority: number;
  sent: boolean;
  sentAt: number | null;
  delivered: boolean;
  opened: boolean;
}

export interface ComebackMessage {
  id: string;
  day: number;
  content: string;
  sent: boolean;
  sentAt: number | null;
}

export interface ComebackPlan {
  id: string;
  userId: string;
  previousStreak: number;
  daysInactive: number;
  status: ComebackStatus;
  startedAt: number;
  expiresAt: number;
  sessionsCompleted: number;
  targetSessions: number;
  bonusMultiplier: number;
  messages: ComebackMessage[];
}

export interface DifficultyProfile {
  userId: string;
  currentDifficulty: number;
  recommendedDifficulty: number;
  lastAdjustmentAt: number;
  adjustmentReason: string | null;
  successRateRecent: number;
  successRateOverall: number;
  trend: "IMPROVING" | "STABLE" | "DECLINING";
}

export interface CoachState {
  userId: string;
  currentState: CoachUserState;
  previousState: CoachUserState | null;
  stateEnteredAt: number;
  personaId: string;
  behaviorProfile: BehaviorProfile | null;
  lastInterventionAt: number | null;
  interventionsToday: number;
  muteUntil: number | null;
  reduceNotifications: boolean;
}

export interface CoachEffectiveness {
  messageId: string;
  category: MessageCategory;
  userId: string;
  deliveredAt: number;
  opened: boolean;
  actionTaken: boolean;
  actionType: string | null;
  timeToAction: number | null;
  subsequentSessionCompleted: boolean;
  subsequentSessionQuality: number | null;
}

export interface GenerateMessageInput {
  userId: string;
  category: MessageCategory;
  context: Record<string, unknown>;
  preferredDelivery: DeliveryMethod;
}

export interface ProcessBehaviorSignalInput {
  userId: string;
  signalType: SignalType;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface EvaluateInterventionsInput {
  userId: string;
  trigger: TriggerType;
  context: Record<string, unknown>;
}

export interface CreateRecommendationInput {
  userId: string;
  type: RecommendationType;
  context: Record<string, unknown>;
}

export interface ScheduleReminderInput {
  userId: string;
  reminderType: ReminderType;
  scheduledFor: number;
  priority?: number;
}
export interface ActivateComebackInput {
  userId: string;
  previousStreak: number;
  daysInactive: number;
}
export interface AdjustDifficultyInput {
  userId: string;
  reason: string;
  targetDifficulty?: number;
}
export interface MarkMessageActionInput {
  messageId: string;
  action: string;
  metadata?: Record<string, unknown>;
}
export interface UpdateCoachPreferencesInput {
  userId: string;
  personaId?: string;
  mutedCategories?: MessageCategory[];
  reduceNotifications?: boolean;
  muteUntil?: number | null;
}