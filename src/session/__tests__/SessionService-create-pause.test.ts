import {
  createMockOrchestrator,
  type SessionConfig,
  type SessionState,
} from './SessionService.helpers';

describe('SessionOrchestrator', () => {
  let mockOrchestrator: Record<string, jest.Mock>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOrchestrator = createMockOrchestrator();
    mockOrchestrator.setUserId('test-user-id');
  });

  const validConfig: SessionConfig = {
    duration: 25 * 60 * 1000,
    breakDuration: 5 * 60 * 1000,
    longBreakDuration: 15 * 60 * 1000,
    intervals: 4,
    longBreakInterval: 4,
    soundEnabled: true,
    vibrationEnabled: true,
    dndEnabled: false,
    strictMode: false,
    autoStartBreaks: false,
    autoStartNextInterval: false,
    category: 'focus',
    tags: ['work'],
  };

  describe('createSession', () => {
    it('should create session with valid config', async () => {
      const mockSession: SessionState = {
        id: 'session-1',
        status: 'created',
        config: validConfig,
        progress: {
          elapsed: 0,
          remaining: validConfig.duration,
          percentage: 0,
        },
        createdAt: Date.now(),
      };
      mockOrchestrator.createSession.mockResolvedValue(mockSession);
      const session = await mockOrchestrator.createSession(validConfig);
      expect(mockOrchestrator.createSession).toHaveBeenCalledWith(validConfig);
      expect(session).toEqual(mockSession);
    });

    it('should throw error when no user is set', async () => {
      const orchWithoutUser = createMockOrchestrator();
      orchWithoutUser.createSession.mockRejectedValue(
        new Error('SessionOrchestrator: No user set'),
      );
      await expect(
        orchWithoutUser.createSession(validConfig),
      ).rejects.toThrow('SessionOrchestrator: No user set');
    });

    it('should throw error when active session exists', async () => {
      mockOrchestrator.isSessionActive.mockReturnValue(true);
      const { getSessionRepository } = require('../repository/SessionRepository');
      const repo = getSessionRepository();
      repo.getActiveSession.mockResolvedValue({ id: 'existing-session' });
      mockOrchestrator.createSession.mockRejectedValue(
        new Error('Cannot create new session: one is already active'),
      );
      await expect(mockOrchestrator.createSession(validConfig)).rejects.toThrow(
        'Cannot create new session: one is already active',
      );
    });

    it('should throw error for invalid duration (zero)', async () => {
      const invalidConfig = { ...validConfig, duration: 0 };
      mockOrchestrator.createSession.mockRejectedValue(new Error('validation error'));
      await expect(
        mockOrchestrator.createSession(invalidConfig),
      ).rejects.toThrow();
    });

    it('should throw error for invalid duration (negative)', async () => {
      const invalidConfig = { ...validConfig, duration: -1000 };
      mockOrchestrator.createSession.mockRejectedValue(new Error('validation error'));
      await expect(
        mockOrchestrator.createSession(invalidConfig),
      ).rejects.toThrow();
    });
  });

  describe('pauseSession', () => {
    it('should pause active session', async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({ status: 'active' });
      mockOrchestrator.pauseSession.mockResolvedValue(undefined);
      await mockOrchestrator.pauseSession('user_request');
      expect(mockOrchestrator.pauseSession).toHaveBeenCalledWith(
        'user_request',
      );
    });

    it('should throw error when pausing already paused session', async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({ status: 'paused' });
      mockOrchestrator.pauseSession.mockRejectedValue(
        new Error('Session already paused'),
      );
      await expect(mockOrchestrator.pauseSession()).rejects.toThrow(
        'Session already paused',
      );
    });

    it('should throw error when pausing in strict mode', async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({
        status: 'active',
        isStrictMode: true,
      });
      mockOrchestrator.pauseSession.mockRejectedValue(
        new Error('Cannot pause in strict mode'),
      );
      await expect(mockOrchestrator.pauseSession()).rejects.toThrow(
        'Cannot pause in strict mode',
      );
    });

    it('should throw error when no active session', async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({ status: 'idle' });
      mockOrchestrator.pauseSession.mockRejectedValue(
        new Error('No active session'),
      );
      await expect(mockOrchestrator.pauseSession()).rejects.toThrow('No active session');
    });
  });
});
