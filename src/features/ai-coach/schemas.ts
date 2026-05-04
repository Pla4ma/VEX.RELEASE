import { z } from 'zod';
export const VoiceToneSchema = z.enum([
  'ENCOURAGING',
  'STERN',
  'PLAYFUL',
  'WISE',
  'COMPETITIVE',
  'GENTLE',
]);
export const CoachStyleSchema = z.enum([
  'CHEERLEADER',
  'DRILL_SERGEANT',
  'FRIEND',
  'MENTOR',
  'RIVAL',
  'MINDFUL',
]);
export const MessageCategorySchema = z.enum([
  'STREAK_RISK',
  'SESSION_SUGGESTION',
  'MILESTONE_HYPE',
  'COMEBACK_SUPPORT',
  'POST_FAILURE',
  'PROGRESS_REMINDER',
  'DIFFICULTY_ADJUST',
  'CHALLENGE_PROMPT',
  'MOTIVATION_BOOST',
  'BREAK_SUGGESTION',
  'OVERLOAD_WARNING',
]);
export const ConditionTypeSchema = z.enum([
  'STREAK_DAYS',
  'STREAK_RISK_LEVEL',
  'SESSIONS_TODAY',
  'SESSIONS_WEEK',
  'LAST_SESSION_HOURS',
  'CURRENT_LEVEL',
  'TIME_OF_DAY',
  'DAY_OF_WEEK',
  'DAYS_INACTIVE',
  'HAS_ACTIVE_BOSS',
  'IS_PREMIUM',
  'PREFERRED_SESSION_TIME',
  'AVERAGE_SESSION_QUALITY',
  'FAILED_SESSIONS_RECENT',
]);
export const SignalTypeSchema = z.enum([
  'SESSION_FREQUENCY',
  'SESSION_QUALITY_TREND',
  'STREAK_MAINTENANCE_RATE',
  'PREFERRED_TIME_OF_DAY',
  'FOCUS_DURATION_PREFERENCE',
  'DIFFICULTY_PREFERENCE',
  'SOCIAL_ENGAGEMENT',
  'CHALLENGE_COMPLETION_RATE',
  'BOSS_PARTICIPATION',
  'MORNING_PERSON',
  'NIGHT_OWL',
  'WEEKEND_WARRIOR',
  'CONSISTENCY_SCORE',
  'RESPONSIVENESS_TO_REMINDERS',
  'COMEBACK_VELOCITY',
]);
export const TriggerTypeSchema = z.enum([
  'STREAK_AT_RISK',
  'NO_SESSION_24H',
  'NO_SESSION_48H',
  'NO_SESSION_72H',
  'SESSION_ABANDONED',
  'LOW_QUALITY_SESSION',
  'MILESTONE_REACHED',
  'LEVEL_UP',
  'BOSS_TIMEOUT_WARNING',
  'CHALLENGE_EXPIRING',
  'COMEBACK_WINDOW_OPEN',
  'DIFFICULTY_MISMATCH',
  'OVERLOAD_DETECTED',
  'MUTED_USER_REMINDER',
]);
export const ActionTypeSchema = z.enum([
  'SEND_MESSAGE',
  'SEND_PUSH',
  'SHOW_MODAL',
  'SHOW_BANNER',
  'SUGGEST_SESSION',
  'ADJUST_DIFFICULTY',
  'OFFER_CHALLENGE',
  'SCHEDULE_REMINDER',
  'ACTIVATE_COMEBACK',
  'MUTE_NOTIFICATIONS',
]);
export const DeliveryMethodSchema = z.enum([
  'IN_APP',
  'PUSH',
  'BOTH',
  'DEFERRED',
]);
export const ExecutionStatusSchema = z.enum([
  'PENDING',
  'EXECUTED',
  'SKIPPED',
  'FAILED',
  'CANCELLED',
]);
export const RecommendationTypeSchema = z.enum([
  'OPTIMAL_TIME',
  'STREAK_PROTECTION',
  'COMEBACK_BUILDER',
  'DIFFICULTY_ADJUST',
  'CHALLENGE_SYNC',
  'BOSS_PREP',
  'HABIT_BUILDER',
  'ENERGY_BASED',
]);
export const RecommendationSourceSchema = z.enum([
  'HISTORICAL_PATTERN',
  'STREAK_DATA',
  'LEVEL_PROGRESS',
  'CHALLENGE_DEADLINE',
  'BOSS_STATUS',
  'ENERGY_LEVEL',
  'TIME_OF_DAY',
]);
export const RecommendationStatusSchema = z.enum([
  'ACTIVE',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
]);
export const ReminderTypeSchema = z.enum([
  'STREAK_WARNING',
  'STREAK_CHECK',
  'OPTIMAL_SESSION_TIME',
  'CHALLENGE_DEADLINE',
  'BOSS_TIMEOUT',
  'COMEBACK_OPPORTUNITY',
  'MILESTONE_APPROACHING',
  'PERSONALIZED_MOTIVATION',
  'BREAK_REMINDER',
]);
export const ComebackStatusSchema = z.enum([
  'OFFERED',
  'ACTIVE',
  'COMPLETED',
  'EXPIRED',
  'DECLINED',
]);
export const MessageStatusSchema = z.enum([
  'DRAFT',
  'SCHEDULED',
  'SENT',
  'DELIVERED',
  'READ',
  'DISMISSED',
  'EXPIRED',
]);
export const CoachUserStateSchema = z.enum([
  'COLD_START',
  'LOW_CONFIDENCE',
  'HIGH_CONFIDENCE',
  'STREAK_AT_RISK',
  'COMEBACK_MODE',
  'POST_FAILURE_SUPPORT',
  'MILESTONE_HYPE',
  'OVERLOAD_PROTECTION',
  'MUTED_MODE',
]);
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
export const InterventionTriggerSchema = z
  .object({ type: TriggerTypeSchema, threshold: z.number().optional() })
  .strict();
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
    action: z.enum([
      'STARTED_SESSION',
      'DISMISSED',
      'ENGAGED',
      'IGNORED',
      'MUTED',
    ]),
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
export const ComebackMessageSchema = z
  .object({
    id: z.string().uuid(),
    day: z.number().int().min(1).max(7),
    content: z.string().max(500),
    sent: z.boolean(),
    sentAt: z.number().int().positive().nullable(),
  })
  .strict();
