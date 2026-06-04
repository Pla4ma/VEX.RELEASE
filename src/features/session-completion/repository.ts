import { CompletionLedgerSchema, type CompletionLedger } from './schemas';

const ledgers = new Map<string, CompletionLedger>();

export class SessionCompletionRepositoryError extends Error {
  constructor(operation: string, public readonly cause: unknown) {
    super(`Session completion repository failed: ${operation}`);
    this.name = 'SessionCompletionRepositoryError';
  }
}

export async function createCompletionLedger(
  ledger: CompletionLedger,
): Promise<CompletionLedger> {
  const parsed = CompletionLedgerSchema.parse(ledger);
  ledgers.set(parsed.idempotencyKey, parsed);
  return parsed;
}

export async function getCompletionLedgerByIdempotencyKey(
  idempotencyKey: string,
): Promise<CompletionLedger | null> {
  return ledgers.get(idempotencyKey) ?? null;
}

export async function updateCompletionSyncStatus(
  ledgerId: string,
  offlineSyncStatus: CompletionLedger['offlineSyncStatus'],
): Promise<void> {
  for (const [key, ledger] of ledgers.entries()) {
    if (ledger.ledgerId === ledgerId) {
      ledgers.set(key, { ...ledger, offlineSyncStatus });
      return;
    }
  }
}
