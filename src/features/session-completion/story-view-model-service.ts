import type { SessionSummary } from '../../session/types';
import type { CompletionLedger } from './schemas';

export type PostSessionStoryViewModel = {
  degradedWarnings: string[];
  grade: CompletionLedger['grade'];
  ledgerId: string;
  sessionId: string;
  summary: SessionSummary;
  xpDelta: number;
};

export function buildPostSessionStoryViewModel(input: {
  degradedWarnings?: string[];
  degradedSystems?: string[];
  ledger: CompletionLedger;
  summary: SessionSummary;
}): PostSessionStoryViewModel {
  return {
    degradedWarnings: input.degradedWarnings ?? input.degradedSystems ?? [],
    grade: input.ledger.grade,
    ledgerId: input.ledger.ledgerId,
    sessionId: input.ledger.sessionId,
    summary: input.summary,
    xpDelta: input.ledger.xpDelta,
  };
}
