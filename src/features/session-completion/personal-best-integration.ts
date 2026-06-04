import type { SessionSummary } from '../../session/types';
import type { CompletionLedger } from './schemas';

export async function resolveCompletionPersonalBest(
  _userId: string,
  _ledger: CompletionLedger,
  _summary: SessionSummary,
): Promise<{ isPersonalBest: boolean }> {
  return { isPersonalBest: false };
}
