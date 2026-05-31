import {
  jest,
} from '@jest/globals';
import { sessionCompletionOfflineSync } from '../offline-sync-service';
import { buildCompletionLedger } from '../ledger-service';
import { CompletionLedgerSchema, type CompletionLedger } from '../schemas';
import { useNetInfo } from '../../../network/useNetInfo';
import { getNetInfoAdapter } from '../../../network/NetInfoAdapter';

export const onlineState = {
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
  details: null,
};
export const mockGetCurrentState = jest.fn(() => onlineState);

jest.mock('../offline-sync-service', () => ({
  sessionCompletionOfflineSync: {
    queueSessionCompletion: jest.fn(),
    getSyncStatus: jest.fn(),
    forceRetryAll: jest.fn(),
    getDiagnostics: jest.fn(),
  },
}));
jest.mock('../ledger-service', () => ({ buildCompletionLedger: jest.fn() }));
jest.mock('../../../network/useNetInfo', () => ({ useNetInfo: jest.fn() }));
jest.mock('../../../network/NetInfoAdapter', () => ({
  getNetInfoAdapter: jest.fn(() => ({
    getCurrentState: mockGetCurrentState,
    subscribe: jest.fn(() => jest.fn()),
  })),
}));

export const mockSessionCompletionOfflineSync = jest.mocked(
  sessionCompletionOfflineSync,
);
export const mockBuildCompletionLedger = jest.mocked(buildCompletionLedger);
export const mockUseNetInfo = jest.mocked(useNetInfo);
export const mockGetNetInfoAdapter = jest.mocked(getNetInfoAdapter);

export const flushPromises = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

export const makeLedger = (): CompletionLedger =>
  CompletionLedgerSchema.parse({
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    ledgerId: '550e8400-e29b-41d4-a716-446655440002',
    idempotencyKey: 'idempotency-key-123',
    completedAt: Date.now(),
    createdAt: Date.now(),
    offlineSyncStatus: 'pending_sync',
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
    streakResult: { action: 'maintained', newDays: 5, previousDays: 5 },
    companionReactionId: 'reaction-123',
    rewardIds: ['reward-1', 'reward-2'],
    dailyMissionResult: {
      missionId: 'mission-123',
      progressDelta: 100,
      status: 'completed',
    },
  });
