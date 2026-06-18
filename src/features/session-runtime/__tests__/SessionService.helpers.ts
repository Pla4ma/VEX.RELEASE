import { getSessionOrchestrator } from '../orchestrator-factory';
import type { SessionConfig, SessionState } from '../types';

jest.mock('../orchestrator-factory', () => ({
  getSessionOrchestrator: jest.fn(),
  createSessionOrchestrator: jest.fn(),
  SessionOrchestrator: jest.fn(),
}));

jest.mock('../repository/SessionRepository', () => ({
  getSessionRepository: jest.fn().mockReturnValue({
    setUserId: jest.fn(),
    getActiveSession: jest.fn().mockResolvedValue(null),
    saveSession: jest.fn().mockResolvedValue(undefined),
    updateSession: jest.fn().mockResolvedValue(undefined),
  }),
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

jest.mock('../integration/SessionRewardIntegration', () => ({
  getSessionRewardIntegration: jest.fn().mockReturnValue({
    onSessionComplete: jest.fn(),
  }),
}));

export { getSessionOrchestrator };
export type { SessionConfig, SessionState };

export function createMockOrchestrator(): Record<string, jest.Mock> {
  const mock = {
    createSession: jest.fn(),
    startSession: jest.fn(),
    pauseSession: jest.fn(),
    resumeSession: jest.fn(),
    abandonSession: jest.fn(),
    completeSession: jest.fn(),
    getSessionStatus: jest.fn(),
    isSessionActive: jest.fn().mockReturnValue(false),
    setUserId: jest.fn(),
    backgroundSession: jest.fn(),
    foregroundSession: jest.fn(),
    applyStudyQuizBonus: jest.fn(),
    attemptRecovery: jest.fn(),
    destroy: jest.fn(),
    getSession: jest.fn(),
    getCurrentSession: jest.fn().mockReturnValue(null),
    isPaused: jest.fn().mockReturnValue(false),
    getRemainingSeconds: jest.fn().mockReturnValue(0),
    getElapsedSeconds: jest.fn().mockReturnValue(0),
    getCompletionPercentage: jest.fn().mockReturnValue(0),
    getPercentageComplete: jest.fn().mockReturnValue(0),
    getCurrentPurityScore: jest.fn().mockReturnValue(100),
    getPurityLabel: jest.fn().mockReturnValue('Elite'),
    getSessionHistory: jest.fn().mockResolvedValue([]),
    getSessionById: jest.fn().mockResolvedValue(null),
    getSessionSummary: jest.fn().mockResolvedValue(null),
    getSessionStats: jest.fn().mockResolvedValue({
      totalSessions: 0,
      completedSessions: 0,
      abandonedSessions: 0,
      totalFocusTime: 0,
      averageSessionDuration: 0,
      currentStreak: 0,
      longestStreak: 0,
    }),
    getAllPresets: jest.fn().mockReturnValue([]),
    createCustomPreset: jest.fn(),
    deletePreset: jest.fn().mockResolvedValue(undefined),
  };
  (getSessionOrchestrator as jest.Mock).mockReturnValue(mock);
  return mock;
}
