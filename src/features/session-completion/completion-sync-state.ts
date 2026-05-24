import { useSessionUIStore } from "../../store/session-state";

export function setCompletionSyncState(
  ledgerId: string,
  degradedSystems: readonly string[],
  pendingSync: boolean,
): void {
  const store = useSessionUIStore.getState();

  if (pendingSync) {
    store.setCompletionSyncState({
      ledgerId,
      message: "One session is saved offline. It will sync when you reconnect.",
      repairCtaLabel: null,
      status: "pending_sync",
      updatedAt: Date.now(),
    });
    return;
  }

  if (degradedSystems.length > 0) {
    store.setCompletionSyncState({
      ledgerId,
      message: "Session completion synced, but some rewards need repair.",
      repairCtaLabel: "Repair now",
      status: "failed_sync",
      updatedAt: Date.now(),
    });
    return;
  }

  store.setCompletionSyncState({
    ledgerId,
    message: null,
    repairCtaLabel: null,
    status: "synced",
    updatedAt: Date.now(),
  });
}
