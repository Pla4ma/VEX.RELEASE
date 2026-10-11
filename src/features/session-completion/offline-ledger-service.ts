import * as Sentry from '@sentry/react-native';
import { queryClient, QueryKeys } from '../../api/QueryProvider';
import { useSessionUIStore } from '../../store/session-state';
import { persistCompletionLedger } from './repository';
import { saveCompletionOutcome } from './completion-ledger-repository';
import { applyCompletionSubsystems } from './completion-subsystems';
import { buildSessionSummaryFromCompletionLedger } from './session-summary-builder';
import { recordCompletedSession } from './session-history-service';
import { SessionCompletionOfflineSyncError } from './offline-sync-types';
import type { CompletionLedger } from './schemas';

export async function syncCompletionLedger(ledger: CompletionLedger): Promise<CompletionLedger> {
  try {
    const synced = await persistCompletionLedger(ledger);
    const candidate = { ...synced,
      degradedSystems: [...new Set([...ledger.degradedSystems, ...synced.degradedSystems])],
    };
    await recordCompletedSession(candidate);
    candidate.degradedSystems = candidate.degradedSystems.filter((name) => name !== 'session-history');
    const result = await applyCompletionSubsystems({ ledger: candidate,
      summary: buildSessionSummaryFromCompletionLedger(candidate), repair: true });
    const repaired = await saveCompletionOutcome(result.ledger);
    const ui = useSessionUIStore.getState();
    if (ui.completionSync.ledgerId === ledger.ledgerId || ui.completionSync.ledgerId === synced.ledgerId) {
      const failed = repaired.degradedSystems.length > 0;
      ui.setCompletionSyncState({ ledgerId: repaired.ledgerId, status: failed ? 'failed_sync' : 'synced',
        message: failed ? 'Session saved. Some rewards still need sync.' : null,
        repairCtaLabel: failed ? 'Repair sync' : null, updatedAt: Date.now() });
    }
    void queryClient.invalidateQueries({ queryKey: [...QueryKeys.session, repaired.userId] });
    void queryClient.invalidateQueries({ queryKey: ['progression', repaired.userId] });
    void queryClient.invalidateQueries({ queryKey: ['session-completion-recovery', repaired.userId, repaired.sessionId] });
    if (repaired.degradedSystems.length > 0) { throw new Error(`Still waiting for ${repaired.degradedSystems.join(', ')}`); }
    return repaired;
  } catch (error: unknown) {
    Sentry.captureException(error, { tags: { feature: 'session-completion', operation: 'offline-replay' } });
    throw new SessionCompletionOfflineSyncError('immediate-sync', error);
  }
}
