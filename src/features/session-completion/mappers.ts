/**
 * Session Completion Repository — Row Mappers
 *
 * Extracts the Zod parsing/mapping logic for CompletionLedger rows
 * to keep repository.ts under 200 lines.
 */

import { z } from 'zod';
import {
  CompletionLedgerSchema,
  CompletionSyncStatusSchema,
  type CompletionLedger,
} from './schemas';

const LedgerRowSchema = z.object({
  ledger_id: z.string().uuid(),
  idempotency_key: z.string().min(1),
  session_id: z.string().uuid(),
  user_id: z.string().min(1),
  completed_at: z.number().int().nonnegative(),
  offline_sync_status: CompletionSyncStatusSchema,
  created_at: z.number().int().nonnegative(),
  ledger_payload: CompletionLedgerSchema,
});

const mapRowToCompletionLedger = (data: unknown): CompletionLedger => {
  const parsed = LedgerRowSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error('invalid-response');
  }

  const row = parsed.data;
  return {
    ...row.ledger_payload,
    ledgerId: row.ledger_id,
    idempotencyKey: row.idempotency_key,
    sessionId: row.session_id,
    userId: row.user_id,
    completedAt: row.completed_at,
    offlineSyncStatus: row.offline_sync_status,
    createdAt: row.created_at,
  };
};

const mapRowToCompletionLedgerNullable = (data: unknown): CompletionLedger | null => {
  if (!data) return null;
  try {
    return mapRowToCompletionLedger(data);
  } catch {
    return null;
  }
};

export { mapRowToCompletionLedger, mapRowToCompletionLedgerNullable };
