import { z } from "zod";


export const VoiceToneSchema = z.enum(['ENCOURAGING', 'STERN', 'PLAYFUL', 'WISE', 'COMPETITIVE', 'GENTLE']);

export const CoachStyleSchema = z.enum(['CHEERLEADER', 'DRILL_SERGEANT', 'FRIEND', 'MENTOR', 'RIVAL', 'MINDFUL']);

export const MessageCategorySchema = z.enum(['STREAK_RISK', 'SESSION_SUGGESTION', 'MILESTONE_HYPE', 'COMEBACK_SUPPORT', 'POST_FAILURE', 'PROGRESS_REMINDER', 'DIFFICULTY_ADJUST', 'CHALLENGE_PROMPT', 'MOTIVATION_BOOST', 'BREAK_SUGGESTION', 'OVERLOAD_WARNING']);

export const ConditionTypeSchema = z.enum(['STREAK_DAYS', 'STREAK_RISK_LEVEL', 'SESSIONS_TODAY', 'SESSIONS_WEEK', 'LAST_SESSION_HOURS', 'CURRENT_LEVEL', 'TIME_OF_DAY', 'DAY_OF_WEEK', 'DAYS_INACTIVE', 'HAS_ACTIVE_BOSS', 'IS_PREMIUM', 'PREFERRED_SESSION_TIME', 'AVERAGE_SESSION_QUALITY', 'FAILED_SESSIONS_RECENT']);

export const SignalTypeSchema = z.enum(['SESSION_FREQUENCY', 'SESSION_QUALITY_TREND', 'STREAK_MAINTENANCE_RATE', 'PREFERRED_TIME_OF_DAY', 'FOCUS_DURATION_PREFERENCE', 'DIFFICULTY_PREFERENCE', 'SOCIAL_ENGAGEMENT', 'CHALLENGE_COMPLETION_RATE', 'BOSS_PARTICIPATION', 'MORNING_PERSON', 'NIGHT_OWL', 'WEEKEND_WARRIOR', 'CONSISTENCY_SCORE', 'RESPONSIVENESS_TO_REMINDERS', 'COMEBACK_VELOCITY']);

export const TriggerTypeSchema = z.enum(['STREAK_AT_RISK', 'NO_SESSION_24H', 'NO_SESSION_48H', 'NO_SESSION_72H', 'SESSION_ABANDONED', 'LOW_QUALITY_SESSION', 'MILESTONE_REACHED', 'LEVEL_UP', 'BOSS_TIMEOUT_WARNING', 'CHALLENGE_EXPIRING', 'COMEBACK_WINDOW_OPEN', 'DIFFICULTY_MISMATCH', 'OVERLOAD_DETECTED', 'MUTED_USER_REMINDER']);

export const ActionTypeSchema = z.enum(['SEND_MESSAGE', 'SEND_PUSH', 'SHOW_MODAL', 'SHOW_BANNER', 'SUGGEST_SESSION', 'ADJUST_DIFFICULTY', 'OFFER_CHALLENGE', 'SCHEDULE_REMINDER', 'ACTIVATE_COMEBACK', 'MUTE_NOTIFICATIONS']);

export const DeliveryMethodSchema = z.enum(['IN_APP', 'PUSH', 'BOTH', 'DEFERRED']);

export const ExecutionStatusSchema = z.enum(['PENDING', 'EXECUTED', 'SKIPPED', 'FAILED', 'CANCELLED']);

export const RecommendationTypeSchema = z.enum(['OPTIMAL_TIME', 'STREAK_PROTECTION', 'COMEBACK_BUILDER', 'DIFFICULTY_ADJUST', 'CHALLENGE_SYNC', 'BOSS_PREP', 'HABIT_BUILDER', 'ENERGY_BASED']);

export const RecommendationSourceSchema = z.enum(['HISTORICAL_PATTERN', 'STREAK_DATA', 'LEVEL_PROGRESS', 'CHALLENGE_DEADLINE', 'BOSS_STATUS', 'ENERGY_LEVEL', 'TIME_OF_DAY']);

export const RecommendationStatusSchema = z.enum(['ACTIVE', 'ACCEPTED', 'REJECTED', 'EXPIRED']);

export const ReminderTypeSchema = z.enum(['STREAK_WARNING', 'STREAK_CHECK', 'OPTIMAL_SESSION_TIME', 'CHALLENGE_DEADLINE', 'BOSS_TIMEOUT', 'COMEBACK_OPPORTUNITY', 'MILESTONE_APPROACHING', 'PERSONALIZED_MOTIVATION', 'BREAK_REMINDER']);

export const ComebackStatusSchema = z.enum(['OFFERED', 'ACTIVE', 'COMPLETED', 'EXPIRED', 'DECLINED']);

export const MessageStatusSchema = z.enum(['DRAFT', 'SCHEDULED', 'SENT', 'DELIVERED', 'READ', 'DISMISSED', 'EXPIRED']);

