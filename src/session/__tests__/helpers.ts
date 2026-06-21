import { getSessionOrchestrator } from '../SessionOrchestrator';
import { getSessionRepository } from '../repository/SessionRepository';
import { eventBus } from '../../events';

jest.mock('../repository/SessionRepository');
jest.mock('../../events');
jest.mock('../SessionOrchestrator', () => ({
  getSessionOrchestrator: jest.fn(),
  createSessionOrchestrator: jest.fn(),
  SessionOrchestrator: jest.fn(),
}));
jest.mock('../SessionEventEmitter', () => ({
  getSessionEventEmitter: jest.fn().mockReturnValue({
    attach: jest.fn(),
    detach: jest.fn(),
    emitSessionCreated: jest.fn(),
    emitNotification: jest.fn(),
  }),
}));
jest.mock('../integration/RewardAdapter', () => ({
  getRewardAdapter: jest.fn().mockReturnValue({
    setUserId: jest.fn(),
  }),
}));
jest.mock('../presets', () => ({
  getPresetService: jest.fn().mockReturnValue({
    setUserId: jest.fn(),
    getPresetById: jest.fn().mockReturnValue(null),
  }),
}));

export interface TestContext {
  orchestrator: Record<string, jest.Mock>;
  mockRepository: jest.Mocked<ReturnType<typeof getSessionRepository>>;
  mockOrchestrator: Record<string, jest.Mock>;
}

export const mockUserId = 'test-user-123';

export const mockSessionConfig = {
  duration: 1800,
  type: 'focus' as const,
  difficulty: 'medium' as const,
  enableNotifications: true,
  enableSound: true,
};

export function createTestContext(): TestContext {
  const mockOrchestrator: Record<string, jest.Mock> = {
    createSession: jest.fn().mockResolvedValue({
      id: 'test-session-123',
      userId: mockUserId,
      status: 'PREPARING',
      phase: 'PREPARATION',
      config: {},
    }),
    startSession: jest.fn().mockResolvedValue(undefined),
    pauseSession: jest.fn().mockResolvedValue(undefined),
    resumeSession: jest.fn().mockResolvedValue(undefined),
    abandonSession: jest.fn().mockResolvedValue(undefined),
    completeSession: jest.fn().mockResolvedValue({
      sessionId: 'test-session-123',
      userId: mockUserId,
      status: 'COMPLETED',
      finalScore: 100,
      xpEarned: 50,
      completionPercentage: 100,
    }),
    getSessionStatus: jest.fn(),
    isSessionActive: jest.fn().mockReturnValue(false),
    setUserId: jest.fn(),
    backgroundSession: jest.fn().mockResolvedValue(undefined),
    foregroundSession: jest.fn().mockResolvedValue(undefined),
    applyStudyQuizBonus: jest.fn(),
    attemptRecovery: jest.fn(),
    destroy: jest.fn(),
    getSession: jest.fn(),
    getPercentageComplete: jest.fn(),
    getCurrentSession: jest.fn().mockReturnValue(null),
    isPaused: jest.fn().mockReturnValue(false),
    isSessionPaused: jest.fn().mockReturnValue(false),
    getRemainingSeconds: jest.fn().mockReturnValue(0),
    getElapsedSeconds: jest.fn().mockReturnValue(0),
    getCompletionPercentage: jest.fn().mockReturnValue(0),
    getCurrentPurityScore: jest.fn().mockReturnValue(100),
    getPurityLabel: jest.fn().mockReturnValue('Elite'),
    getSessionHistory: jest.fn().mockResolvedValue([]),
    getSessionStats: jest.fn().mockResolvedValue({
      totalSessions: 0,
      totalDuration: 0,
      streak: 0,
    }),
    getAllPresets: jest.fn().mockReturnValue([]),
    createCustomPreset: jest.fn(),
    deletePreset: jest.fn().mockResolvedValue(undefined),
  };

  (getSessionOrchestrator as jest.Mock).mockReturnValue(mockOrchestrator);

  const mockRepository = {
    setUserId: jest.fn(),
    saveSession: jest.fn().mockResolvedValue(undefined),
    getSession: jest.fn().mockResolvedValue(null),
    updateSession: jest.fn().mockResolvedValue(undefined),
    deleteSession: jest.fn().mockResolvedValue(undefined),
    listSessions: jest.fn().mockResolvedValue([]),
    getSessionHistory: jest.fn().mockResolvedValue([]),
    getActiveSession: jest.fn().mockResolvedValue(null),
    saveActiveSession: jest.fn().mockResolvedValue(undefined),
    clearActiveSession: jest.fn().mockResolvedValue(undefined),
    getSessionById: jest.fn().mockResolvedValue(null),
    addToHistory: jest.fn().mockResolvedValue(undefined),
    getSessionSummary: jest.fn().mockResolvedValue(null),
    saveSessionSummary: jest.fn().mockResolvedValue(undefined),
    getAllSummaries: jest.fn().mockResolvedValue([]),
    addToSyncQueue: jest.fn().mockResolvedValue(undefined),
    removeFromSyncQueue: jest.fn().mockResolvedValue(undefined),
    getSyncQueue: jest.fn().mockResolvedValue([]),
    getSessionStats: jest
      .fn()
      .mockResolvedValue({ totalSessions: 0, totalDuration: 0, streak: 0 }),
  } as jest.Mocked<ReturnType<typeof getSessionRepository>>;

  (getSessionRepository as jest.Mock).mockReturnValue(mockRepository);
  (eventBus.publish as jest.Mock).mockImplementation(() => {});
  (eventBus.subscribe as jest.Mock).mockImplementation(() => () => {});

  const service = mockOrchestrator as unknown as ReturnType<typeof getSessionOrchestrator>;
  service.setUserId(mockUserId);
  return { service, mockRepository, mockOrchestrator };}
