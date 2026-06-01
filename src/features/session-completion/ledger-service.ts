import { z } from 'zod';
import { SessionMode, SessionModeSchema } from '../../session/modes';
import { SessionSummarySchema, type SessionSummary } from '../../session/types';
import { calculateSessionGrade } from './grading-service';
import { CompletionLedgerSchema, type CompletionLedger } from './schemas';

const BuildCompletionLedgerInputSchemaBase = z.object({
  backgroundTimeSeconds: z.number().int().min(0).default(0),
  companionReactionId: z.string().nullable().default(null),
  completedAt: z.number().int().nonnegative().optional(),
  dailyMissionResult:
    CompletionLedgerSchema.shape.dailyMissionResult.optional(),
  degradedSystems: z.array(z.string()).default([]),
  focusScoreDelta: z.number().int().optional(),
  idempotencyKey: z.string().min(1).optional(),
  interruptionCount: z.number().int().min(0).optional(),
  isAbandoned: z.boolean().default(false),
  isRecoverySession: z.boolean().default(false),
  offlineSyncStatus:
    CompletionLedgerSchema.shape.offlineSyncStatus.default('synced'),
  pauseCount: z.number().int().min(0).optional(),
  rewardIds: z.array(z.string()).default([]),
  sessionId: z.string().uuid(),
  startedAt: z.number().int().nonnegative().optional(),
  strictMode: z.boolean().optional(),
  summary: SessionSummarySchema,
  timezone: z.string().min(1).default('UTC'),
  userId: z.string().min(1),
  xpDelta: z.number().int().optional(),
});

export type BuildCompletionLedgerInput = {
  userId: string;
  sessionId: string;
  summary: SessionSummary;
  backgroundTimeSeconds?: number;
  companionReactionId?: string | null;
  completedAt?: number;
  dailyMissionResult?: CompletionLedger['dailyMissionResult'];
  degradedSystems?: string[];
  focusScoreDelta?: number;
  idempotencyKey?: string;
  interruptionCount?: number;
  isAbandoned?: boolean;
  isRecoverySession?: boolean;
  offlineSyncStatus?: CompletionLedger['offlineSyncStatus'];
  pauseCount?: number;
  rewardIds?: string[];
  startedAt?: number;
  strictMode?: boolean;
  timezone?: string;
  xpDelta?: number;
};

function toLedgerMode(
  input: SessionSummary,
): z.infer<typeof CompletionLedgerSchema.shape.mode> {
  const parsed = SessionModeSchema.safeParse(input.sessionMode);
  return parsed.success ? parsed.data : SessionMode.FLOW;
}

function createIdempotencyKey(sessionId: string): string {
  return `${sessionId}:completed`;
}

export function buildCompletionLedger(
  rawInput: BuildCompletionLedgerInput,
): CompletionLedger {
  const input = BuildCompletionLedgerInputSchemaBase.parse(rawInput);
  const completedAt = input.completedAt ?? Date.now();
  const startedAt =
    input.startedAt ??
    Math.max(0, completedAt - input.summary.plannedDuration * 1000);
  const pauseCount = input.pauseCount ?? input.summary.pauses ?? 0;
  const interruptionCount =
    input.interruptionCount ?? input.summary.interruptions ?? 0;
  const strictMode = input.strictMode ?? false;
  const grading = calculateSessionGrade({
    backgroundTimeSeconds: input.backgroundTimeSeconds,
    completedDurationSeconds: input.summary.actualDuration,
    effectiveFocusedSeconds: input.summary.effectiveDuration,
    interruptionCount,
    isAbandoned: input.isAbandoned,
    isRecoverySession:
      input.isRecoverySession ||
      input.summary.sessionMode === SessionMode.RECOVERY,
    mode: input.summary.sessionMode,
    pauseCount,
    strictMode,
    targetDurationSeconds: input.summary.plannedDuration,
  });

  const grade = grading.kind === 'completed' ? grading.grade : 'D';
  const gradeScore =
    grading.kind === 'completed' ? Math.round(grading.gradeScore) : 20;
  const qualityScore = grading.kind === 'completed' ? grading.qualityScore : 20;
  const focusScoreDelta =
    input.focusScoreDelta ?? grading.focusScoreImpactRecommendation;
  const xpDelta =
    input.xpDelta ??
    Math.round(input.summary.xpEarned * grading.xpQualityMultiplier);

  return CompletionLedgerSchema.parse({
    companionReactionId: input.companionReactionId,
    completedAt,
    completedDurationSeconds: input.summary.actualDuration,
    createdAt: Date.now(),
    dailyMissionResult: input.dailyMissionResult ?? {
      missionId: null,
      progressDelta: 0,
      status: 'unchanged',
    },
    degradedSystems: input.degradedSystems,
    effectiveFocusedSeconds: input.summary.effectiveDuration,
    focusScoreDelta,
    grade,
    gradeScore,
    idempotencyKey:
      input.idempotencyKey ?? createIdempotencyKey(input.sessionId),
    interruptionCount,
    ledgerId: crypto.randomUUID(),
    mode: toLedgerMode(input.summary),
    offlineSyncStatus: input.offlineSyncStatus,
    pauseCount,
    qualityScore,
    rewardIds: input.rewardIds,
    sessionId: input.sessionId,
    startedAt,
    streakResult: {
      action: input.summary.streakIncreased ? 'extended' : 'maintained',
      newDays: input.summary.streakDays ?? 0,
      previousDays: Math.max(
        0,
        (input.summary.streakDays ?? 0) -
          (input.summary.streakIncreased ? 1 : 0),
      ),
    },
    strictMode,
    targetDurationSeconds: input.summary.plannedDuration,
    timezone: input.timezone,
    userId: input.userId,
    xpDelta,
  });
}