export const ComebackPlanSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    previousStreak: z.number().int().min(0),
    daysInactive: z.number().int().min(1),
    status: ComebackStatusSchema,
    startedAt: z.number().int().positive(),
    expiresAt: z.number().int().positive(),
    sessionsCompleted: z.number().int().min(0),
    targetSessions: z.number().int().min(1).max(7),
    bonusMultiplier: z.number().min(1).max(5),
    messages: z.array(ComebackMessageSchema).max(7),
  })
  .strict();
export const DifficultyProfileSchema = z
  .object({
    userId: z.string().uuid(),
    currentDifficulty: z.number().min(1).max(10),
    recommendedDifficulty: z.number().min(1).max(10),
    lastAdjustmentAt: z.number().int().positive(),
    adjustmentReason: z.string().max(200).nullable(),
    successRateRecent: z.number().min(0).max(1),
    successRateOverall: z.number().min(0).max(1),
    trend: z.enum(['IMPROVING', 'STABLE', 'DECLINING']),
  })
  .strict();
export const CoachMessageSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    personaId: z.string().uuid(),
    category: MessageCategorySchema,
    content: z.string().max(1000),
    deliveryMethod: DeliveryMethodSchema,
    priority: z.number().int().min(1).max(10),
    status: MessageStatusSchema,
    createdAt: z.number().int().positive(),
    scheduledFor: z.number().int().positive().nullable(),
    deliveredAt: z.number().int().positive().nullable(),
    readAt: z.number().int().positive().nullable(),
    dismissedAt: z.number().int().positive().nullable(),
    actionTaken: z.string().max(100).nullable(),
    actionTakenAt: z.number().int().positive().nullable(),
  })
  .strict();
export const CoachHistorySchema = z
  .object({
    userId: z.string().uuid(),
    messages: z.array(CoachMessageSchema).max(100),
    totalMessages: z.number().int().min(0),
    responseRate: z.number().min(0).max(1),
    preferredCategories: z.array(MessageCategorySchema).max(5),
    mutedCategories: z.array(MessageCategorySchema).max(11),
    lastMessageAt: z.number().int().positive(),
  })
  .strict();
export const CoachStateSchema = z
  .object({
    userId: z.string().uuid(),
    currentState: CoachUserStateSchema,
    previousState: CoachUserStateSchema.nullable(),
    stateEnteredAt: z.number().int().positive(),
    personaId: z.string().uuid(),
    behaviorProfile: BehaviorProfileSchema.nullable(),
    lastInterventionAt: z.number().int().positive().nullable(),
    interventionsToday: z.number().int().min(0),
    muteUntil: z.number().int().positive().nullable(),
    reduceNotifications: z.boolean(),
  })
  .strict();
