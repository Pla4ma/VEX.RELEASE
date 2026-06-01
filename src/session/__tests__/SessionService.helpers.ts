import { SessionService } from '../SessionService';
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

export { SessionService, getSessionOrchestrator };
export type { SessionConfig, SessionState };

export function createService(): SessionService {
  return new SessionService({
    enableAnalytics: false,
    enableNotifications: false,
  });
}
