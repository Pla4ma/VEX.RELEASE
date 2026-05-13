import { z } from "zod";


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