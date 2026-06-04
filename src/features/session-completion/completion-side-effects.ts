import type { SessionSummary } from '../../session/types';
import type { CompletionLedger } from './schemas';
import { buildPostSessionStoryViewModel } from './story-view-model-service';

export async function applyCompletionSideEffects(input: {
  degradedSystems: string[];
  finalLedger?: CompletionLedger;
  isPersonalBest?: boolean;
  ledger?: CompletionLedger;
  personalizationResult?: unknown;
  sessionId?: string;
  summary: SessionSummary;
  userId?: string;
}): Promise<ReturnType<typeof buildPostSessionStoryViewModel>> {
  const ledger = input.ledger ?? input.finalLedger;
  if (!ledger) {
    throw new Error('Completion ledger missing');
  }
  return buildPostSessionStoryViewModel({ ...input, ledger });
}
