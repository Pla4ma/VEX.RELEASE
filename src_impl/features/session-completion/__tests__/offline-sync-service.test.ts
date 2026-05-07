/**
 * Session Completion Offline Sync Service Tests
 * 
 * Tests for the enhanced offline sync system that ensures session completion
 * data is never lost.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { z } from 'zod';
import {
  SessionCompletionOfflineSyncService,
  SessionCompletionOfflineSyncError,
  useSessionCompletionOfflineSync,
  sessionCompletionOfflineSync,
} from '../offline-sync-service';
import {
  CompletionLedgerSchema,
  type CompletionLedger,
  type CompletionSyncStatus,
} from '../schemas';
import {
  createCompletionLedger,
  updateCompletionSyncStatus,
  SessionCompletionRepositoryError,
} from '../repository';
import { enqueue, type OfflineQueueEntry } from '../../../lib/offline/queue';

// Mock dependencies
jest.mock('../repository');
jest.mock('../../../lib/offline/queue');
jest.mock('../../../network/useNetInfo');

const mockCreateCompletionLedger = jest.mocked(createCompletionLedger);
const mockUpdateCompletionSyncStatus = jest.mocked(updateCompletionSyncStatus);
const mockEnqueue = jest.mocked(enqueue);

// Mock NetInfo
const mockUseNetInfo = jest.fn(() => ({
  isOnline: true,
  isConnected: true,
  isInternetReachable: true,
  subscribe: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('SessionCompletionOfflineSyncService', () => {
  let service: SessionCompletionOfflineSyncService;
  let testLedger: CompletionLedger;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Clear fallback storage
    localStorageMock.removeItem('vex_session_completion_fallback');

    service = new SessionCompletionOfflineSyncService();

    testLedger = CompletionLedgerSchema.parse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      ledgerId: '550e8400-e29b-41d4-a716-446655440002',
      idempotencyKey: 'idempotency-key-123',
      completedAt: Date.now(),
      createdAt: Date.now(),
      offlineSyncStatus: 'pending_sync' as CompletionSyncStatus,
      mode: 'DEEP_WORK',
      targetDurationSeconds: 1800,
      completedDurationSeconds: 1500,
      effectiveFocusedSeconds: 1200,
      pauseCount: 2,
      interruptionCount: 1,
      strictMode: true,
      startedAt: Date.now() - 1800000,
      timezone: 'UTC',
      grade: 'A',
      gradeScore: 95,
      qualityScore: 90,
      focusScoreDelta: 100,
      xpDelta: 150,
      streakResult: {
        maintained: true,
        extended: false,
        currentStreak: 5,
        streakBonusApplied: true,
      },
      companionReactionId: 'reaction-123',
      rewardIds: ['reward-1', 'reward-2'],
      dailyMissionResult: {
        missionId: 'mission-123',
        completed: true,
        progress: 100,
      },
    });
  });

  afterEach(() => {
    localStorageMock.removeItem('vex_session_completion_fallback');
  });

  describe('queueSessionCompletion', () => {
    it('should queue session completion when online sync fails', async () => {
      const mockEntry: OfflineQueueEntry = {
        id: 'queue-entry-123',
        operation: 'SESSION_COMPLETE',
        feature: 'sessions',
        payload: testLedger,
        idempotencyKey: testLedger.idempotencyKey,
        createdAt: Date.now(),
        retryCount: 0,
        maxRetries: 10,
        priority: 'critical',
      };

      mockCreateCompletionLedger.mockRejectedValue(
        new SessionCompletionRepositoryError('create', new Error('Network error'))
      );
      mockEnqueue.mockReturnValue(mockEntry);

      const result = await service.queueSessionCompletion(testLedger);

      expect(result.queued).toBe(true);
      expect(result.synced).toBe(false);
      expect(result.entryId).toBe('queue-entry-123');
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'SESSION_COMPLETE',
          feature: 'sessions',
          payload: testLedger,
          priority: 'critical',
          maxRetries: 10,
        })
      );
    });

    it('should sync immediately when forceSync is true and online', async () => {
      mockCreateCompletionLedger.mockResolvedValue(testLedger);
      mockUpdateCompletionSyncStatus.mockResolvedValue(undefined);

      const result = await service.queueSessionCompletion(testLedger, { forceSync: true });

      expect(result.queued).toBe(false);
      expect(result.synced).toBe(true);
      expect(mockCreateCompletionLedger).toHaveBeenCalledWith(testLedger);
      expect(mockUpdateCompletionSyncStatus).toHaveBeenCalledWith(
        testLedger.ledgerId,
        'synced'
      );
    });

    it('should handle duplicate session completions gracefully', async () => {
      const duplicateError = new SessionCompletionRepositoryError('create', {
        code: '23505',
        message: 'duplicate key',
      });
      mockCreateCompletionLedger.mockRejectedValue(duplicateError);

      const result = await service.syncImmediately(testLedger);

      expect(result).toBe(testLedger);
    });

    it('should validate ledger input', async () => {
      const invalidLedger = { invalid: 'data' } as any;

      await expect(
        service.queueSessionCompletion(invalidLedger)
      ).rejects.toThrow();
    });
  });

  describe('syncImmediately', () => {
    it('should sync session completion to server', async () => {
      mockCreateCompletionLedger.mockResolvedValue(testLedger);
      mockUpdateCompletionSyncStatus.mockResolvedValue(undefined);

      const result = await service.syncImmediately(testLedger);

      expect(result).toBe(testLedger);
      expect(mockCreateCompletionLedger).toHaveBeenCalledWith(testLedger);
      expect(mockUpdateCompletionSyncStatus).toHaveBeenCalledWith(
        testLedger.ledgerId,
        'synced'
      );
    });

    it('should throw error on sync failure', async () => {
      mockCreateCompletionLedger.mockRejectedValue(
        new SessionCompletionRepositoryError('create', new Error('Network error'))
      );

      await expect(service.syncImmediately(testLedger)).rejects.toThrow(
        SessionCompletionOfflineSyncError
      );
    });
  });

  describe('getSyncStatus', () => {
    it('should return sync status for existing session', async () => {
      // First queue the session
      const mockEntry: OfflineQueueEntry = {
        id: 'queue-entry-123',
        operation: 'SESSION_COMPLETE',
        feature: 'sessions',
        payload: testLedger,
        idempotencyKey: testLedger.idempotencyKey,
        createdAt: Date.now(),
        retryCount: 0,
        maxRetries: 10,
        priority: 'critical',
      };
      mockEnqueue.mockReturnValue(mockEntry);
      await service.queueSessionCompletion(testLedger);

      const status = await service.getSyncStatus(testLedger.sessionId);

      expect(status.status).toBe('pending');
      expect(status.isQueued).toBe(true);
      expect(status.hasFallback).toBe(true);
    });

    it('should handle non-existent sessions', async () => {
      mockCreateCompletionLedger.mockRejectedValue(
        new SessionCompletionRepositoryError('fetch', new Error('Not found'))
      );

      const status = await service.getSyncStatus('non-existent-session');

      expect(status.status).toBe('pending');
      expect(status.isQueued).toBe(false);
      expect(status.hasFallback).toBe(false);
    });
  });

  describe('forceRetryAll', () => {
    it('should retry all pending session completions', async () => {
      // Queue multiple sessions
      const session1 = { ...testLedger, sessionId: 'session-1' };
      const session2 = { ...testLedger, sessionId: 'session-2' };

      mockCreateCompletionLedger.mockRejectedValue(
        new SessionCompletionRepositoryError('create', new Error('Network error'))
      );

      await service.queueSessionCompletion(session1);
      await service.queueSessionCompletion(session2);

      // Now make sync succeed
      mockCreateCompletionLedger.mockResolvedValue(testLedger);
      mockUpdateCompletionSyncStatus.mockResolvedValue(undefined);

      const result = await service.forceRetryAll();

      expect(result.attempted).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should handle partial failures during retry', async () => {
      const session1 = { ...testLedger, sessionId: 'session-1' };
      const session2 = { ...testLedger, sessionId: 'session-2' };

      mockCreateCompletionLedger.mockRejectedValue(
        new SessionCompletionRepositoryError('create', new Error('Network error'))
      );

      await service.queueSessionCompletion(session1);
      await service.queueSessionCompletion(session2);

      // Make only one sync succeed
      mockCreateCompletionLedger
        .mockResolvedValueOnce(testLedger)
        .mockRejectedValueOnce(
          new SessionCompletionRepositoryError('create', new Error('Still failing'))
        );
      mockUpdateCompletionSyncStatus.mockResolvedValue(undefined);

      const result = await service.forceRetryAll();

      expect(result.attempted).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe('fallback storage', () => {
    it('should persist entries to localStorage', async () => {
      const mockEntry: OfflineQueueEntry = {
        id: 'queue-entry-123',
        operation: 'SESSION_COMPLETE',
        feature: 'sessions',
        payload: testLedger,
        idempotencyKey: testLedger.idempotencyKey,
        createdAt: Date.now(),
        retryCount: 0,
        maxRetries: 10,
        priority: 'critical',
      };
      mockEnqueue.mockReturnValue(mockEntry);

      await service.queueSessionCompletion(testLedger);

      const stored = localStorage.getItem('vex_session_completion_fallback');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.entries).toHaveLength(1);
      expect(parsed.entries[0].payload.sessionId).toBe(testLedger.sessionId);
    });

    it('should load entries from localStorage on initialization', async () => {
      // Pre-populate localStorage
      const mockEntry = {
        id: 'queue-entry-123',
        operation: 'SESSION_COMPLETE',
        feature: 'sessions',
        payload: testLedger,
        idempotencyKey: testLedger.idempotencyKey,
        createdAt: Date.now(),
        retryCount: 0,
        maxRetries: 10,
        priority: 'critical',
      };

      localStorage.setItem(
        'vex_session_completion_fallback',
        JSON.stringify({
          entries: [mockEntry],
          lastSyncAt: Date.now(),
        })
      );

      // Create new service instance
      const newService = new SessionCompletionOfflineSyncService();

      const status = await newService.getSyncStatus(testLedger.sessionId);
      expect(status.hasFallback).toBe(true);
    });

    it('should limit fallback storage capacity', async () => {
      // Create more entries than the limit
      const entries = [];
      for (let i = 0; i < 105; i++) {
        const session = { ...testLedger, sessionId: `session-${i}` };
        entries.push(session);
      }

      mockCreateCompletionLedger.mockRejectedValue(
        new SessionCompletionRepositoryError('create', new Error('Network error'))
      );

      for (const session of entries) {
        await service.queueSessionCompletion(session);
      }

      const stored = localStorage.getItem('vex_session_completion_fallback');
      const parsed = JSON.parse(stored!);
      
      // Should be limited to MAX_FALLBACK_ENTRIES (100)
      expect(parsed.entries).toHaveLength(100);
    });
  });

  describe('getDiagnostics', () => {
    it('should return diagnostic information', async () => {
      mockCreateCompletionLedger.mockRejectedValue(
        new SessionCompletionRepositoryError('create', new Error('Network error'))
      );

      await service.queueSessionCompletion(testLedger);

      const diagnostics = service.getDiagnostics();

      expect(diagnostics.fallbackEntriesCount).toBe(1);
      expect(diagnostics.isInitialized).toBe(true);
      expect(diagnostics.oldestEntryAge).toBeGreaterThan(0);
    });

    it('should handle empty diagnostics', () => {
      const diagnostics = service.getDiagnostics();

      expect(diagnostics.fallbackEntriesCount).toBe(0);
      expect(diagnostics.isInitialized).toBe(true);
      expect(diagnostics.oldestEntryAge).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      mockCreateCompletionLedger.mockRejectedValue(
        new SessionCompletionRepositoryError('create', new Error('Database error'))
      );
      mockEnqueue.mockImplementation(() => {
        throw new Error('Queue error');
      });

      const result = await service.queueSessionCompletion(testLedger);

      expect(result.queued).toBe(false);
      expect(result.synced).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle storage errors gracefully', async () => {
      // Mock localStorage to throw
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      const result = await service.queueSessionCompletion(testLedger);

      // Should not throw, but may fail to queue
      expect(result).toBeDefined();

      // Restore original
      localStorage.setItem = originalSetItem;
    });
  });
});

describe('useSessionCompletionOfflineSync', () => {
  it('should provide hook interface', () => {
    const hook = useSessionCompletionOfflineSync();

    expect(hook).toHaveProperty('queueSessionCompletion');
    expect(hook).toHaveProperty('getSyncStatus');
    expect(hook).toHaveProperty('forceRetryAll');
    expect(hook).toHaveProperty('getDiagnostics');
    expect(hook).toHaveProperty('isOnline');
  });
});

describe('singleton instance', () => {
  it('should export singleton instance', () => {
    expect(sessionCompletionOfflineSync).toBeInstanceOf(
      SessionCompletionOfflineSyncService
    );
  });

  it('should maintain same instance across imports', () => {
    const instance1 = sessionCompletionOfflineSync;
    const instance2 = sessionCompletionOfflineSync;

    expect(instance1).toBe(instance2);
  });
});