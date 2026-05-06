import { z } from 'zod';
import type { SessionSummary } from '../../session/types';
import { CompletionLedgerSchema, type CompletionLedger } from './schemas';

export const PostSessionStoryViewModelSchema = z
  .object({
    companionReaction: z.object({
      reactionId: z.string().nullable(),
    }),
    dailyMission: z.object({
      missionId: z.string().nullable(),
      progressDelta: z.number(),
      status: z.string(),
    }),
    degradedWarnings: z.array(z.string()),
    focusScoreDeltaCard: z.object({
      delta: z.number().int(),
      label: z.string(),
    }),
    gradeCard: z.object({
      grade: z.string(),
      label: z.string(),
      score: z.number().min(0).max(100),
    }),
    nextActionCta: z.object({
      label: z.string(),
      route: z.enum(['Home', 'SessionSetup']),
    }),
    pendingSync: z.boolean(),
    rewardReveal: z.object({
      rewardIds: z.array(z.string()),
    }),
    sessionId: z.string().uuid(),
    streakState: z.object({
      action: z.string(),
      newDays: z.number().int().min(0),
      previousDays: z.number().int().min(0),
    }),
    xpProgress: z.object({
      xpDelta: z.number().int(),
    }),
  })
  .strict();
export type PostSessionStoryViewModel = z.infer<typeof PostSessionStoryViewModelSchema>;

export function buildPostSessionStoryViewModel(input: {
  degradedWarnings: string[];
  ledger: CompletionLedger;
  summary: SessionSummary;
}): PostSessionStoryViewModel {
  const ledger = CompletionLedgerSchema.parse(input.ledger);
  const degradedWarnings = Array.from(new Set(input.degradedWarnings));
  return PostSessionStoryViewModelSchema.parse({
    companionReaction: { reactionId: ledger.companionReactionId },
    dailyMission: ledger.dailyMissionResult,
    degradedWarnings,
    focusScoreDeltaCard: {
      delta: ledger.focusScoreDelta,
      label:
        ledger.focusScoreDelta >= 0
          ? `Focus Score +${ledger.focusScoreDelta}`
          : `Focus Score ${ledger.focusScoreDelta}`,
    },
    gradeCard: {
      grade: ledger.grade,
      label: `Grade ${ledger.grade}`,
      score: ledger.gradeScore,
    },
    nextActionCta: {
      label: degradedWarnings.length > 0 ? 'Return home safely' : 'Continue on home',
      route: 'Home',
    },
    pendingSync: ledger.offlineSyncStatus === 'pending_sync',
    rewardReveal: { rewardIds: ledger.rewardIds },
    sessionId: input.summary.sessionId,
    streakState: ledger.streakResult,
    xpProgress: { xpDelta: ledger.xpDelta },
  });
}
