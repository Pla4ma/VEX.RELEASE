import { eventBus } from '../../../events';
import {
  initializeSessionCompletionOrchestrator,
  orchestrateSessionCompletion,
} from '../completion-orchestrator';
import {
  createCompletionLedger,
  createSessionSummary,
  SESSION_ID,
  USER_ID,
} from './ledger-test-utils';
import { queryClient } from '../../../api/QueryProvider';

jest.mock('../../../events', () => ({
  eventBus: { emit: jest.fn(), subscribe: jest.fn() },
}));
jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));
jest.mock('../../../lib/repository/base', () => ({
  getConnectionState: jest.fn().mockReturnValue('online'),
}));
jest.mock('../../../lib/offline/queue', () => ({ enqueue: jest.fn() }));
jest.mock('../../../progression/ProgressionService', () => ({
  getProgressionService: jest
    .fn()
    .mockReturnValue({ addXP: jest.fn().mockResolvedValue(undefined) }),
}));
jest.mock('../../../streaks/StreakService', () => ({
  getStreakService: jest
    .fn()
    .mockReturnValue({ recordSession: jest.fn().mockResolvedValue(undefined) }),
}));
jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: jest
    .fn()
    .mockReturnValue({
      grantReward: jest
        .fn()
        .mockRejectedValue(new Error('Reward service down')),
    }),
}));
jest.mock('../../../store/session-state', () => ({
  useSessionUIStore: {
    getState: jest.fn().mockReturnValue({ setCompletionSyncState: jest.fn() }),
  },
}));
jest.mock('../../companion-promise/service', () => ({
  processCompletedSessionPromise: jest.fn().mockResolvedValue({
    createdPromise: null,
    fulfilledPromise: null,
    missedPromise: null,
  }),
}));
jest.mock('../repository', () => ({
  createCompletionLedger: jest.fn(),
  getCompletionLedgerByIdempotencyKey: jest.fn().mockResolvedValue(null),
}));
jest.mock('../../../api/QueryProvider', () => ({
  queryClient: { invalidateQueries: jest.fn().mockResolvedValue(undefined) },
  QueryKeys: {
    session: ['session'],
    streak: ['streak'],
    achievements: ['achievements'],
    wallet: (userId: string) => ['wallet', userId],
    transactions: (userId: string) => ['transactions', userId],
  },
}));

describe('orchestrateSessionCompletion edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../repository').createCompletionLedger.mockResolvedValue(
      createCompletionLedger(),
    );
  });

  it('continues with degraded state when non-critical system fails', async () => {
    const { useSessionUIStore } = require('../../../store/session-state');

    await orchestrateSessionCompletion({
      sessionId: SESSION_ID,
      summary: createSessionSummary(),
      userId: USER_ID,
    });

    expect(
      useSessionUIStore.getState().setCompletionSyncState,
    ).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed_sync' }));
  });

  it('validates event input schema', async () => {
    await expect(
      orchestrateSessionCompletion({
        sessionId: 'not-a-uuid',
        summary: createSessionSummary(),
        userId: USER_ID,
      }),
    ).rejects.toThrow();

    await expect(
      orchestrateSessionCompletion({
        sessionId: SESSION_ID,
        summary: createSessionSummary(),
        userId: '',
      }),
    ).rejects.toThrow();

    await expect(
      orchestrateSessionCompletion({
        sessionId: SESSION_ID,
        summary: { invalid: true },
        userId: USER_ID,
      }),
    ).rejects.toThrow();
  });

  it('subscribes to session:completed at most once', () => {
    initializeSessionCompletionOrchestrator();
    initializeSessionCompletionOrchestrator();
    initializeSessionCompletionOrchestrator();

    expect(
      (eventBus.subscribe as jest.Mock).mock.calls.length,
    ).toBeLessThanOrEqual(1);
    if ((eventBus.subscribe as jest.Mock).mock.calls.length === 1) {
      expect(eventBus.subscribe).toHaveBeenCalledWith(
        'session:completed',
        expect.any(Function),
      );
    }
  });
});

describe('final release invalidation protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../repository').createCompletionLedger.mockResolvedValue(
      createCompletionLedger(),
    );
  });

  it('does not invalidate economy wallet queries after completion', async () => {
    const sessionId = 'a1e8400e-e29b-41d4-a716-446655440001';
    await orchestrateSessionCompletion({
      sessionId,
      summary: createSessionSummary({ sessionId }),
      userId: USER_ID,
    });

    const invalidateMock = queryClient.invalidateQueries as jest.Mock;
    const allKeys = invalidateMock.mock.calls.flatMap(
      (call: unknown[]) =>
        ((call[0] as { queryKey: unknown })?.queryKey as Array<
          string | number
        >) ?? [],
    );

    expect(allKeys).not.toContain('wallet');
    expect(allKeys).not.toContain('transactions');
  });

  it('still invalidates XP/progress queries after completion', async () => {
    const sessionId = 'b2e8400e-e29b-41d4-a716-446655440002';
    await orchestrateSessionCompletion({
      sessionId,
      summary: createSessionSummary({ sessionId }),
      userId: USER_ID,
    });

    const invalidateMock = queryClient.invalidateQueries as jest.Mock;
    const allKeys = invalidateMock.mock.calls.flatMap(
      (call: unknown[]) =>
        ((call[0] as { queryKey: unknown })?.queryKey as Array<
          string | number
        >) ?? [],
    );

    expect(allKeys).toContain('session');
    expect(allKeys).toContain('streak');
    expect(allKeys).toContain('achievements');
  });
});
