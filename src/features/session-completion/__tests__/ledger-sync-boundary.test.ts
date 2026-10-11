import { mapRowToCompletionLedger } from '../mappers';
import { createCompletionLedger, createLedgerRow } from './ledger-test-utils';

describe('Database completion sync vocabulary', () => {
  it.each([
    ['pending', 'pending_sync'],
    ['failed', 'failed_sync'],
    ['synced', 'synced'],
  ])('maps database %s into app %s', (stored, expected) => {
    const row = { ...createLedgerRow(createCompletionLedger()), offline_sync_status: stored };
    expect(mapRowToCompletionLedger(row).offlineSyncStatus).toBe(expected);
  });

  it('rejects invalid database state rather than treating it as synchronized', () => {
    const row = { ...createLedgerRow(createCompletionLedger()), offline_sync_status: 'unknown' };
    expect(() => mapRowToCompletionLedger(row)).toThrow('invalid-response');
  });
});
