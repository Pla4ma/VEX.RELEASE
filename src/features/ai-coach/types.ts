export interface CoachPersona {
  id: string;
  name: string;
  description: string;
  avatarUrl: string | null;
  voiceTone: VoiceTone;
  style: CoachStyle;
  catchphrase: string;
  defaultEnabled: boolean;
}
export type VoiceTone =
  | "ENCOURAGING"
  | "STERN"
  | "PLAYFUL"
  | "WISE"
  | "COMPETITIVE"
  | "GENTLE";
export type CoachStyle =
  | "CHEERLEADER"
  | "DRILL_SERGEANT"
  | "FRIEND"
  | "MENTOR"
  | "RIVAL"
  | "MINDFUL";
export interface CoachMessageTemplate {
  id: string;
  personaId: string;
  category: MessageCategory;
  subcategory: string;
  priority: number;
  content: string;
  conditions: MessageCondition[];
  variations: string[];
  cooldownHours: number;
}
export type MessageCategory =
  | "STREAK_RISK"
  | "SESSION_SUGGESTION"
  | "MILESTONE_HYPE"
  | "COMEBACK_SUPPORT"
  | "POST_FAILURE"
  | "PROGRESS_REMINDER"
  | "DIFFICULTY_ADJUST"
  | "CHALLENGE_PROMPT"
  | "MOTIVATION_BOOST"
  | "BREAK_SUGGESTION"
  | "OVERLOAD_WARNING";
export interface MessageCondition {
  type: ConditionType;
  operator: "eq" | "gt" | "lt" | "gte" | "lte" | "in" | "between";
  value: unknown;
  field?: string;
}
export type ConditionType =
  | "STREAK_DAYS"
  | "STREAK_RISK_LEVEL"
  | "SESSIONS_TODAY"
  | "SESSIONS_WEEK"
  | "LAST_SESSION_HOURS"
  | "CURRENT_LEVEL"
  | "TIME_OF_DAY"
  | "DAY_OF_WEEK"
  | "DAYS_INACTIVE"
  | "HAS_ACTIVE_BOSS"
  | "IS_PREMIUM"
  | "PREFERRED_SESSION_TIME"
  | "AVERAGE_SESSION_QUALITY"
  | "FAILED_SESSIONS_RECENT";
export type InterventionType =
  | "STREAK_RISK"
  | "SESSION_SUGGESTION"
  | "DIFFICULTY_ADJUST"
  | "MOTIVATION_BOOST"
  | "CHALLENGE_PROMPT"
  | "BREAK_SUGGESTION";
export type InterventionSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
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
export interface BehaviorProfile {
  userId: string;
  signals: BehaviorSignal[];
  lastUpdated: number;
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH";
  coldStart: boolean;
  dataPoints: number;
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
export interface InterventionTrigger {
  type: TriggerType;
  threshold?: number;
}
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
export type DeliveryMethod = "IN_APP" | "PUSH" | "BOTH" | "DEFERRED";
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
export type ExecutionStatus =
  | "PENDING"
  | "EXECUTED"
  | "SKIPPED"
  | "FAILED"
  | "CANCELLED";
export interface UserResponse {
  action: "STARTED_SESSION" | "DISMISSED" | "ENGAGED" | "IGNORED" | "MUTED";
  timestamp: number;
  metadata: Record<string, unknown>;
}
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
export type ComebackStatus =
  | "OFFERED"
  | "ACTIVE"
  | "COMPLETED"
  | "EXPIRED"
  | "DECLINED";
export interface ComebackMessage {
  id: string;
  day: number;
  content: string;
  sent: boolean;
  sentAt: number | null;
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
export interface CoachMessage {
  id: string;
  userId: string;
  personaId: string;
  category: MessageCategory;
  content: string;
  deliveryMethod: DeliveryMethod;
  priority: number;
  status: MessageStatus;
  createdAt: number;
  scheduledFor: number | null;
  deliveredAt: number | null;
  readAt: number | null;
  dismissedAt: number | null;
  actionTaken: string | null;
  actionTakenAt: number | null;
}
export type MessageStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "DISMISSED"
  | "EXPIRED";
export interface CoachHistory {
  userId: string;
  messages: CoachMessage[];
  totalMessages: number;
  responseRate: number;
  preferredCategories: MessageCategory[];
  mutedCategories: MessageCategory[];
  lastMessageAt: number;
}
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
