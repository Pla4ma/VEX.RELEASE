import { eventBus } from '../../../events';
import {
  initializeSessionCompletionOrchestrator,
  orchestrateSessionCompletion,
} from '../completion-orchestrator';
import { createCompletionLedger, createSessionSummary, SESSION_ID, USER_ID } from './ledger-test-utils';

jest.mock('../../../events', () => ({ eventBus: { emit: jest.fn(), subscribe: jest.fn() } }));
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
  getRewardService: jest.fn().mockReturnValue({ grantReward: jest.fn().mockRejectedValue(new Error('Reward service down')) }),
}));
jest.mock('../../../store/session-state', () => ({
  useSessionUIStore: { getState: jest.fn().mockReturnValue({ setCompletionSyncState: jest.fn() }) },
}));
jest.mock('../repository', () => ({
  createCompletionLedger: jest.fn(),
  getCompletionLedgerByIdempotencyKey: jest.fn().mockResolvedValue(null),
}));

describe('orchestrateSessionCompletion edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../repository').createCompletionLedger.mockResolvedValue(createCompletionLedger());
  });

  it('continues with degraded state when non-critical system fails', async () => {
    const { useSessionUIStore } = require('../../../store/session-state');

    await orchestrateSessionCompletion({
      sessionId: SESSION_ID,
      summary: createSessionSummary(),
      userId: USER_ID,
    });

    expect(useSessionUIStore.getState().setCompletionSyncState).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'failed_sync' }),
    );
  });

  it('validates event input schema', async () => {
    await expect(orchestrateSessionCompletion({
      sessionId: 'not-a-uuid',
      summary: createSessionSummary(),
      userId: USER_ID,
    })).rejects.toThrow();

    await expect(orchestrateSessionCompletion({
      sessionId: SESSION_ID,
      summary: createSessionSummary(),
      userId: '',
    })).rejects.toThrow();

    await expect(orchestrateSessionCompletion({
      sessionId: SESSION_ID,
      summary: { invalid: true },
      userId: USER_ID,
    })).rejects.toThrow();
  });

  it('subscribes to session:completed at most once', () => {
    initializeSessionCompletionOrchestrator();
    initializeSessionCompletionOrchestrator();
    initializeSessionCompletionOrchestrator();

    expect((eventBus.subscribe as jest.Mock).mock.calls.length).toBeLessThanOrEqual(1);
    if ((eventBus.subscribe as jest.Mock).mock.calls.length === 1) {
      expect(eventBus.subscribe).toHaveBeenCalledWith('session:completed', expect.any(Function));
    }
  });
});
