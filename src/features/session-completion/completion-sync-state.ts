import { useSessionUIStore } from '../../store/session-state';

export function setCompletionSyncState(
  ledgerId: string,
  degradedSystems: string[],
  isSyncing: boolean,
): void {
  const hasDegradedSystems = degradedSystems.length > 0;
  useSessionUIStore.getState().setCompletionSyncState({
    ledgerId,
    message: hasDegradedSystems
      ? 'Session saved. Some rewards need a repair pass.'
      : isSyncing
        ? 'Session saved locally. VEX is syncing it now.'
        : null,
    repairCtaLabel: hasDegradedSystems ? 'Repair sync' : null,
    status: hasDegradedSystems
      ? 'failed_sync'
      : isSyncing
        ? 'pending_sync'
        : 'synced',
    updatedAt: Date.now(),
  });
}
