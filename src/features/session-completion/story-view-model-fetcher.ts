import type { SessionSummary } from '../../session/types';
import { getMemories } from '../companion/memory-repository';
import { getRecentPromises } from '../companion-promise/repository';
import { getContractForSession } from '../focus-contract/service';
import type { PostSessionStoryViewModel } from './story-view-model-service';
import { buildPostSessionStoryViewModel } from './story-view-model-service';
import { getCompletionLedgerBySessionId } from './repository';

export async function getPostSessionStoryViewModel(input: {
  sessionId: string;
  summary: SessionSummary;
  userId: string | null;
}): Promise<PostSessionStoryViewModel | null> {
  const ledger = await getCompletionLedgerBySessionId(input.sessionId);
  if (!ledger) {
    return null;
  }
  const [memories, promises, focusContract] = input.userId
    ? await Promise.all([
        getMemories(input.userId),
        getRecentPromises(input.userId, 10),
        getContractForSession(input.sessionId, input.userId).catch(() => null),
      ])
    : [[], [], null];
  return buildPostSessionStoryViewModel({
    companionMemory:
      memories.find((memory) => memory.sessionId === input.sessionId) ?? null,
    companionPromise:
      promises.find((promise) => promise.sourceSessionId === input.sessionId) ??
      null,
    degradedWarnings: ledger.degradedSystems,
    focusContract,
    ledger,
    personalizationResult: null,
    summary: input.summary,
  });
}
