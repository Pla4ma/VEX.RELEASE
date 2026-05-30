import {
  SessionPersistence,
  PersistedSessionState,
  SessionPersistenceError,
  isSessionStale,
  canResumeSession,
} from "../utils/persistence";

// Use var so declaration is hoisted; assignment happens inside factory
var mockMMKVInstance: any;

jest.mock("react-native-mmkv", () => {
  mockMMKVInstance = {
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(),
    getAllKeys: jest.fn(),
  };
  return {
    MMKV: jest.fn().mockImplementation(() => mockMMKVInstance),
  };
});
jest.mock("../../events", () => ({ eventBus: { publish: jest.fn() } }));
jest.mock("../../utils/debug", () => ({
  createDebugger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));
jest.mock("../../utils/silent-failure", () => ({
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
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  userId: "user-123",
  status: "ACTIVE",
  phase: "FOCUS",
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
  configId: "550e8400-e29b-41d4-a716-446655440001",
  deviceId: "device-test",
  deviceName: "Test Device",
  version: 1,
};

export const baseState: PersistedSessionState = {
  sessionId: "test-123",
  userId: "user-123",
  status: "ACTIVE",
  phase: "FOCUS",
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
  configId: "550e8400-e29b-41d4-a716-446655440001",
  deviceId: "device-test",
  version: 1,
};
