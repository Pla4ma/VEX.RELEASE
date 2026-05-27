import { SessionService, createSessionService } from '../SessionService';
import { getSessionRepository } from '../repository/SessionRepository';
import { eventBus } from '../../events';
import { SESSION_CONSTANTS } from '../index';

jest.mock('../repository/SessionRepository');
jest.mock('../../events');

export interface TestContext {
  service: SessionService;
  mockRepository: jest.Mocked<ReturnType<typeof getSessionRepository>>;
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
  const mockRepository = {
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
    getSessionStats: jest.fn().mockResolvedValue({ totalSessions: 0, totalDuration: 0, streak: 0 }),
  } as jest.Mocked<ReturnType<typeof getSessionRepository>>;

  (getSessionRepository as jest.Mock).mockReturnValue(mockRepository);
  (eventBus.publish as jest.Mock).mockImplementation(() => {});
  (eventBus.subscribe as jest.Mock).mockImplementation(() => () => {});

  const service = createSessionService(mockUserId);
  return { service, mockRepository };
}
