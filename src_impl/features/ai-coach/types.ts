export type VoiceTone = 'ENCOURAGING' | 'STERN' | 'PLAYFUL' | 'WISE' | 'COMPETITIVE' | 'GENTLE';

export type CoachStyle = 'CHEERLEADER' | 'DRILL_SERGEANT' | 'FRIEND' | 'MENTOR' | 'RIVAL' | 'MINDFUL';

// ============================================================================
// Coach Content Registry Types
// ============================================================================
export type MessageCategory = 'STREAK_RISK' | 'SESSION_SUGGESTION' | 'MILESTONE_HYPE' | 'COMEBACK_SUPPORT' | 'POST_FAILURE' | 'PROGRESS_REMINDER' | 'DIFFICULTY_ADJUST' | 'CHALLENGE_PROMPT' | 'MOTIVATION_BOOST' | 'BREAK_SUGGESTION' | 'OVERLOAD_WARNING';
export type ConditionType = 'STREAK_DAYS' | 'STREAK_RISK_LEVEL' | 'SESSIONS_TODAY' | 'SESSIONS_WEEK' | 'LAST_SESSION_HOURS' | 'CURRENT_LEVEL' | 'TIME_OF_DAY' | 'DAY_OF_WEEK' | 'DAYS_INACTIVE' | 'HAS_ACTIVE_BOSS' | 'IS_PREMIUM' | 'PREFERRED_SESSION_TIME' | 'AVERAGE_SESSION_QUALITY' | 'FAILED_SESSIONS_RECENT';

// ============================================================================
// Intervention Types (for repository/interventions.ts)
// ============================================================================

export type InterventionType = 'STREAK_RISK' | 'SESSION_SUGGESTION' | 'DIFFICULTY_ADJUST' | 'MOTIVATION_BOOST' | 'CHALLENGE_PROMPT' | 'BREAK_SUGGESTION';

export type InterventionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ============================================================================
// Behavior Signal Types
// ============================================================================
export type SignalType = 'SESSION_FREQUENCY' | 'SESSION_QUALITY_TREND' | 'STREAK_MAINTENANCE_RATE' | 'PREFERRED_TIME_OF_DAY' | 'FOCUS_DURATION_PREFERENCE' | 'DIFFICULTY_PREFERENCE' | 'SOCIAL_ENGAGEMENT' | 'CHALLENGE_COMPLETION_RATE' | 'BOSS_PARTICIPATION' | 'MORNING_PERSON' | 'NIGHT_OWL' | 'WEEKEND_WARRIOR' | 'CONSISTENCY_SCORE' | 'RESPONSIVENESS_TO_REMINDERS' | 'COMEBACK_VELOCITY';
// ============================================================================
// Intervention Types
// ============================================================================
export type TriggerType = 'STREAK_AT_RISK' | 'NO_SESSION_24H' | 'NO_SESSION_48H' | 'NO_SESSION_72H' | 'SESSION_ABANDONED' | 'LOW_QUALITY_SESSION' | 'MILESTONE_REACHED' | 'LEVEL_UP' | 'BOSS_TIMEOUT_WARNING' | 'CHALLENGE_EXPIRING' | 'COMEBACK_WINDOW_OPEN' | 'DIFFICULTY_MISMATCH' | 'OVERLOAD_DETECTED' | 'MUTED_USER_REMINDER';
export type ActionType = 'SEND_MESSAGE' | 'SEND_PUSH' | 'SHOW_MODAL' | 'SHOW_BANNER' | 'SUGGEST_SESSION' | 'ADJUST_DIFFICULTY' | 'OFFER_CHALLENGE' | 'SCHEDULE_REMINDER' | 'ACTIVATE_COMEBACK' | 'MUTE_NOTIFICATIONS';

export type DeliveryMethod = 'IN_APP' | 'PUSH' | 'BOTH' | 'DEFERRED';
export type ExecutionStatus = 'PENDING' | 'EXECUTED' | 'SKIPPED' | 'FAILED' | 'CANCELLED';
// ============================================================================
// Recommendation Types
// ============================================================================
export type RecommendationType = 'OPTIMAL_TIME' | 'STREAK_PROTECTION' | 'COMEBACK_BUILDER' | 'DIFFICULTY_ADJUST' | 'CHALLENGE_SYNC' | 'BOSS_PREP' | 'HABIT_BUILDER' | 'ENERGY_BASED';

export type RecommendationSource = 'HISTORICAL_PATTERN' | 'STREAK_DATA' | 'LEVEL_PROGRESS' | 'CHALLENGE_DEADLINE' | 'BOSS_STATUS' | 'ENERGY_LEVEL' | 'TIME_OF_DAY';

export type RecommendationStatus = 'ACTIVE' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

// ============================================================================
// Reminder Types
// ============================================================================
export type ReminderType = 'STREAK_WARNING' | 'STREAK_CHECK' | 'OPTIMAL_SESSION_TIME' | 'CHALLENGE_DEADLINE' | 'BOSS_TIMEOUT' | 'COMEBACK_OPPORTUNITY' | 'MILESTONE_APPROACHING' | 'PERSONALIZED_MOTIVATION' | 'BREAK_REMINDER';

// ============================================================================
// Comeback Engine Types
// ============================================================================
export type ComebackStatus = 'OFFERED' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'DECLINED';
// ============================================================================
// Adaptive Difficulty Types
// ============================================================================
// ============================================================================
// Coach Delivery Types
// ============================================================================
export type MessageStatus = 'DRAFT' | 'SCHEDULED' | 'SENT' | 'DELIVERED' | 'READ' | 'DISMISSED' | 'EXPIRED';
// ============================================================================
// Coach State Types
// ============================================================================

export type CoachUserState = 'COLD_START' | 'LOW_CONFIDENCE' | 'HIGH_CONFIDENCE' | 'STREAK_AT_RISK' | 'COMEBACK_MODE' | 'POST_FAILURE_SUPPORT' | 'MILESTONE_HYPE' | 'OVERLOAD_PROTECTION' | 'MUTED_MODE';
// ============================================================================
// Analytics Types
// ============================================================================
// ============================================================================
// Service Input Types
// ============================================================================
export * from "./types.types";
