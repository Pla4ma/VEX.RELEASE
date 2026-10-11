import type { OfflineQueueEntryInput } from './queue';

export function inferQueueUserId(
  entry: OfflineQueueEntryInput,
): string | undefined {
  if (entry.userId) {
    return entry.userId;
  }
  const directUserId = entry.payload.userId;
  if (typeof directUserId === 'string' && directUserId.length > 0) {
    return directUserId;
  }
  const ledger = entry.payload.ledger;
  if (typeof ledger === 'object' && ledger !== null) {
    const ledgerUserId = Reflect.get(ledger, 'userId');
    return typeof ledgerUserId === 'string' && ledgerUserId.length > 0
      ? ledgerUserId
      : undefined;
  }
  return undefined;
}
