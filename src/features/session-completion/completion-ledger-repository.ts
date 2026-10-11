import { getSupabaseClient } from '../../config/supabase';
import { tableColumns } from '../../lib/repository/tableColumns';
import { CompletionLedgerSchema, type CompletionLedger } from './schemas';
import { mapRowToCompletionLedger } from './mappers';
import { SessionCompletionRepositoryError } from './repository';

export async function saveCompletionOutcome(ledger: CompletionLedger): Promise<CompletionLedger> {
  const parsed = CompletionLedgerSchema.parse(ledger);
  const { data, error } = await getSupabaseClient().from('session_completion_ledgers')
    .update({ ledger_payload: parsed, offline_sync_status: parsed.degradedSystems.length > 0 ? 'failed' : 'synced' })
    .eq('ledger_id', parsed.ledgerId).eq('user_id', parsed.userId)
    .eq('idempotency_key', parsed.idempotencyKey)
    .select(tableColumns('session_completion_ledgers')).single();
  if (error || !data) { throw new SessionCompletionRepositoryError('save-outcome', error ?? 'missing-owned-ledger'); }
  return mapRowToCompletionLedger(data);
}

export async function fetchRepairableCompletions(userId: string, sessionId?: string): Promise<CompletionLedger[]> {
  let query = getSupabaseClient().from('session_completion_ledgers')
    .select(tableColumns('session_completion_ledgers')).eq('user_id', userId);
  if (sessionId) { query = query.eq('session_id', sessionId); }
  else { query = query.neq('offline_sync_status', 'synced'); }
  const { data, error } = await query.order('completed_at', { ascending: true }).limit(100);
  if (error) { throw new SessionCompletionRepositoryError('fetch-repairable', error); }
  return (data ?? []).map(mapRowToCompletionLedger);
}
