import { z } from 'zod';

import { SessionSummarySchema } from '../../session/types';

// ============================================================================
// Session Completion Ledger Schema (Phase 2)
// ============================================================================

export const CompletionLedgerSchema = z.object({
  ledgerId: z.string().uuid(),
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  idempotencyKey: z.string(),
  completedAt: z.number(),

  session: z.object({
    durationSeconds: z.number(),
    qualityScore: z.number(),
    pauseCount: z.number(),
  }),

  effects: z.object({
    boss: z.object({
      damageDealt: z.number(),
      defeated: z.boolean(),
      rewards: z.array(z.unknown()),
    }).optional(),

    streak: z.object({
      action: z.enum(['EXTENDED', 'SAVED_BY_INSURANCE', 'BROKEN']),
      previousDays: z.number(),
      newDays: z.number(),
    }),

    economy: z.object({
      xpEarned: z.number(),
      coinsEarned: z.number(),
    }),
  }),

  rewardStatus: z.enum(['PENDING', 'COMPLETE', 'PARTIAL', 'FAILED']),
  nextAction: z.object({
    type: z.enum(['NEW_SESSION', 'VIEW_PROGRESS', 'SHARE']),
    reason: z.string(),
  }),
}).strict();

export type CompletionLedger = z.infer<typeof CompletionLedgerSchema>;

// ============================================================================
// Navigation Params
// ============================================================================

export const SessionCompletionNavigationParamsSchema = z.object({
  sessionId: z.string().uuid(),
  summary: SessionSummarySchema,
});

export type SessionCompletionNavigationParams = z.infer<
  typeof SessionCompletionNavigationParamsSchema
>;

export const SessionCompletionHeroSchema = z.object({
  body: z.string(),
  eyebrow: z.string(),
  title: z.string(),
});

export type SessionCompletionHero = z.infer<
  typeof SessionCompletionHeroSchema
>;

export const SessionCompletionReturnPlanSchema = z.object({
  highlightMessage: z.string(),
  highlightTitle: z.string(),
  highlightTone: z.enum(['celebration', 'info', 'warning']),
  homeCtaLabel: z.string(),
  nextSessionLabel: z.string(),
  returnReasonBody: z.string(),
  returnReasonTitle: z.string(),
});

export type SessionCompletionReturnPlan = z.infer<
  typeof SessionCompletionReturnPlanSchema
>;
