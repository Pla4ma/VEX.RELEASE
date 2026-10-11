import { processEntry, retryDeadLetter, isProcessing } from '../../../lib/offline/queue';
import { buildCompletionSyncStatus, retryCanonicalCompletions } from '../offline-sync-operations';
import { ledger, queueEntry } from './offline-sync-service.fixtures';

jest.mock('../../../lib/offline/queue');

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(processEntry).mockResolvedValue(undefined);
  jest.mocked(isProcessing).mockReturnValue(false);
});

it('repairs the canonical queue used by the completion orchestrator', async (): Promise<void> => {
  const entry = queueEntry(ledger());
  const result = await retryCanonicalCompletions([entry], jest.fn());
  expect(processEntry).toHaveBeenCalledWith(entry);
  expect(result).toEqual({ attempted: 1, successful: 1, failed: 0 });
});

it('reopens dead-letter completions before processing them', async (): Promise<void> => {
  const entry = { ...queueEntry(ledger()), status: 'dead_letter' } satisfies Parameters<typeof processEntry>[0];
  const reopened = { ...entry, status: 'queued', retryCount: 0 } satisfies Parameters<typeof processEntry>[0];
  jest.mocked(retryDeadLetter).mockReturnValue(reopened);
  const result = await retryCanonicalCompletions([entry], jest.fn());
  expect(retryDeadLetter).toHaveBeenCalledWith(entry.id);
  expect(processEntry).toHaveBeenCalledWith(reopened);
  expect(result.successful).toBe(1);
});

it('reports failed repairs rather than silently claiming success', async (): Promise<void> => {
  const error = new Error('Still offline');
  const report = jest.fn();
  jest.mocked(processEntry).mockRejectedValueOnce(error);
  const result = await retryCanonicalCompletions([queueEntry(ledger())], report);
  expect(result).toEqual({ attempted: 1, successful: 0, failed: 1 });
  expect(report).toHaveBeenCalledWith(ledger().sessionId, error);
});

it('skips other features and completions that are already processing', async (): Promise<void> => {
  jest.mocked(isProcessing).mockReturnValue(true);
  const entry = queueEntry(ledger());
  const result = await retryCanonicalCompletions([
    entry, { ...entry, feature: 'progression' },
  ], jest.fn());
  expect(result.attempted).toBe(0);
  expect(processEntry).not.toHaveBeenCalled();
});

it('reports synced, pending and failed status from the real queue state', () => {
  const completion = ledger();
  const entry = queueEntry(completion);
  expect(buildCompletionSyncStatus(completion.sessionId, [], [], 0).status).toBe('synced');
  expect(buildCompletionSyncStatus(completion.sessionId, [], [entry], 0).status).toBe('pending_sync');
  expect(buildCompletionSyncStatus(completion.sessionId, [], [{ ...entry, status: 'dead_letter' }], 0).status).toBe('failed_sync');
});
