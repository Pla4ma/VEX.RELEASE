import { orchestrateSessionCompletion } from '../completion-orchestrator';
import type {} from '../schemas';
import { summary, ledger } from './__fixtures__/orchestrator-return.fixtures';

const mockSetCompletionSyncState = jest.fn();
const mockApplyCompletionSubsystems = jest.fn();
const mockCheckAndUpdatePersonalBest = jest.fn();
const mockCreateCompletionLedger = jest.fn();
const mockGetCompletionLedgerByIdempotencyKey = jest.fn();
jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));
jest.mock('../../../events', () => ({ eventBus: { subscribe: jest.fn() } }));
jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({ info: jest.fn(), warn: jest.fn() }),
}));
jest.mock('../../../lib/repository/base', () => ({
  getConnectionState: jest.fn(() => 'online'),
}));
jest.mock('../../../lib/offline/queue', () => ({ enqueue: jest.fn() }));
jest.mock('../../../store/session-state', () => ({
  useSessionUIStore: {
    getState: jest.fn(() => ({
      setCompletionSyncState: mockSetCompletionSyncState,
    })),
  },
}));
jest.mock('../../companion-promise/service', () => ({
  processCompletedSessionPromise: jest
    .fn()
    .mockResolvedValue({
      createdPromise: null,
      fulfilledPromise: null,
      missedPromise: null,
    }),
}));

jest.mock('../repository', () => ({
  createCompletionLedger: (...args: unknown[]) =>
    mockCreateCompletionLedger(...args),
  getCompletionLedgerByIdempotencyKey: (...args: unknown[]) =>
    mockGetCompletionLedgerByIdempotencyKey(...args),
}));
jest.mock('../completion-subsystems', () => ({
  applyCompletionSubsystems: (...args: unknown[]) =>
    mockApplyCompletionSubsystems(...args),
}));
jest.mock('../../personal-bests/service', () => ({
  checkAndUpdatePersonalBest: (...args: unknown[]) =>
    mockCheckAndUpdatePersonalBest(...args),
}));
jest.mock('../companion-memory-integration', () => ({
  recordCompletionCompanionMemories: jest.fn().mockResolvedValue([]),
}));
jest.mock('../story-view-model-service', () => ({
  buildPostSessionStoryViewModel: jest.fn((input: Record<string, unknown>) => ({
    ...input,
    gradeCard: { grade: 'A' },
    rewardReveal: {
      rewardIds:
        (input as { ledger?: { rewardIds?: string[] } }).ledger?.rewardIds ??
        [],
    },
    companionReaction: {
      reactionId:
        (input as { ledger?: { companionReactionId?: string } }).ledger
          ?.companionReactionId ?? null,
    },
    companionPromise:
      (input as { companionPromise?: unknown }).companionPromise ?? null,
    dailyMission: {
      status:
        (input as { ledger?: { dailyMissionResult?: { status?: string } } })
          .ledger?.dailyMissionResult?.status ?? 'unchanged',
    },
    headline: (input as { personalBest?: { isPersonalBest?: boolean } })
      .personalBest?.isPersonalBest
      ? { type: 'personal_best' }
      : { type: 'normal' },
    pendingSync: false,
  })),
}));
jest.mock('../ledger-service', () => ({
  buildCompletionLedger: jest.fn((input: Record<string, unknown>) => ({
    companionReactionId: null,
    completedAt: input.completedAt ?? Date.now(),
    completedDurationSeconds: 1500,
    createdAt: input.completedAt ?? Date.now(),
    dailyMissionResult: {
      missionId: null,
      progressDelta: 0,
      status: 'unchanged' as const,
    },
    degradedSystems: [],
    effectiveFocusedSeconds: 1400,
    focusScoreDelta: 8,
    grade: 'A',
    gradeScore: 88,
    idempotencyKey: `${input.sessionId}:${input.completedAt ?? Date.now()}`,
    interruptionCount: 0,
    ledgerId: '550e8400-e29b-41d4-a716-446655440011',
    mode: 'FLOW' as const,
    offlineSyncStatus: input.offlineSyncStatus ?? 'synced',
    pauseCount: 0,
    qualityScore: 88,
    rewardIds: [],
    sessionId: input.sessionId as string,
    startedAt: Date.now() - 1500000,
    streakResult: { action: 'extended' as const, newDays: 5, previousDays: 4 },
    strictMode: false,
    targetDurationSeconds: 1500,
    timezone: (input.timezone as string) ?? 'UTC',
    userId: input.userId as string,
    xpDelta: 120,
  })),
}));

describe('orchestrateSessionCompletion idempotency guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCompletionLedgerByIdempotencyKey.mockResolvedValue(null);
    mockCreateCompletionLedger.mockResolvedValue(ledger);
    mockApplyCompletionSubsystems.mockResolvedValue({
      degradedSystems: [],
      ledger,
    });
    mockCheckAndUpdatePersonalBest.mockResolvedValue({
      current: null,
      isNewRecord: false,
      margin: null,
      previousBest: null,
    });
  });

  it('does not replay subsystems for an already processed idempotency key', async () => {
    await orchestrateSessionCompletion({
      sessionId: summary.sessionId,
      summary,
      timestamp: 3000001,
      userId: summary.userId,
    });

    const replay = await orchestrateSessionCompletion({
      sessionId: summary.sessionId,
      summary,
      timestamp: 3000001,
      userId: summary.userId,
    });

    expect(replay).toBeNull();
    expect(mockApplyCompletionSubsystems).toHaveBeenCalledTimes(1);
  });
});
