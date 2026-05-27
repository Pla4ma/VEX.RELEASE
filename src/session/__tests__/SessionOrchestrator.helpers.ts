import { SessionOrchestrator } from "../SessionOrchestrator";
import type { SessionConfig } from "../types";

export const TEST_USER_ID = "test-user-123";

export const mockConfig: SessionConfig = {
  duration: 60,
  breakDuration: 10,
  longBreakDuration: 30,
  intervals: 1,
  longBreakInterval: 4,
  soundEnabled: false,
  vibrationEnabled: false,
  dndEnabled: false,
  strictMode: false,
  autoStartBreaks: false,
  autoStartNextInterval: false,
  tags: ["test"],
};

jest.mock("react-native-mmkv", () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
  })),
}));

export function createOrchestrator(
  overrides?: Record<string, boolean>,
): SessionOrchestrator {
  const orchestrator = new SessionOrchestrator({
    enableAntiCheat: false,
    enableAutoRecovery: true,
    ...overrides,
  });
  orchestrator.setUserId(TEST_USER_ID);
  return orchestrator;
}
