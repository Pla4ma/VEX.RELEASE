import { z } from "zod";

export const MemoryCandidateSchema = z
  .object({
    id: z.string().min(1),
    content: z.string().min(1),
    source: z.enum(["study_block", "recall", "reflection", "import"]),
    sourceId: z.string().min(1),
    confidence: z.enum(["weak", "medium", "strong"]),
    tags: z.array(z.string().min(1)),
    createdAt: z.number().int().min(0),
    userId: z.string().min(1),
  })
  .strict();

export type MemoryCandidate = z.infer<typeof MemoryCandidateSchema>;

export const MemoryCandidateInputSchema = z
  .object({
    content: z.string().min(1).max(2000),
    source: z.enum(["study_block", "recall", "reflection", "import"]),
    sourceId: z.string().min(1),
    tags: z.array(z.string().min(1)).optional().default([]),
    userId: z.string().min(1),
  })
  .strict();

export type MemoryCandidateInput = z.infer<typeof MemoryCandidateInputSchema>;

export const MemoryCandidateListSchema = z.array(MemoryCandidateSchema);
export type MemoryCandidateList = z.infer<typeof MemoryCandidateListSchema>;

export const MemoryCandidateQueryResultSchema = z
  .object({
    candidates: MemoryCandidateListSchema,
    total: z.number().int().min(0),
  })
  .strict();

export const InsightCategorySchema = z.enum([
  "start_friction",
  "session_shape",
  "mode_behavior",
  "notification_behavior",
  "rescue_behavior",
  "project_continuity",
  "study_continuity",
  "general",
]);

export type InsightCategory = z.infer<typeof InsightCategorySchema>;

export const LearnedItemSchema = z
  .object({
    id: z.string().min(1),
    observation: z.string().min(1).max(200),
    evidence: z.string().min(1).max(200),
    confidence: z.enum(["weak", "medium", "strong"]),
    insightCategory: InsightCategorySchema.optional(),
    recommendedAction: z.string().min(1).max(160).optional(),
    humilityNote: z.string().min(1).max(160).optional(),
    lane: z
      .enum(["student", "game_like", "deep_creative", "minimal_normal"])
      .optional(),
    userVisible: z.boolean(),
    editedByUser: z.boolean(),
    deletedByUser: z.boolean(),
    createdAt: z.number().int().min(0),
  })
  .strict();

export type LearnedItem = z.infer<typeof LearnedItemSchema>;

export const WhatVEXLearnedSchema = z
  .object({
    id: z.string().min(1),
    userId: z.string().min(1),
    totalSessions: z.number().int().min(0),
    items: z.array(LearnedItemSchema),
    hasEnoughEvidence: z.boolean(),
    disclaimer: z.string().min(1),
    lastUpdated: z.number().int().min(0),
  })
  .strict();

export type WhatVEXLearned = z.infer<typeof WhatVEXLearnedSchema>;

export const WhatVEXLearnedInputSchema = z
  .object({
    userId: z.string().min(1),
    totalSessions: z.number().int().min(0),
    totalFocusMinutes: z.number().int().min(0),
    streakDays: z.number().int().min(0),
    lane: z
      .enum(["student", "game_like", "deep_creative", "minimal_normal"])
      .optional(),
    primaryGoal: z.string().min(1).optional(),
    averageFocusScore: z.number().min(0).max(100).optional(),
    bestSessionDurationMinutes: z.number().int().min(0).optional(),
    mostProductiveTimeLabel: z.string().min(1).optional(),
    completedSessions: z.number().int().min(0),
    rescueSessionsCompleted: z.number().int().min(0).optional().default(0),
    abandonedStarts: z.number().int().min(0).optional().default(0),
    avgDelayBeforeStartSeconds: z.number().min(0).optional(),
    shortCompletions: z.number().int().min(0).optional().default(0),
    earlyQuits: z.number().int().min(0).optional().default(0),
    pausedMidSession: z.number().int().min(0).optional().default(0),
    resumedAfterPause: z.number().int().min(0).optional().default(0),
    bestDurationRangeMin: z.number().int().optional(),
    bestDurationRangeMax: z.number().int().optional(),
    modeChanges: z.number().int().min(0).optional().default(0),
    prefersModeAfterMissedDays: z.string().min(1).optional(),
    hasNamedStudyTargets: z.boolean().optional(),
    hasSavedNextMoves: z.boolean().optional(),
    eveningNudgeDismissals: z.number().int().min(0).optional().default(0),
    morningNudgeOpens: z.number().int().min(0).optional().default(0),
    genericNudgeIgnores: z.number().int().min(0).optional().default(0),
    rescueAcceptsAfterMiss: z.number().int().min(0).optional().default(0),
    rescueShortCompletions: z.number().int().min(0).optional().default(0),
    rescueTinyStartCompletions: z.number().int().min(0).optional().default(0),
    savedHandoffs: z.number().int().min(0).optional().default(0),
    returnedToNextMove: z.number().int().min(0).optional().default(0),
    staleProjectDays: z.number().int().min(0).optional(),
    completedNamedStudyTargets: z.number().int().min(0).optional().default(0),
    markedTopicsForReview: z.number().int().min(0).optional().default(0),
    repeatedWeakTopics: z.number().int().min(0).optional().default(0),
    usedReviewNextAction: z.number().int().min(0).optional().default(0),
  })
  .strict();

export type WhatVEXLearnedInput = z.infer<typeof WhatVEXLearnedInputSchema>;
