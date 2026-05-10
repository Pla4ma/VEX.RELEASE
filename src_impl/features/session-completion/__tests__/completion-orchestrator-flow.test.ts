import { orchestrateSessionCompletion } from '../completion-orchestrator';
import { createCompletionLedger, createSessionSummary, SESSION_ID, USER_ID } from './ledger-test-utils';

jest.mock('../../../config/supabase', () => ({ getSupabaseClient: jest.fn() }));
jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }),
}));
jest.mock('../../../lib/repository/base', () => ({ getConnectionState: jest.fn().mockReturnValue('online') }));
jest.mock('../../../lib/offline/queue', () => ({ enqueue: jest.fn() }));
jest.mock('../../../progression/ProgressionService', () => ({
  getProgressionService: jest.fn().mockReturnValue({ addXP: jest.fn().mockResolvedValue(undefined) }),
}));
jest.mock('../../../streaks/StreakService', () => ({
  getStreakService: jest.fn().mockReturnValue({ recordSession: jest.fn().mockResolvedValue(undefined) }),
}));
jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: jest.fn().mockReturnValue({ grantReward: jest.fn().mockResolvedValue(undefined) }),
}));
jest.mock('../../../store/session-state', () => ({
  useSessionUIStore: { getState: jest.fn().mockReturnValue({ setCompletionSyncState: jest.fn() }) },
}));
jest.mock('../repository', () => ({
  createCompletionLedger: jest.fn(),
  getCompletionLedgerByIdempotencyKey: jest.fn(),
}));

describe('orchestrateSessionCompletion flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../../../lib/repository/base').getConnectionState.mockReturnValue('online');
  });

  it('creates ledger and updates all systems for normal completion', async () => {
    const { createCompletionLedger: persist, getCompletionLedgerByIdempotencyKey } = require('../repository');
    const { getProgressionService } = require('../../../progression/ProgressionService');
    const { getStreakService } = require('../../../streaks/StreakService');
    const { getRewardService } = require('../../../rewards/RewardService');

    getCompletionLedgerByIdempotencyKey.mockResolvedValue(null);
    persist.mockResolvedValue(createCompletionLedger());

    await orchestrateSessionCompletion({
      sessionId: SESSION_ID,
      summary: createSessionSummary(),
      userId: USER_ID,
    });

    expect(persist).toHaveBeenCalled();
    expect(getProgressionService).toHaveBeenCalledWith(USER_ID);
    expect(getStreakService).toHaveBeenCalledWith(USER_ID);
    expect(getRewardService).toHaveBeenCalledWith(USER_ID);
  });

  it('skips processing for duplicate idempotency key', async () => {
    const { createCompletionLedger: persist, getCompletionLedgerByIdempotencyKey } = require('../repository');
    const { useSessionUIStore } = require('../../../store/session-state');

    getCompletionLedgerByIdempotencyKey.mockResolvedValue(createCompletionLedger({
      idempotencyKey: `${SESSION_ID}:1000000`,
    }));

    await orchestrateSessionCompletion({
      timestamp: 1000000,
      sessionId: SESSION_ID,
      summary: createSessionSummary(),
      userId: USER_ID,
    });

    expect(persist).not.toHaveBeenCalled();
    expect(useSessionUIStore.getState().setCompletionSyncState).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'synced' }),
    );
  });

  it('handles offline mode by queuing ledger', async () => {
    const { getConnectionState } = require('../../../lib/repository/base');
    const { enqueue } = require('../../../lib/offline/queue');
    const { getCompletionLedgerByIdempotencyKey } = require('../repository');
    const { useSessionUIStore } = require('../../../store/session-state');

    getConnectionState.mockReturnValue('offline');
    getCompletionLedgerByIdempotencyKey.mockResolvedValue(null);

    await orchestrateSessionCompletion({
      sessionId: SESSION_ID,
      summary: createSessionSummary(),
      userId: USER_ID,
    });

    expect(enqueue).toHaveBeenCalledWith(expect.objectContaining({
      feature: 'sessions',
      operation: 'CREATE',
    }));
    expect(useSessionUIStore.getState().setCompletionSyncState).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending_sync' }),
    );
  });
});
