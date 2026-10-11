import * as Sentry from '@sentry/react-native';
import { useSessionUIStore } from '../../../store/session-state';
import { syncCompletionLedger } from '../offline-ledger-service';
import { persistCompletionLedger } from '../repository';
import { saveCompletionOutcome } from '../completion-ledger-repository';
import { applyCompletionSubsystems } from '../completion-subsystems';
import type { CompletionLedger } from '../schemas';
import { recordCompletedSession } from '../session-history-service';
import { createCompletionLedger } from './ledger-test-utils';

jest.mock('../repository', () => ({ persistCompletionLedger: jest.fn(), updateCompletionSyncStatus: jest.fn() }));
jest.mock('../completion-ledger-repository', () => ({ saveCompletionOutcome: jest.fn() }));
jest.mock('../completion-subsystems', () => ({ applyCompletionSubsystems: jest.fn() }));
jest.mock('../session-history-service', () => ({ recordCompletedSession: jest.fn() }));
jest.mock('../../../api/QueryProvider', () => ({
  queryClient: { invalidateQueries: jest.fn() }, QueryKeys: { session: ['session'] },
}));

describe('Offline ledger synchronization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSessionUIStore.getState().clearCompletionSyncState();
    jest.mocked(saveCompletionOutcome).mockImplementation(async (ledger: CompletionLedger): Promise<CompletionLedger> => ({ ...ledger, offlineSyncStatus: ledger.degradedSystems.length ? 'failed_sync' : 'synced' }));
    jest.mocked(applyCompletionSubsystems).mockImplementation(async (input): Promise<{ ledger: CompletionLedger; degradedSystems: string[] }> => ({ ledger: input.ledger, degradedSystems: input.ledger.degradedSystems }));
    jest.mocked(recordCompletedSession).mockResolvedValue(undefined);
  });

  it('restores history and clears only the pending state for this completion', async () => {
    const ledger = createCompletionLedger({ offlineSyncStatus: 'pending_sync' });
    jest.mocked(persistCompletionLedger).mockResolvedValue(ledger);
    useSessionUIStore.getState().setCompletionSyncState({ ledgerId: ledger.ledgerId,
      status: 'pending_sync', message: 'Syncing', repairCtaLabel: null, updatedAt: 1 });
    await expect(syncCompletionLedger(ledger)).resolves.toMatchObject({ offlineSyncStatus: 'synced' });
    expect(recordCompletedSession).toHaveBeenCalledWith(expect.objectContaining({ ledgerId: ledger.ledgerId }));
    expect(useSessionUIStore.getState().completionSync.status).toBe('synced');
  });

  it('does not hide a failed reward repair when ledger replay succeeds', async () => {
    const ledger = createCompletionLedger({ degradedSystems: ['progression'] });
    jest.mocked(persistCompletionLedger).mockResolvedValue(ledger);
    useSessionUIStore.getState().setCompletionSyncState({ ledgerId: ledger.ledgerId,
      status: 'failed_sync', message: 'Repair rewards', repairCtaLabel: 'Repair', updatedAt: 1 });
    await expect(syncCompletionLedger(ledger)).rejects.toThrow('immediate-sync');
    expect(useSessionUIStore.getState().completionSync.status).toBe('failed_sync');
  });

  it('does not treat a database conflict without a recovered ledger as success', async () => {
    const error = new Error('Unresolved duplicate');
    jest.mocked(persistCompletionLedger).mockRejectedValue(error);
    await expect(syncCompletionLedger(createCompletionLedger())).rejects.toThrow('immediate-sync');
    expect(recordCompletedSession).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.any(Object));
  });
});
