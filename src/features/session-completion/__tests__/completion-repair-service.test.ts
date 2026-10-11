import { offlineSyncService } from '../offline-sync-service';
import { repairPendingCompletion } from '../completion-repair-service';
import { fetchRepairableCompletions } from '../completion-ledger-repository';
import { syncCompletionLedger } from '../offline-ledger-service';
import { createCompletionLedger, SESSION_ID } from './ledger-test-utils';

jest.mock('../offline-sync-service', () => ({ offlineSyncService: {
  forceRetryAll: jest.fn(), getSyncStatus: jest.fn(),
} }));
jest.mock('../completion-ledger-repository', () => ({ fetchRepairableCompletions: jest.fn() }));
jest.mock('../offline-ledger-service', () => ({ syncCompletionLedger: jest.fn() }));
const userId = '550e8400-e29b-41d4-a716-446655440099';
const input = { userId, sessionId: SESSION_ID };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(offlineSyncService.forceRetryAll).mockResolvedValue({ attempted: 0, failed: 0, successful: 0 });
  jest.mocked(offlineSyncService.getSyncStatus).mockResolvedValue({ status: 'synced', isQueued: false, hasFallback: false, lastSyncAt: 0 });
  jest.mocked(fetchRepairableCompletions).mockResolvedValue([createCompletionLedger({ userId })]);
  jest.mocked(syncCompletionLedger).mockResolvedValue(createCompletionLedger({ userId }));
});

it('repairs a degraded server receipt after restart even when the local queue is empty', async (): Promise<void> => {
  const ledger = createCompletionLedger({ userId, degradedSystems: ['progression'] });
  jest.mocked(fetchRepairableCompletions).mockResolvedValue([ledger]);
  await repairPendingCompletion(input);
  expect(syncCompletionLedger).toHaveBeenCalledWith(ledger);
  expect(offlineSyncService.forceRetryAll).toHaveBeenCalledWith(userId);
});

it('does not announce success while a queued completion is already processing', async (): Promise<void> => {
  jest.mocked(offlineSyncService.getSyncStatus).mockResolvedValue({ status: 'pending_sync', isQueued: true, hasFallback: false, lastSyncAt: 0 });
  await expect(repairPendingCompletion(input)).rejects.toThrow('still syncing');
});

it('does not announce success without the requested receipt', async (): Promise<void> => {
  jest.mocked(fetchRepairableCompletions).mockResolvedValue([]);
  await expect(repairPendingCompletion(input)).rejects.toThrow('receipt is still syncing');
});

it('rejects a receipt belonging to another account before awarding anything', async (): Promise<void> => {
  jest.mocked(fetchRepairableCompletions).mockResolvedValue([createCompletionLedger()]);
  await expect(repairPendingCompletion(input)).rejects.toThrow('another account');
  expect(syncCompletionLedger).not.toHaveBeenCalled();
});

it('leaves a reward failure visible when replaying its receipt fails', async (): Promise<void> => {
  jest.mocked(fetchRepairableCompletions).mockResolvedValue([createCompletionLedger({ userId, degradedSystems: ['progression'] })]);
  jest.mocked(syncCompletionLedger).mockRejectedValueOnce(new Error('XP unavailable'));
  await expect(repairPendingCompletion(input)).rejects.toThrow('XP unavailable');
});

it('coalesces repeated repair taps for the same user and session', async (): Promise<void> => {
  await Promise.all([repairPendingCompletion(input), repairPendingCompletion(input)]);
  expect(fetchRepairableCompletions).toHaveBeenCalledTimes(1);
});

it('fails loudly when a queued completion remains unresolved', async (): Promise<void> => {
  jest.mocked(offlineSyncService.forceRetryAll).mockResolvedValue({ attempted: 2, failed: 1, successful: 1 });
  await expect(repairPendingCompletion(input)).rejects.toThrow('1 queued item');
});
