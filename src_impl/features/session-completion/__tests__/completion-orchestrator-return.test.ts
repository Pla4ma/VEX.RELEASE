import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
import { orchestrateSessionCompletion } from '../completion-orchestrator';
import type { CompletionLedger } from '../schemas';

const mockSetCompletionSyncState = jest.fn();
const mockApplyCompletionSubsystems = jest.fn();
const mockCheckAndUpdatePersonalBest = jest.fn();
const mockCreateCompletionLedger = jest.fn();
const mockGetCompletionLedgerByIdempotencyKey = jest.fn();

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('../../../events', () => ({
  eventBus: {
    subscribe: jest.fn(),
  },
}));

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));

jest.mock('../../../lib/repository/base', () => ({
  getConnectionState: jest.fn(() => 'online'),
}));

jest.mock('../../../lib/offline/queue', () => ({
  enqueue: jest.fn(),
}));

jest.mock('../../../store/session-state', () => ({
  useSessionUIStore: {
    getState: jest.fn(() => ({
      setCompletionSyncState: mockSetCompletionSyncState,
    })),
  },
}));

jest.mock('../repository', () => ({
  createCompletionLedger: (...args: unknown[]) => mockCreateCompletionLedger(...args),
  getCompletionLedgerByIdempotencyKey: (...args: unknown[]) =>
    mockGetCompletionLedgerByIdempotencyKey(...args),
}));

jest.mock('../completion-subsystems', () => ({
  applyCompletionSubsystems: (...args: unknown[]) => mockApplyCompletionSubsystems(...args),
}));

jest.mock('../../personal-bests/service', () => ({
  checkAndUpdatePersonalBest: (...args: unknown[]) => mockCheckAndUpdatePersonalBest(...args),
}));

const summary: SessionSummary = {
  actualDuration: 1500,
  baseScore: 100,
  bonuses: [],
  coinsEarned: 50,
  completionPercentage: 100,
  createdAt: 500000,
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
  sessionId: '550e8400-e29b-41d4-a716-446655440010',
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

const ledger: CompletionLedger = {
  companionReactionId: 'companion-session-complete',
  completedAt: 3000000,
  completedDurationSeconds: 1500,
  createdAt: 3000000,
  dailyMissionResult: { missionId: 'daily-focus-session', progressDelta: 1, status: 'progressed' },
  degradedSystems: [],
  effectiveFocusedSeconds: 1400,
  focusScoreDelta: 8,
  grade: 'A',
  gradeScore: 88,
  idempotencyKey: '550e8400-e29b-41d4-a716-446655440010:3000000',
  interruptionCount: 0,
  ledgerId: '550e8400-e29b-41d4-a716-446655440011',
  mode: SessionMode.FLOW,
  offlineSyncStatus: 'synced',
  pauseCount: 0,
  qualityScore: 88,
  rewardIds: ['session-currency:550e8400-e29b-41d4-a716-446655440010'],
  sessionId: '550e8400-e29b-41d4-a716-446655440010',
  startedAt: 1500000,
  streakResult: { action: 'extended', newDays: 5, previousDays: 4 },
  strictMode: false,
  targetDurationSeconds: 1500,
  timezone: 'UTC',
  userId: 'user-123',
  xpDelta: 120,
};

describe('orchestrateSessionCompletion story return', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCompletionLedgerByIdempotencyKey.mockResolvedValue(null);
    mockCreateCompletionLedger.mockResolvedValue(ledger);
    mockApplyCompletionSubsystems.mockResolvedValue({ degradedSystems: [], ledger });
    mockCheckAndUpdatePersonalBest.mockResolvedValue({
      current: null,
      isNewRecord: false,
      margin: null,
      previousBest: null,
    });
  });

  it('returns a post-session story view model after subsystem updates', async () => {
    const story = await orchestrateSessionCompletion({
      sessionId: summary.sessionId,
      summary,
      timestamp: 3000000,
      userId: summary.userId,
    });

    expect(story?.gradeCard.grade).toBe('A');
    expect(story?.rewardReveal.rewardIds).toEqual(ledger.rewardIds);
    expect(story?.companionReaction.reactionId).toBe('companion-session-complete');
    expect(story?.dailyMission.status).toBe('progressed');
    expect(mockSetCompletionSyncState).toHaveBeenCalledWith(expect.objectContaining({ status: 'synced' }));
  });

  it('passes a new personal best into the headline reward', async () => {
    mockCheckAndUpdatePersonalBest.mockResolvedValueOnce({
      current: { bestPurityScore: 95 },
      isNewRecord: true,
      margin: 7,
      previousBest: 88,
    });

    const story = await orchestrateSessionCompletion({
      sessionId: summary.sessionId,
      summary,
      timestamp: 3000002,
      userId: summary.userId,
    });

    expect(mockCheckAndUpdatePersonalBest).toHaveBeenCalledWith(
      summary.userId,
      ledger.mode,
      ledger.targetDurationSeconds,
      summary.focusPurityScore,
      ledger.grade,
    );
    expect(story?.headline.type).toBe('personal_best');
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
