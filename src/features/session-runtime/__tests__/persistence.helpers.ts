import {
  SessionPersistence,
  PersistedSessionState,
  SessionPersistenceError,
  isSessionStale,
  canResumeSession,
} from '../utils/persistence';

// Shared mock instance — defined outside factory so exports resolve correctly
const mockMMKVInstance: Record<string, jest.Mock> = {
  set: jest.fn(),
  getString: jest.fn(),
  getNumber: jest.fn(),
  delete: jest.fn(),
  contains: jest.fn(),
  getAllKeys: jest.fn(),
};

// Mock mmkv-runtime so createRuntimeMMKV returns our mock instance.
// In Jest env, the real module uses MemoryMMKV (bypassing react-native-mmkv),
// so we must mock at this level to control storage behavior in tests.
jest.mock('../../../persistence/mmkv-runtime', () => {
  const actual = jest.requireActual('../../../persistence/mmkv-runtime');
  return {
    ...actual,
    createRuntimeMMKV: jest.fn(() => mockMMKVInstance),
  };
});
jest.mock('../../../events/EventBus', () => ({ eventBus: { publish: jest.fn() } }));
jest.mock('../../../utils/debug', () => ({
  createDebugger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));
jest.mock('../../../utils/silent-failure', () => ({
  captureSilentFailure: jest.fn(),
}));

export {
  SessionPersistence,
  PersistedSessionState,
  SessionPersistenceError,
  isSessionStale,
  canResumeSession,
  mockMMKVInstance,
};

export const mockSession: PersistedSessionState = {
  sessionId: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'user-123',
  status: 'ACTIVE',
  phase: 'FOCUS',
  startedAt: Date.now() - 60000,
  lastUpdatedAt: Date.now(),
  elapsedTime: 60000,
  remainingTime: 3540000,
  pausedTime: 0,
  progress: 1.6,
  currentInterval: 1,
  totalIntervals: 1,
  interruptions: 0,
  pauses: 0,
  backgroundTime: 0,
  configId: '550e8400-e29b-41d4-a716-446655440001',
  deviceId: 'device-test',
  deviceName: 'Test Device',
  version: 1,
};

export const baseState: PersistedSessionState = {
  sessionId: 'test-123',
  userId: 'user-123',
  status: 'ACTIVE',
  phase: 'FOCUS',
  startedAt: Date.now() - 60000,
  lastUpdatedAt: Date.now(),
  elapsedTime: 60000,
  remainingTime: 3540000,
  pausedTime: 0,
  progress: 1.6,
  currentInterval: 1,
  totalIntervals: 1,
  interruptions: 0,
  pauses: 0,
  backgroundTime: 0,
  configId: '550e8400-e29b-41d4-a716-446655440001',
  deviceId: 'device-test',
  version: 1,
};
