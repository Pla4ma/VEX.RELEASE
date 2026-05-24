import { orchestrateSessionCompletion } from '../completion-orchestrator';
import { createCompletionLedger, createSessionSummary, SESSION_ID, USER_ID } from './ledger-test-utils';

jest.mock('../../../config/supabase', () => ({ getSupabaseClient: jest.fn() }));
jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }),
}));
jest.mock('../../../lib/repository/base', () => ({ getConnectionState: jest.fn().mockReturnValue('online') }));
jest.mock('../../../lib/offline/queue', () => ({ enqueue: jest.fn() }));
jest.mock('../../../store/session-state', () => ({
  useSessionUIStore: { getState: jest.fn().mockReturnValue({ setCompletionSyncState: jest.fn() }) },
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
  getCompletionLedgerByIdempotencyKey: jest.fn(),
}));
jest.mock('../completion-subsystems', () => ({
  applyCompletionSubsystems: jest.fn(),
}));
jest.mock('../companion-memory-integration', () => ({
  recordCompletionCompanionMemories: jest.fn().mockResolvedValue([]),
}));
jest.mock('../story-view-model-service', () => ({
  buildPostSessionStoryViewModel: jest.fn((input: Record<string, unknown>) => input),
}));
jest.mock('../ledger-service', () => ({
  buildCompletionLedger: jest.fn((input: Record<string, unknown>) => ({
    companionReactionId: null,
    completedAt: (input as { completedAt?: number }).completedAt ?? Date.now(),
    completedDurationSeconds: 1500,
    createdAt: (input as { completedAt?: number }).completedAt ?? Date.now(),
    dailyMissionResult: { missionId: null, progressDelta: 0, status: 'unchanged' as const },
    degradedSystems: [],
    effectiveFocusedSeconds: 1400,
    focusScoreDelta: 8,
    grade: 'A',
    gradeScore: 88,
    idempotencyKey: `${(input as { sessionId: string }).sessionId}:${(input as { completedAt?: number }).completedAt ?? Date.now()}`,
    interruptionCount: 0,
    ledgerId: '550e8400-e29b-41d4-a716-446655440001',
    mode: 'FLOW' as const,
    offlineSyncStatus: (input as { offlineSyncStatus?: string }).offlineSyncStatus ?? 'synced',
    pauseCount: 0,
    qualityScore: 88,
    rewardIds: [],
    sessionId: (input as { sessionId: string }).sessionId,
    startedAt: Date.now() - 1500000,
    streakResult: { action: 'extended' as const, newDays: 5, previousDays: 4 },
    strictMode: false,
    targetDurationSeconds: 1500,
    timezone: (input as { timezone?: string }).timezone ?? 'UTC',
    userId: (input as { userId: string }).userId,
    xpDelta: 120,
  })),
}));

describe('orchestrateSessionCompletion flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../../../lib/repository/base').getConnectionState.mockReturnValue('online');
  });

  it('creates ledger and updates all systems for normal completion', async () => {
    const { createCompletionLedger: persist, getCompletionLedgerByIdempotencyKey } = require('../repository');
    const { applyCompletionSubsystems } = require('../completion-subsystems');

    getCompletionLedgerByIdempotencyKey.mockResolvedValue(null);
    persist.mockResolvedValue(createCompletionLedger());
    applyCompletionSubsystems.mockResolvedValue({
      degradedSystems: [],
      ledger: createCompletionLedger(),
    });

    await orchestrateSessionCompletion({
      sessionId: SESSION_ID,
      summary: createSessionSummary(),
      userId: USER_ID,
    });

    expect(persist).toHaveBeenCalled();
    expect(applyCompletionSubsystems).toHaveBeenCalled();
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
  });
});
