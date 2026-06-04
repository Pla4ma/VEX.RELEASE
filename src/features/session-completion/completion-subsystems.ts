import * as Sentry from '@sentry/react-native';

import type { SessionSummary } from '../../session/types';
import { getProgressionService } from '../../progression/ProgressionService';
import { getRewardService } from '../../rewards/RewardService';
import { getStreakService } from '../../streaks/StreakService';
import type { CompletionLedger } from './schemas';

export type CompletionSubsystemResult = {
  degradedSystems: string[];
  ledger: CompletionLedger;
};

export async function applyCompletionSubsystems(input: {
  ledger: CompletionLedger;
  summary: SessionSummary;
}): Promise<CompletionSubsystemResult> {
  const degradedSystems: string[] = [];
  const ledger = {
    ...input.ledger,
    xpDelta: input.summary.xpEarned ?? input.ledger.xpDelta,
  };

  await runSubsystem('progression', degradedSystems, () =>
    getProgressionService(ledger.userId).addXP(ledger.xpDelta, 'SESSION_COMPLETE', {
      idempotencyKey: ledger.idempotencyKey,
      metadata: { grade: ledger.grade, qualityScore: ledger.qualityScore },
      sessionId: ledger.sessionId,
    }),
  );
  await runSubsystem('streaks', degradedSystems, () =>
    getStreakService(ledger.userId).recordSession({
      completedAt: ledger.completedAt,
      duration: ledger.completedDurationSeconds,
      idempotencyKey: ledger.idempotencyKey,
      qualityScore: ledger.qualityScore,
      sessionId: ledger.sessionId,
    }),
  );
  await runSubsystem('rewards', degradedSystems, () =>
    getRewardService(ledger.userId).grantReward(
      'XP',
      'SESSION_COMPLETE',
      { baseAmount: ledger.xpDelta },
      {
        exactAmount: ledger.xpDelta,
        idempotencyKey: `${ledger.idempotencyKey}:reward`,
        sessionId: ledger.sessionId,
      },
    ),
  );

  return {
    degradedSystems,
    ledger,
  };
}

async function runSubsystem(
  name: string,
  degradedSystems: string[],
  operation: () => Promise<unknown>,
): Promise<void> {
  try {
    await operation();
  } catch (error: unknown) {
    degradedSystems.push(name);
    Sentry.captureException(error, {
      tags: { feature: 'session-completion', subsystem: name },
    });
  }
}