export const CoachUserStateSchema = z.enum(['COLD_START', 'LOW_CONFIDENCE', 'HIGH_CONFIDENCE', 'STREAK_AT_RISK', 'COMEBACK_MODE', 'POST_FAILURE_SUPPORT', 'MILESTONE_HYPE', 'OVERLOAD_PROTECTION', 'MUTED_MODE']);

export const CoachPersonaSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(50),
    description: z.string().max(500),
    avatarUrl: z.string().url().nullable(),
    voiceTone: VoiceToneSchema,
    style: CoachStyleSchema,
    catchphrase: z.string().max(200),
    defaultEnabled: z.boolean(),
  })
  .strict();

export const MessageConditionSchema = z
  .object({
    type: ConditionTypeSchema,
    operator: z.enum(['eq', 'gt', 'lt', 'gte', 'lte', 'in', 'between']),
    value: z.unknown(),
    field: z.string().optional(),
  })
  .strict();

export const CoachMessageTemplateSchema = z
  .object({
    id: z.string().uuid(),
    personaId: z.string().uuid(),
    category: MessageCategorySchema,
    subcategory: z.string().max(100),
    priority: z.number().int().min(1).max(10),
    content: z.string().min(1).max(1000),
    conditions: z.array(MessageConditionSchema).max(10),
    variations: z.array(z.string().max(1000)).max(5),
    cooldownHours: z.number().int().min(0).max(168),
  })
  .strict();

export const BehaviorSignalSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    signalType: SignalTypeSchema,
    value: z.number(),
    confidence: z.number().min(0).max(1),
    timestamp: z.number().int().positive(),
    metadata: z.record(z.unknown()),
    expiresAt: z.number().int().positive(),
  })
  .strict();

export const BehaviorProfileSchema = z
  .object({
    userId: z.string().uuid(),
    signals: z.array(BehaviorSignalSchema).max(50),
    lastUpdated: z.number().int().positive(),
    confidenceLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    coldStart: z.boolean(),
    dataPoints: z.number().int().min(0),
  })
  .strict();

export const InterventionTriggerSchema = z.object({ type: TriggerTypeSchema, threshold: z.number().optional() }).strict();

export const InterventionConditionSchema = z
  .object({
    field: z.string(),
    operator: z.enum(['eq', 'gt', 'lt', 'gte', 'lte', 'in']),
    value: z.unknown(),
  })
  .strict();

export const InterventionActionSchema = z
  .object({
    type: ActionTypeSchema,
    messageTemplateId: z.string().uuid().nullable(),
    deliveryMethod: DeliveryMethodSchema,
    delayMinutes: z.number().int().min(0).max(1440),
  })
  .strict();

export const InterventionRuleSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    trigger: InterventionTriggerSchema,
    conditions: z.array(InterventionConditionSchema).max(5),
    action: InterventionActionSchema,
    priority: z.number().int().min(1).max(100),
    cooldownHours: z.number().int().min(0).max(168),
    maxPerDay: z.number().int().min(1).max(50),
    enabled: z.boolean(),
  })
  .strict();

export const UserResponseSchema = z
  .object({
    action: z.enum(['STARTED_SESSION', 'DISMISSED', 'ENGAGED', 'IGNORED', 'MUTED']),
    timestamp: z.number().int().positive(),
    metadata: z.record(z.unknown()),
  })
  .strict();

export const InterventionExecutionSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    ruleId: z.string().uuid(),
    triggerType: TriggerTypeSchema,
    status: ExecutionStatusSchema,
    triggeredAt: z.number().int().positive(),
    executedAt: z.number().int().positive().nullable(),
    messageId: z.string().uuid().nullable(),
    userResponse: UserResponseSchema.nullable(),
    effectiveness: z.number().min(0).max(1).nullable(),
    result: z.record(z.unknown()).nullable().optional(),
  })
  .strict();

export const SessionRecommendationSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    recommendationType: RecommendationTypeSchema,
    title: z.string().min(1).max(100),
    description: z.string().max(500),
    priority: z.number().int().min(1).max(10),
    reason: z.string().max(500),
    metadata: z.record(z.unknown()).default({}),
    suggestedDuration: z.number().int().min(60).max(7200).optional(),
    suggestedDifficulty: z.enum(['EASY', 'NORMAL', 'CHALLENGING', 'PUSH']).optional(),
    reasoning: z.string().max(500).optional(),
    confidence: z.number().min(0).max(1).optional(),
    basedOn: z.array(RecommendationSourceSchema).max(5).optional(),
    expiresAt: z.number().int().positive(),
    createdAt: z.number().int().positive(),
    acceptedAt: z.number().int().positive().nullable().optional(),
    dismissedAt: z.number().int().positive().nullable().optional(),
    status: RecommendationStatusSchema,
  })
  .strict();

export const ReminderPlanSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    reminderType: ReminderTypeSchema,
    scheduledFor: z.number().int().positive(),
    messageId: z.string().uuid(),
    priority: z.number().int().min(1).max(10),
    sent: z.boolean(),
    sentAt: z.number().int().positive().nullable(),
    delivered: z.boolean(),
    opened: z.boolean(),
  })
  .strict();