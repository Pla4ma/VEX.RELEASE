import { retainCompletionOutcome } from '../completion-outcome-service';
import { saveCompletionOutcome } from '../completion-ledger-repository';
import { enqueue } from '../../../lib/offline/queue';
import { createCompletionLedger } from './ledger-test-utils';

jest.mock('../completion-ledger-repository', () => ({ saveCompletionOutcome: jest.fn() }));
jest.mock('../../../lib/offline/queue', () => ({ enqueue: jest.fn() }));
beforeEach(() => jest.clearAllMocks());

it('stores the final degraded reward receipt and schedules durable repair', async (): Promise<void> => {
  const ledger = createCompletionLedger({ degradedSystems: ['progression'], offlineSyncStatus: 'failed_sync' });
  jest.mocked(saveCompletionOutcome).mockResolvedValue(ledger);
  await retainCompletionOutcome(ledger, true);
  expect(saveCompletionOutcome).toHaveBeenCalledWith(ledger);
  expect(enqueue).toHaveBeenCalledWith(expect.objectContaining({ payload: { ledger } }));
});

it('retains the enriched receipt locally when its final server update fails', async (): Promise<void> => {
  const ledger = createCompletionLedger({ rewardIds: ['real-receipt'] });
  jest.mocked(saveCompletionOutcome).mockRejectedValue(new Error('Lost network'));
  const result = await retainCompletionOutcome(ledger, true);
  expect(result.offlineSyncStatus).toBe('pending_sync');
  expect(enqueue).toHaveBeenCalledWith(expect.objectContaining({ payload: { ledger: result } }));
});

it('does not leave a queue item after saving all completed effects', async (): Promise<void> => {
  const ledger = createCompletionLedger();
  jest.mocked(saveCompletionOutcome).mockResolvedValue(ledger);
  await retainCompletionOutcome(ledger, true);
  expect(enqueue).not.toHaveBeenCalled();
});
