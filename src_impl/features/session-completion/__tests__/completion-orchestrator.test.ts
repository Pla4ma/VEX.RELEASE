import { orchestrateSessionCompletion, initializeSessionCompletionOrchestrator } from '../completion-orchestrator';
import { eventBus } from '../../../events';
import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: jest.fn(),
}));

jest.mock('../../../events', () => ({
  eventBus: {
    subscribe: jest.fn(),
    emit: jest.fn(),
  },
}));

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('../../../lib/repository/base', () => ({
  getConnectionState: jest.fn().mockReturnValue('online'),
}));

jest.mock('../../../lib/offline/queue', () => ({
  enqueue: jest.fn(),
}));

jest.mock('../../../progression/ProgressionService', () => ({
  getProgressionService: jest.fn().mockReturnValue({
    addXP: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('../../../streaks/StreakService', () => ({
  getStreakService: jest.fn().mockReturnValue({
    recordSession: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: jest.fn().mockReturnValue({
    grantReward: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('../../../store/session-state', () => ({
  useSessionUIStore: {
    getState: jest.fn().mockReturnValue({
      setCompletionSyncState: jest.fn(),
    }),
  },
}));

jest.mock('../repository', () => ({
  createCompletionLedger: jest.fn(),
  getCompletionLedgerByIdempotencyKey: jest.fn(),
}));

// Helper to create a full valid ledger mock
function createMockLedger(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    companionReactionId: null,
    completedAt: Date.now(),
    completedDurationSeconds: 1500,
    createdAt: Date.now(),
    dailyMissionResult: { missionId: null, progressDelta: 0, status: 'unchanged' },
    degradedSystems: [],
    effectiveFocusedSeconds: 1400,
    focusScoreDelta: 8,
    grade: 'A',
    gradeScore: 85,
    idempotencyKey: 'key-123',
    interruptionCount: 0,
    ledgerId: '550e8400-e29b-41d4-a716-446655440001',
    mode: 'FLOW',
    offlineSyncStatus: 'synced',
    pauseCount: 0,
    qualityScore: 85,
    rewardIds: [],
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    startedAt: Date.now() - 1500000,
    streakResult: { action: 'extended', newDays: 5, previousDays: 4 },
    strictMode: false,
    targetDurationSeconds: 1500,
    timezone: 'UTC',
    userId: 'user-123',
    xpDelta: 100,
    ...overrides,
  };
}

const baseSummary: SessionSummary = {
  actualDuration: 1500,
  baseScore: 100,
  bonuses: [],
  coinsEarned: 50,
  completionPercentage: 100,
  createdAt: Date.now(),
  damageTaken: 0,
  effectiveDuration: 1400,
  finalScore: 120,
  focusPurityScore: 95,
  focusQuality: 95,
  gemsEarned: 0,
  interruptions: 0,
  modeBonus: 0,
  pausedDuration: 0,
  pausedTime: 0,
  pauses: 0,
  penaltiesApplied: [],
  plannedDuration: 1500,
  sessionId: '550e8400-e29b-41d4-a716-446655440000',
  sessionMode: SessionMode.FLOW,
  status: 'COMPLETED',
  streakBonus: 10,
  streakDays: 4,
  streakIncreased: true,
  streakMaintained: true,
  timeBonus: 10,
  userId: 'user-123',
  userLevel: 2,
  vsAverage: 0,
  vsBest: 0,
  xpEarned: 120,
};

describe('orchestrateSessionCompletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates ledger and updates all systems for normal completion', async () => {
    const { createCompletionLedger, getCompletionLedgerByIdempotencyKey } = require('../repository');
    const { getProgressionService } = require('../../../progression/ProgressionService');
    const { getStreakService } = require('../../../streaks/StreakService');
    const { getRewardService } = require('../../../rewards/RewardService');

    getCompletionLedgerByIdempotencyKey.mockResolvedValue(null);
    createCompletionLedger.mockResolvedValue(createMockLedger());

    await orchestrateSessionCompletion({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      summary: baseSummary,
      userId: 'user-123',
    });

    expect(createCompletionLedger).toHaveBeenCalled();
    expect(getProgressionService).toHaveBeenCalledWith('user-123');
    expect(getStreakService).toHaveBeenCalledWith('user-123');
    expect(getRewardService).toHaveBeenCalledWith('user-123');
  });

  it('skips processing for duplicate idempotency key', async () => {
    const { getCompletionLedgerByIdempotencyKey, createCompletionLedger } = require('../repository');
    const { useSessionUIStore } = require('../../../store/session-state');

    getCompletionLedgerByIdempotencyKey.mockResolvedValue(createMockLedger({
      ledgerId: '550e8400-e29b-41d4-a716-446655440999',
      idempotencyKey: '550e8400-e29b-41d4-a716-446655440000:1000000',
    }));

    await orchestrateSessionCompletion({
      timestamp: 1000000,
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      summary: baseSummary,
      userId: 'user-123',
    });

    expect(createCompletionLedger).not.toHaveBeenCalled();
    expect(useSessionUIStore.getState().setCompletionSyncState).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'synced' }),
    );
  });

  it('handles offline mode by queuing ledger', async () => {
    const { getConnectionState } = require('../../../lib/repository/base');
    const { enqueue } = require('../../../lib/offline/queue');
    const { createCompletionLedger, getCompletionLedgerByIdempotencyKey } = require('../repository');
    const { useSessionUIStore } = require('../../../store/session-state');

    getConnectionState.mockReturnValue('offline');
    getCompletionLedgerByIdempotencyKey.mockResolvedValue(null);
    createCompletionLedger.mockResolvedValue(createMockLedger({
      ledgerId: '550e8400-e29b-41d4-a716-446655440002',
      offlineSyncStatus: 'pending_sync',
    }));

    await orchestrateSessionCompletion({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      summary: baseSummary,
      userId: 'user-123',
    });

    expect(enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        feature: 'sessions',
        operation: 'CREATE',
      }),
    );
    expect(useSessionUIStore.getState().setCompletionSyncState).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'pending_sync',
        message: expect.stringContaining('offline'),
      }),
    );
  });

  it('continues with degraded state when non-critical system fails', async () => {
    const { createCompletionLedger, getCompletionLedgerByIdempotencyKey } = require('../repository');
    const { getRewardService } = require('../../../rewards/RewardService');
    const { useSessionUIStore } = require('../../../store/session-state');
    const { getConnectionState } = require('../../../lib/repository/base');

    getConnectionState.mockReturnValue('online');
    getCompletionLedgerByIdempotencyKey.mockResolvedValue(null);
    createCompletionLedger.mockResolvedValue(createMockLedger({
      ledgerId: '550e8400-e29b-41d4-a716-446655440003',
      offlineSyncStatus: 'synced',
      xpDelta: 100,
    }));
    getRewardService.mockReturnValue({
      grantReward: jest.fn().mockRejectedValue(new Error('Reward service down')),
    });

    await orchestrateSessionCompletion({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      summary: baseSummary,
      userId: 'user-123',
    });

    // When a subsystem fails in online mode, it should show degraded state
    expect(useSessionUIStore.getState().setCompletionSyncState).toHaveBeenCalled();
    const lastCall = useSessionUIStore.getState().setCompletionSyncState.mock.calls[0][0];
    expect(lastCall.status).toBe('failed_sync');
    expect(lastCall.message).toContain('rewards');
  });

  it('validates event input schema', async () => {
    await expect(
      orchestrateSessionCompletion({
        sessionId: 'not-a-uuid',
        summary: baseSummary,
        userId: 'user-123',
      }),
    ).rejects.toThrow();
  });

  it('requires userId in event', async () => {
    await expect(
      orchestrateSessionCompletion({
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        summary: baseSummary,
        userId: '',
      }),
    ).rejects.toThrow();
  });

  it('requires valid summary', async () => {
    await expect(
      orchestrateSessionCompletion({
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        summary: { invalid: true } as unknown as SessionSummary,
        userId: 'user-123',
      }),
    ).rejects.toThrow();
  });
});

describe('initializeSessionCompletionOrchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('subscribes to session:completed event on first call', () => {
    // First call should subscribe
    initializeSessionCompletionOrchestrator();

    expect(eventBus.subscribe).toHaveBeenCalledWith('session:completed', expect.any(Function));
  });

  it('is idempotent - multiple calls only subscribe once', () => {
    // Clear previous calls
    jest.clearAllMocks();

    // Multiple calls should not add more subscriptions
    initializeSessionCompletionOrchestrator();
    initializeSessionCompletionOrchestrator();
    initializeSessionCompletionOrchestrator();

    // If already initialized from previous tests, this should be 0
    // If not, it should be 1 - either way, the idempotency is verified
    expect((eventBus.subscribe as jest.Mock).mock.calls.length).toBeLessThanOrEqual(1);
  });
});
