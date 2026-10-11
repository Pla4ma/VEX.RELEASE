import { orchestrateSessionCompletion } from '../completion-orchestrator';
import { getConnectionState } from '../../../lib/repository/base';
import { enqueue } from '../../../lib/offline/queue';
import { getCompletionLedgerByIdempotencyKey, persistCompletionLedger } from '../repository';
import { recordCompletedSession } from '../session-history-service';
import type { CompletionLedger } from '../schemas';
import { createSessionSummary, createCompletionLedger, USER_ID, SESSION_ID } from './ledger-test-utils';

const mockSyncState = jest.fn();
jest.mock('../../../store/session-state', () => ({
  useSessionUIStore: { getState: () => ({ setCompletionSyncState: mockSyncState }) },
}));
jest.mock('../../../lib/repository/base', () => ({ getConnectionState: jest.fn() }));
jest.mock('../../../lib/offline/queue', () => ({ enqueue: jest.fn() }));
jest.mock('../completion-outcome-service', () => ({ retainCompletionOutcome: jest.fn(async (ledger: CompletionLedger): Promise<CompletionLedger> => ledger) }));
jest.mock('../session-history-service', () => ({ recordCompletedSession: jest.fn() }));
jest.mock('../repository', () => ({
  getCompletionLedgerByIdempotencyKey: jest.fn(),
  persistCompletionLedger: jest.fn(),
  SessionCompletionRepositoryError: class extends Error {},
}));
jest.mock('../idempotency', () => ({
  beginKeyProcessing: () => true, markKeyProcessed: jest.fn(), releaseKeyProcessing: jest.fn(),
}));
jest.mock('../completion-subsystems', () => ({
  applyCompletionSubsystems: jest.fn(async (input: { ledger: CompletionLedger }): Promise<{
    ledger: CompletionLedger; degradedSystems: string[];
  }> => ({ ledger: input.ledger, degradedSystems: input.ledger.degradedSystems })),
}));
jest.mock('../completion-personalization-step', () => ({ applyPersonalizationAndSideEffects: jest.fn() }));
jest.mock('../../../api/QueryProvider', () => ({
  queryClient: { invalidateQueries: jest.fn() },
  QueryKeys: { session: ['session'], streak: ['streak'], achievements: ['achievements'] },
}));

const complete = async (): Promise<void> => {
  await orchestrateSessionCompletion({ sessionId: SESSION_ID, userId: USER_ID, summary: createSessionSummary() });
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getConnectionState).mockReturnValue('online');
  jest.mocked(getCompletionLedgerByIdempotencyKey).mockResolvedValue(null);
  jest.mocked(persistCompletionLedger).mockImplementation(async (ledger: CompletionLedger): Promise<CompletionLedger> => ledger);
  jest.mocked(recordCompletedSession).mockResolvedValue(undefined);
});

it('never makes an idempotency lookup while offline and shows pending sync', async (): Promise<void> => {
  jest.mocked(getConnectionState).mockReturnValue('offline');
  await complete();
  expect(getCompletionLedgerByIdempotencyKey).not.toHaveBeenCalled();
  expect(persistCompletionLedger).not.toHaveBeenCalled();
  expect(enqueue).toHaveBeenCalled();
  expect(mockSyncState).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'failed_sync' }));
});

it('retains a completion when the initial network lookup and write fail', async (): Promise<void> => {
  jest.mocked(getCompletionLedgerByIdempotencyKey).mockRejectedValueOnce(new Error('DNS unavailable'));
  jest.mocked(persistCompletionLedger).mockRejectedValueOnce(new Error('Still offline'));
  await complete();
  expect(enqueue).toHaveBeenCalled();
  expect(mockSyncState).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'failed_sync' }));
});

it('queues a failed history write for repair and keeps the failure visible', async (): Promise<void> => {
  jest.mocked(recordCompletedSession).mockRejectedValueOnce(new Error('History unavailable'));
  await complete();
  expect(enqueue).toHaveBeenCalledWith(expect.objectContaining({
    payload: { ledger: expect.objectContaining({ degradedSystems: expect.arrayContaining(['session-history']) }) },
  }));
  expect(mockSyncState).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'failed_sync' }));
});

it('does not clear existing degraded ledger state on a duplicate completion', async (): Promise<void> => {
  jest.mocked(getCompletionLedgerByIdempotencyKey).mockResolvedValueOnce(createCompletionLedger({ degradedSystems: ['progression'] }));
  await complete();
  expect(persistCompletionLedger).not.toHaveBeenCalled();
  expect(mockSyncState).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'failed_sync' }));
});
