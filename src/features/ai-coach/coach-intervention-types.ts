import type { DeliveryMethod } from "./coach-message-types";

export type InterventionType =
  | "STREAK_RISK"
  | "SESSION_SUGGESTION"
  | "DIFFICULTY_ADJUST"
  | "MOTIVATION_BOOST"
  | "CHALLENGE_PROMPT"
  | "BREAK_SUGGESTION";

export type InterventionSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SignalType =
  | "SESSION_FREQUENCY"
  | "SESSION_QUALITY_TREND"
  | "STREAK_MAINTENANCE_RATE"
  | "PREFERRED_TIME_OF_DAY"
  | "FOCUS_DURATION_PREFERENCE"
  | "DIFFICULTY_PREFERENCE"
  | "SOCIAL_ENGAGEMENT"
  | "CHALLENGE_COMPLETION_RATE"
  | "BOSS_PARTICIPATION"
  | "MORNING_PERSON"
  | "NIGHT_OWL"
  | "WEEKEND_WARRIOR"
  | "CONSISTENCY_SCORE"
  | "RESPONSIVENESS_TO_REMINDERS"
  | "COMEBACK_VELOCITY";

export type TriggerType =
  | "STREAK_AT_RISK"
  | "NO_SESSION_24H"
  | "NO_SESSION_48H"
  | "NO_SESSION_72H"
  | "SESSION_ABANDONED"
  | "LOW_QUALITY_SESSION"
  | "MILESTONE_REACHED"
  | "LEVEL_UP"
  | "BOSS_TIMEOUT_WARNING"
  | "CHALLENGE_EXPIRING"
  | "COMEBACK_WINDOW_OPEN"
  | "DIFFICULTY_MISMATCH"
  | "OVERLOAD_DETECTED"
  | "MUTED_USER_REMINDER";

export type ActionType =
  | "SEND_MESSAGE"
  | "SEND_PUSH"
  | "SHOW_MODAL"
  | "SHOW_BANNER"
  | "SUGGEST_SESSION"
  | "ADJUST_DIFFICULTY"
  | "OFFER_CHALLENGE"
  | "SCHEDULE_REMINDER"
  | "ACTIVATE_COMEBACK"
  | "MUTE_NOTIFICATIONS";

export type ExecutionStatus =
  | "PENDING"
  | "EXECUTED"
  | "SKIPPED"
  | "FAILED"
  | "CANCELLED";

export interface BehaviorSignal {
  id: string;
  userId: string;
  signalType: SignalType;
  value: number;
  confidence: number;
  timestamp: number;
  metadata: Record<string, unknown>;
  expiresAt: number;
}

export interface BehaviorProfile {
  userId: string;
  signals: BehaviorSignal[];
  lastUpdated: number;
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH";
  coldStart: boolean;
  dataPoints: number;
}

export interface InterventionTrigger {
  type: TriggerType;
  threshold?: number;
}

export interface InterventionCondition {
  field: string;
  operator: "eq" | "gt" | "lt" | "gte" | "lte" | "in";
  value: unknown;
}

export interface InterventionAction {
  type: ActionType;
  messageTemplateId: string | null;
  deliveryMethod: DeliveryMethod;
  delayMinutes: number;
}

export interface InterventionRule {
  id: string;
  name: string;
  trigger: InterventionTrigger;
  conditions: InterventionCondition[];
  action: InterventionAction;
  priority: number;
  cooldownHours: number;
  maxPerDay: number;
  enabled: boolean;
}

export interface UserResponse {
  action: "STARTED_SESSION" | "DISMISSED" | "ENGAGED" | "IGNORED" | "MUTED";
  timestamp: number;
  metadata: Record<string, unknown>;
}

export interface InterventionExecution {
  id: string;
  userId: string;
  ruleId: string;
  status: ExecutionStatus;
  triggeredAt: number;
  executedAt: number | null;
  messageId: string | null;
  userResponse: UserResponse | null;
  effectiveness: number | null;
}
