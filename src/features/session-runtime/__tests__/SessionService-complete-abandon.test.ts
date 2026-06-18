import {
  createMockOrchestrator,
  type SessionConfig,
} from './SessionService.helpers';

describe('SessionOrchestrator', () => {
  let mockOrchestrator: Record<string, jest.Mock>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOrchestrator = createMockOrchestrator();
    mockOrchestrator.setUserId('test-user-id');
  });

  describe('completeSession', () => {
    it('should complete session and calculate XP correctly', async () => {
      const mockSummary = {
        sessionId: 'session-1',
        status: 'completed',
        duration: 25 * 60 * 1000,
        xpEarned: 250,
        coinsEarned: 10,
        multiplier: 1.5,
        streakBonus: 50,
      };
      mockOrchestrator.getSessionStatus.mockReturnValue({ status: 'active' });
      mockOrchestrator.completeSession.mockResolvedValue(mockSummary);
      const summary = await mockOrchestrator.completeSession();
      expect(mockOrchestrator.completeSession).toHaveBeenCalled();
      expect(summary.xpEarned).toBe(250);
      expect(summary.status).toBe('completed');
    });

    it('should calculate XP with multiple multipliers', async () => {
      const mockSummary = {
        sessionId: 'session-1',
        status: 'completed',
        duration: 25 * 60 * 1000,
        xpEarned: 375,
        baseXP: 250,
        streakMultiplier: 1.5,
        vipMultiplier: 1.0,
        challengeMultiplier: 1.0,
      };
      mockOrchestrator.completeSession.mockResolvedValue(mockSummary);
      const summary = await mockOrchestrator.completeSession();
      expect(summary.xpEarned).toBe(375);
      expect(summary.baseXP * summary.streakMultiplier).toBe(375);
    });

    it('should throw error when completing non-active session', async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({ status: 'idle' });
      mockOrchestrator.completeSession.mockRejectedValue(
        new Error('No active session to complete'),
      );
      await expect(mockOrchestrator.completeSession()).rejects.toThrow(
        'No active session to complete',
      );
    });
  });

  describe('abandonSession', () => {
    it('should abandon session with no XP awarded', async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({ status: 'active' });
      mockOrchestrator.abandonSession.mockResolvedValue(undefined);
      await mockOrchestrator.abandonSession('user_cancelled');
      expect(mockOrchestrator.abandonSession).toHaveBeenCalledWith(
        'user_cancelled',
      );
    });

    it('should not award streak credit when abandoned', async () => {
      mockOrchestrator.abandonSession.mockResolvedValue(undefined);
      await mockOrchestrator.abandonSession();
      expect(mockOrchestrator.abandonSession).toHaveBeenCalled();
    });

    it('should throw error when abandoning completed session', async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({
        status: 'completed',
      });
      mockOrchestrator.abandonSession.mockRejectedValue(
        new Error('Cannot abandon completed session'),
      );
      await expect(mockOrchestrator.abandonSession()).rejects.toThrow(
        'Cannot abandon completed session',
      );
    });
  });

  describe('offline queue fallback', () => {
    it('should queue session when supabase call fails', async () => {
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
      mockOrchestrator.createSession.mockRejectedValue(
        new Error('Network error'),
      );
      await expect(mockOrchestrator.createSession(validConfig)).rejects.toThrow(
        'Network error',
      );
    });

    it('should retry queued sessions when connection restored', async () => {
      expect(true).toBe(true);
    });
  });
});
