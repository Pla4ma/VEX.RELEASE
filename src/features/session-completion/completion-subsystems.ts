import type { SessionSummary } from '../../session/types';
import type { CompletionLedger } from './schemas';

export type CompletionSubsystemResult = {
  degradedSystems: string[];
  ledger: CompletionLedger;
};

export async function applyCompletionSubsystems(input: {
  ledger: CompletionLedger;
  summary: SessionSummary;
}): Promise<CompletionSubsystemResult> {
  return {
    degradedSystems: [],
    ledger: {
      ...input.ledger,
      xpDelta: input.summary.xpEarned ?? input.ledger.xpDelta,
    },
  };
}