export const CoachEffectivenessSchema = z
  .object({
    messageId: z.string().uuid(),
    category: MessageCategorySchema,
    userId: z.string().uuid(),
    deliveredAt: z.number().int().positive(),
    opened: z.boolean(),
    actionTaken: z.boolean(),
    actionType: z.string().max(100).nullable(),
    timeToAction: z.number().int().positive().nullable(),
    subsequentSessionCompleted: z.boolean(),
    subsequentSessionQuality: z.number().min(0).max(100).nullable(),
  })
  .strict();
export const GenerateMessageInputSchema = z
  .object({
    userId: z.string().uuid(),
    category: MessageCategorySchema,
    context: z.record(z.unknown()),
    preferredDelivery: DeliveryMethodSchema,
  })
  .strict();
export const ProcessBehaviorSignalInputSchema = z
  .object({
    userId: z.string().uuid(),
    signalType: SignalTypeSchema,
    value: z.number(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();
export const EvaluateInterventionsInputSchema = z
  .object({
    userId: z.string().uuid(),
    trigger: TriggerTypeSchema,
    context: z.record(z.unknown()),
  })
  .strict();
export const CreateRecommendationInputSchema = z
  .object({
    userId: z.string().uuid(),
    type: RecommendationTypeSchema,
    context: z.record(z.unknown()),
  })
  .strict();
export const ScheduleReminderInputSchema = z
  .object({
    userId: z.string().uuid(),
    reminderType: ReminderTypeSchema,
    scheduledFor: z.number().int().positive(),
    priority: z.number().int().min(1).max(10).optional(),
  })
  .strict();
export const ActivateComebackInputSchema = z
  .object({
    userId: z.string().uuid(),
    previousStreak: z.number().int().min(0),
    daysInactive: z.number().int().min(1),
  })
  .strict();
export const AdjustDifficultyInputSchema = z
  .object({
    userId: z.string().uuid(),
    reason: z.string().min(1).max(200),
    targetDifficulty: z.number().min(1).max(10).optional(),
  })
  .strict();
export const MarkMessageActionInputSchema = z
  .object({
    messageId: z.string().uuid(),
    action: z.string().min(1).max(100),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();
export const UpdateCoachPreferencesInputSchema = z
  .object({
    userId: z.string().uuid(),
    personaId: z.string().uuid().optional(),
    mutedCategories: z.array(MessageCategorySchema).optional(),
    reduceNotifications: z.boolean().optional(),
    muteUntil: z.number().int().positive().nullable().optional(),
  })
  .strict();
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
export type CoachPersona = z.infer<typeof CoachPersonaSchema>;
export type MessageCondition = z.infer<typeof MessageConditionSchema>;
export type CoachMessageTemplate = z.infer<typeof CoachMessageTemplateSchema>;
export type BehaviorSignal = z.infer<typeof BehaviorSignalSchema>;
export type BehaviorProfile = z.infer<typeof BehaviorProfileSchema>;
export type InterventionTrigger = z.infer<typeof InterventionTriggerSchema>;
export type InterventionCondition = z.infer<typeof InterventionConditionSchema>;
export type InterventionAction = z.infer<typeof InterventionActionSchema>;
export type InterventionRule = z.infer<typeof InterventionRuleSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type InterventionExecution = z.infer<typeof InterventionExecutionSchema>;
export type SessionRecommendation = z.infer<typeof SessionRecommendationSchema>;
export type ReminderPlan = z.infer<typeof ReminderPlanSchema>;
export type ComebackMessage = z.infer<typeof ComebackMessageSchema>;
export type ComebackPlan = z.infer<typeof ComebackPlanSchema>;
export type DifficultyProfile = z.infer<typeof DifficultyProfileSchema>;
export type CoachMessage = z.infer<typeof CoachMessageSchema>;
export type CoachHistory = z.infer<typeof CoachHistorySchema>;
export type CoachState = z.infer<typeof CoachStateSchema>;
export type CoachEffectiveness = z.infer<typeof CoachEffectivenessSchema>;
export type GenerateMessageInput = z.infer<typeof GenerateMessageInputSchema>;
export type ProcessBehaviorSignalInput = z.infer<
  typeof ProcessBehaviorSignalInputSchema
>;
export type EvaluateInterventionsInput = z.infer<
  typeof EvaluateInterventionsInputSchema
>;
export type CreateRecommendationInput = z.infer<
  typeof CreateRecommendationInputSchema
>;
export type ScheduleReminderInput = z.infer<typeof ScheduleReminderInputSchema>;
export type ActivateComebackInput = z.infer<typeof ActivateComebackInputSchema>;
export type AdjustDifficultyInput = z.infer<typeof AdjustDifficultyInputSchema>;
export type MarkMessageActionInput = z.infer<
  typeof MarkMessageActionInputSchema
>;
export type UpdateCoachPreferencesInput = z.infer<
  typeof UpdateCoachPreferencesInputSchema
>;
