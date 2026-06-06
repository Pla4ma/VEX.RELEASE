import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSession } from '../useSession';
import { getSessionOrchestrator } from '../../SessionOrchestrator';
jest.mock('../../SessionOrchestrator');
describe('useSession', () => {
  const mockUserId = 'test-user-123';
  const mockOrchestrator = {
    setUserId: jest.fn(),
    getSession: jest.fn(),
    isSessionActive: jest.fn(),
    isPaused: jest.fn(),
    getRemainingSeconds: jest.fn(),
    getElapsedSeconds: jest.fn(),
    getPercentageComplete: jest.fn(),
    createSession: jest.fn(),
    startSession: jest.fn(),
    pauseSession: jest.fn(),
    resumeSession: jest.fn(),
    completeSession: jest.fn(),
    abandonSession: jest.fn(),
    backgroundSession: jest.fn(),
    foregroundSession: jest.fn(),
    attemptRecovery: jest.fn(),
    applyStudyQuizBonus: jest.fn(),
    getCurrentPurityScore: jest.fn(),
    getPurityLabel: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrchestrator.getSession.mockReturnValue(null);
    mockOrchestrator.isSessionActive.mockReturnValue(false);
    mockOrchestrator.isPaused.mockReturnValue(false);
    mockOrchestrator.getRemainingSeconds.mockReturnValue(0);
    mockOrchestrator.getElapsedSeconds.mockReturnValue(0);
    mockOrchestrator.getPercentageComplete.mockReturnValue(0);
    (getSessionOrchestrator as jest.Mock).mockReturnValue(mockOrchestrator);
  });
  describe('Initialization', () => {
    it('should initialize with no session', async () => {
      mockOrchestrator.getSession.mockReturnValue(null);
      const { result } = renderHook(() => useSession(mockUserId));
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.session).toBeNull();
      expect(result.current.isActive).toBe(false);
    });
    it('should load active session on mount', async () => {
      const mockSession = { id: 'session-1', status: 'ACTIVE', phase: 'FOCUS' };
      mockOrchestrator.getSession.mockReturnValue(mockSession);
      mockOrchestrator.isSessionActive.mockReturnValue(true);
      const { result } = renderHook(() => useSession(mockUserId));
      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession);
      });
      expect(mockOrchestrator.setUserId).toHaveBeenCalledWith(mockUserId);
    });
  });
  describe('Session Creation', () => {
    it('should create session from config', async () => {
      const mockConfig = { duration: 1500, category: 'Deep Work' };
      const mockNewSession = { id: 'session-2', status: 'CREATED' };
      mockOrchestrator.createSession.mockResolvedValue(mockNewSession);
      const { result } = renderHook(() => useSession(mockUserId));
      await act(async () => {
        await result.current.createSession(mockConfig as never);
      });
      expect(mockOrchestrator.createSession).toHaveBeenCalledWith(
        mockConfig,
      );
    });
    it('should create custom session', async () => {
      const mockConfig = { duration: 1800, category: 'Study' };
      const mockNewSession = { id: 'session-3', status: 'CREATED' };
      mockOrchestrator.createSession.mockResolvedValue(mockNewSession);
      const { result } = renderHook(() => useSession(mockUserId));
      await act(async () => {
        await result.current.createSession(mockConfig as never);
      });
      expect(mockOrchestrator.createSession).toHaveBeenCalledWith(
        mockConfig,
      );
    });
  });
  describe('Session Control', () => {
    beforeEach(() => {
      mockOrchestrator.getSession.mockReturnValue({
        id: 'session-1',
        status: 'ACTIVE',
      });
      mockOrchestrator.isSessionActive.mockReturnValue(true);
    });
    it('should start session', async () => {
      mockOrchestrator.startSession.mockResolvedValue(undefined);
      const { result } = renderHook(() => useSession(mockUserId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => {
        await result.current.startSession();
      });
      expect(mockOrchestrator.startSession).toHaveBeenCalled();
    });
    it('should pause session', async () => {
      mockOrchestrator.pauseSession.mockResolvedValue(undefined);
      const { result } = renderHook(() => useSession(mockUserId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => {
        await result.current.pauseSession('Test reason');
      });
      expect(mockOrchestrator.pauseSession).toHaveBeenCalledWith(
        'Test reason',
      );
    });
    it('should resume session', async () => {
      mockOrchestrator.resumeSession.mockResolvedValue(undefined);
      const { result } = renderHook(() => useSession(mockUserId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => {
        await result.current.resumeSession();
      });
      expect(mockOrchestrator.resumeSession).toHaveBeenCalled();
    });
    it('should abandon session', async () => {
      mockOrchestrator.abandonSession.mockResolvedValue(undefined);
      const { result } = renderHook(() => useSession(mockUserId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => {
        await result.current.abandonSession('Test abandon');
      });
      expect(mockOrchestrator.abandonSession).toHaveBeenCalledWith(
        'Test abandon',
      );
    });
  });
  describe('Recovery', () => {
    it('should attempt recovery', async () => {
      mockOrchestrator.attemptRecovery.mockResolvedValue(true);
      const { result } = renderHook(() => useSession(mockUserId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      const recoveryResult = await act(async () => {
        return await result.current.attemptRecovery('USER_RESUME');
      });
      expect(mockOrchestrator.attemptRecovery).toHaveBeenCalledWith(
        'USER_RESUME',
      );
      expect(recoveryResult).toBe(true);
    });
  });
  describe('Error Handling', () => {
    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockOrchestrator.getSession.mockImplementation(() => {
        throw error;
      });
      const { result } = renderHook(() => useSession(mockUserId));
      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
      expect(result.current.isLoading).toBe(false);
    });
    it('should clear error on refresh', async () => {
      const error = new Error('Service error');
      mockOrchestrator.getSession
        .mockImplementationOnce(() => {
          throw error;
        })
        .mockReturnValueOnce({ id: 'session-1', status: 'ACTIVE' });
      const { result } = renderHook(() => useSession(mockUserId));
      await waitFor(() => expect(result.current.error).toEqual(error));
      await act(async () => {
        await result.current.refresh();
      });
      expect(result.current.error).toBeNull();
    });
  });
  describe('State Updates', () => {
    it('should update state on refresh', async () => {
      const initialSession = { id: 'session-1', status: 'ACTIVE' };
      const updatedSession = { id: 'session-1', status: 'COMPLETED' };
      mockOrchestrator.getSession
        .mockReturnValueOnce(initialSession)
        .mockReturnValueOnce(updatedSession);
      const { result } = renderHook(() => useSession(mockUserId));
      await waitFor(() =>
        expect(result.current.session).toEqual(initialSession),
      );
      await act(async () => {
        await result.current.refresh();
      });
      expect(result.current.session).toEqual(updatedSession);
    });
  });
});
