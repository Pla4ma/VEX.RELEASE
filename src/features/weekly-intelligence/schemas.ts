import { z } from 'zod';
import { LaneSchema } from '../lane-engine/schemas';

// ── Weekly session summary input ──────────────────────────────────────
export const WeeklyInsightInputSchema = z
  .object({
    userId: z.string().min(1),
    lane: LaneSchema,
    totalSessions: z.number().int().min(0),
    totalFocusMinutes: z.number().int().min(0),
    completedSessions: z.number().int().min(0),
    avgDurationMinutes: z.number().min(0),
    bestDurationMinutes: z.number().int().min(0),
    avgFocusScore: z.number().min(0).max(100).optional(),
    bestTimeWindow: z.string().min(1).optional(),
    rescueCompleted: z.number().int().min(0),
    interruptionsAvg: z.number().min(0).optional(),
    reflectionCount: z.number().int().min(0),
    hasStudyPlan: z.boolean().optional(),
    weakTopics: z.array(z.string().min(1)).optional(),
    projectThreadExists: z.boolean().optional(),
    staleThreadDays: z.number().int().min(0).optional(),
    cleanStarts: z.number().int().min(0).optional(),
    recoveryWins: z.number().int().min(0).optional(),
    blockerPattern: z.string().min(1).optional(),
    nudgeDismissals: z.number().int().min(0).optional(),
    preferredNudgeTime: z.string().min(1).optional(),
  })
  .strict();

// ── What helped / what got in the way ────────────────────────────────
export const InsightFindingSchema = z
  .object({
    category: z.enum(['helped', 'blocked']),
    observation: z.string().min(1).max(300),
    confidence: z.enum(['weak', 'medium', 'strong']),
  })
  .strict();

// ── Weekly insight result ─────────────────────────────────────────────
export const WeeklyIntelligenceSchema = z
  .object({
    id: z.string().min(1),
    userId: z.string().min(1),
    lane: LaneSchema,
    weekLabel: z.string().min(1),
    whatHelped: z.array(InsightFindingSchema).max(3),
    whatGotInWay: z.array(InsightFindingSchema).max(3),
    bestNextSessionType: z
      .enum(['STUDY', 'DEEP_WORK', 'SPRINT', 'LIGHT_FOCUS', 'RECOVERY', 'REVIEW'])
      .optional(),
    suggestedFocusWindow: z.string().min(1).optional(),
    recommendedAdjustment: z.string().min(1).max(300),
    premiumDeeperInsight: z.string().min(1).max(200).optional(),
    hasEnoughData: z.boolean(),
    disclaimer: z.string().min(1),
    generatedAt: z.number().int().min(0),
  })
  .strict();

// ── Derived types ─────────────────────────────────────────────────────
export type WeeklyInsightInput = z.infer<typeof WeeklyInsightInputSchema>;
export type InsightFinding = z.infer<typeof InsightFindingSchema>;
export type WeeklyIntelligence = z.infer<typeof WeeklyIntelligenceSchema>;
