import { z } from "zod";

export const VoiceToneSchema = z.enum([
  "ENCOURAGING",
  "STERN",
  "PLAYFUL",
  "WISE",
  "COMPETITIVE",
  "GENTLE",
]);

export const CoachStyleSchema = z.enum([
  "CHEERLEADER",
  "DRILL_SERGEANT",
  "FRIEND",
  "MENTOR",
  "RIVAL",
  "MINDFUL",
]);

export const MessageCategorySchema = z.enum([
  "STREAK_RISK",
  "SESSION_SUGGESTION",
  "MILESTONE_HYPE",
  "COMEBACK_SUPPORT",
  "POST_FAILURE",
  "PROGRESS_REMINDER",
  "DIFFICULTY_ADJUST",
  "CHALLENGE_PROMPT",
  "MOTIVATION_BOOST",
  "BREAK_SUGGESTION",
  "OVERLOAD_WARNING",
]);

export const ConditionTypeSchema = z.enum([
  "STREAK_DAYS",
  "STREAK_RISK_LEVEL",
  "SESSIONS_TODAY",
  "SESSIONS_WEEK",
  "LAST_SESSION_HOURS",
  "CURRENT_LEVEL",
  "TIME_OF_DAY",
  "DAY_OF_WEEK",
  "DAYS_INACTIVE",
  "HAS_ACTIVE_BOSS",
  "IS_PREMIUM",
  "PREFERRED_SESSION_TIME",
  "AVERAGE_SESSION_QUALITY",
  "FAILED_SESSIONS_RECENT",
]);

export const SignalTypeSchema = z.enum([
  "SESSION_FREQUENCY",
  "SESSION_QUALITY_TREND",
  "STREAK_MAINTENANCE_RATE",
  "PREFERRED_TIME_OF_DAY",
  "FOCUS_DURATION_PREFERENCE",
  "DIFFICULTY_PREFERENCE",
  "SOCIAL_ENGAGEMENT",
  "CHALLENGE_COMPLETION_RATE",
  "BOSS_PARTICIPATION",
  "MORNING_PERSON",
  "NIGHT_OWL",
  "WEEKEND_WARRIOR",
  "CONSISTENCY_SCORE",
  "RESPONSIVENESS_TO_REMINDERS",
  "COMEBACK_VELOCITY",
]);

export const TriggerTypeSchema = z.enum([
  "STREAK_AT_RISK",
  "NO_SESSION_24H",
  "NO_SESSION_48H",
  "NO_SESSION_72H",
  "SESSION_ABANDONED",
  "LOW_QUALITY_SESSION",
  "MILESTONE_REACHED",
  "LEVEL_UP",
  "BOSS_TIMEOUT_WARNING",
  "CHALLENGE_EXPIRING",
  "COMEBACK_WINDOW_OPEN",
  "DIFFICULTY_MISMATCH",
  "OVERLOAD_DETECTED",
  "MUTED_USER_REMINDER",
]);

export const ActionTypeSchema = z.enum([
  "SEND_MESSAGE",
  "SEND_PUSH",
  "SHOW_MODAL",
  "SHOW_BANNER",
  "SUGGEST_SESSION",
  "ADJUST_DIFFICULTY",
  "OFFER_CHALLENGE",
  "SCHEDULE_REMINDER",
  "ACTIVATE_COMEBACK",
  "MUTE_NOTIFICATIONS",
]);
export const DeliveryMethodSchema = z.enum([
  "IN_APP",
  "PUSH",
  "BOTH",
  "DEFERRED",
]);

export const ExecutionStatusSchema = z.enum([
  "PENDING",
  "EXECUTED",
  "SKIPPED",
  "FAILED",
  "CANCELLED",
]);

export const RecommendationTypeSchema = z.enum([
  "OPTIMAL_TIME",
  "STREAK_PROTECTION",
  "COMEBACK_BUILDER",
  "DIFFICULTY_ADJUST",
  "CHALLENGE_SYNC",
  "BOSS_PREP",
  "HABIT_BUILDER",
  "ENERGY_BASED",
]);

export const RecommendationSourceSchema = z.enum([
  "HISTORICAL_PATTERN",
  "STREAK_DATA",
  "LEVEL_PROGRESS",
  "CHALLENGE_DEADLINE",
  "BOSS_STATUS",
  "ENERGY_LEVEL",
  "TIME_OF_DAY",
]);

export const RecommendationStatusSchema = z.enum([
  "ACTIVE",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
]);

export const ReminderTypeSchema = z.enum([
  "STREAK_WARNING",
  "STREAK_CHECK",
  "OPTIMAL_SESSION_TIME",
  "CHALLENGE_DEADLINE",
  "BOSS_TIMEOUT",
  "COMEBACK_OPPORTUNITY",
  "MILESTONE_APPROACHING",
  "PERSONALIZED_MOTIVATION",
  "BREAK_REMINDER",
]);

export const ComebackStatusSchema = z.enum([
  "OFFERED",
  "ACTIVE",
  "COMPLETED",
  "EXPIRED",
  "DECLINED",
]);
export const MessageStatusSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "SENT",
  "DELIVERED",
  "READ",
  "DISMISSED",
  "EXPIRED",
]);

export const CoachUserStateSchema = z.enum([
  "COLD_START",
  "LOW_CONFIDENCE",
  "HIGH_CONFIDENCE",
  "STREAK_AT_RISK",
  "COMEBACK_MODE",
  "POST_FAILURE_SUPPORT",
  "MILESTONE_HYPE",
  "OVERLOAD_PROTECTION",
  "MUTED_MODE",
]);

// --- Inferred enum types ---

export type VoiceTone = z.infer<typeof VoiceToneSchema>;
export type CoachStyle = z.infer<typeof CoachStyleSchema>;
export type MessageCategory = z.infer<typeof MessageCategorySchema>;
export type ConditionType = z.infer<typeof ConditionTypeSchema>;
export type SignalType = z.infer<typeof SignalTypeSchema>;
export type TriggerType = z.infer<typeof TriggerTypeSchema>;
export type ActionType = z.infer<typeof ActionTypeSchema>;
export type DeliveryMethod = z.infer<typeof DeliveryMethodSchema>;
export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;
export type RecommendationType = z.infer<typeof RecommendationTypeSchema>;
export type RecommendationSource = z.infer<typeof RecommendationSourceSchema>;
export type RecommendationStatus = z.infer<typeof RecommendationStatusSchema>;
export type ReminderType = z.infer<typeof ReminderTypeSchema>;
export type ComebackStatus = z.infer<typeof ComebackStatusSchema>;
export type MessageStatus = z.infer<typeof MessageStatusSchema>;
export type CoachUserState = z.infer<typeof CoachUserStateSchema>;
