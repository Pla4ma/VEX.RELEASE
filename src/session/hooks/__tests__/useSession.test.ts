/**
 * useSession Hook Tests
 *
 * Test suite for the useSession hook.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSession } from '../useSession';
import { getSessionService } from '../../SessionService';

jest.mock('../../SessionService');

describe('useSession', () => {
  const mockUserId = 'test-user-123';
  const mockSessionService = {
    setUserId: jest.fn(),
    getActiveSession: jest.fn(),
    createSessionFromPreset: jest.fn(),
    createCustomSession: jest.fn(),
    startSession: jest.fn(),
    pauseSession: jest.fn(),
    resumeSession: jest.fn(),
    abandonSession: jest.fn(),
    attemptRecovery: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSessionService as jest.Mock).mockReturnValue(mockSessionService);
  });

  describe('Initialization', () => {
    it('should initialize with no session', async () => {
      mockSessionService.getActiveSession.mockResolvedValue(null);

      const { result } = renderHook(() => useSession(mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).toBeNull();
      expect(result.current.isActive).toBe(false);
    });

    it('should load active session on mount', async () => {
      const mockSession = {
        id: 'session-1',
        status: 'ACTIVE',
        phase: 'FOCUS',
      };
      mockSessionService.getActiveSession.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useSession(mockUserId));

      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession);
      });

      expect(mockSessionService.setUserId).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('Session Creation', () => {
    it('should create session from preset', async () => {
      const mockPreset = { id: 'preset-1', duration: 1500 };
      const mockNewSession = { id: 'session-2', status: 'CREATED' };
      mockSessionService.createSessionFromPreset.mockResolvedValue(mockNewSession);

      const { result } = renderHook(() => useSession(mockUserId));

      await act(async () => {
        await result.current.createFromPreset(mockPreset.id);
      });

      expect(mockSessionService.createSessionFromPreset).toHaveBeenCalledWith(mockPreset.id);
    });

    it('should create custom session', async () => {
      const mockConfig = { duration: 1800, category: 'Study' };
      const mockNewSession = { id: 'session-3', status: 'CREATED' };
      mockSessionService.createCustomSession.mockResolvedValue(mockNewSession);

      const { result } = renderHook(() => useSession(mockUserId));

      await act(async () => {
        await result.current.createCustom(mockConfig as any);
      });

      expect(mockSessionService.createCustomSession).toHaveBeenCalledWith(mockConfig);
    });
  });

  describe('Session Control', () => {
    beforeEach(() => {
      mockSessionService.getActiveSession.mockResolvedValue({
        id: 'session-1',
        status: 'ACTIVE',
      });
    });

    it('should start session', async () => {
      mockSessionService.startSession.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSession(mockUserId));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.startSession();
      });

      expect(mockSessionService.startSession).toHaveBeenCalled();
    });

    it('should pause session', async () => {
      mockSessionService.pauseSession.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSession(mockUserId));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.pauseSession('Test reason');
      });

      expect(mockSessionService.pauseSession).toHaveBeenCalledWith('Test reason');
    });

    it('should resume session', async () => {
      mockSessionService.resumeSession.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSession(mockUserId));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.resumeSession();
      });

      expect(mockSessionService.resumeSession).toHaveBeenCalled();
    });

    it('should abandon session', async () => {
      mockSessionService.abandonSession.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSession(mockUserId));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.abandonSession('Test abandon');
      });

      expect(mockSessionService.abandonSession).toHaveBeenCalledWith('Test abandon');
    });
  });

  describe('Recovery', () => {
    it('should attempt recovery', async () => {
      mockSessionService.attemptRecovery.mockResolvedValue(true);

      const { result } = renderHook(() => useSession(mockUserId));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const recoveryResult = await act(async () => {
        return await result.current.attemptRecovery('USER_RESUME');
      });

      expect(mockSessionService.attemptRecovery).toHaveBeenCalledWith('USER_RESUME');
      expect(recoveryResult).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockSessionService.getActiveSession.mockRejectedValue(error);

      const { result } = renderHook(() => useSession(mockUserId));

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should clear error on refresh', async () => {
      const error = new Error('Service error');
      mockSessionService.getActiveSession
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ id: 'session-1', status: 'ACTIVE' });

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

      mockSessionService.getActiveSession
        .mockResolvedValueOnce(initialSession)
        .mockResolvedValueOnce(updatedSession);

      const { result } = renderHook(() => useSession(mockUserId));

      await waitFor(() => expect(result.current.session).toEqual(initialSession));

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.session).toEqual(updatedSession);
    });
  });
});
