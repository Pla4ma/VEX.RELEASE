import { SessionService } from "../SessionService";
import { getSessionOrchestrator } from "../SessionOrchestrator";
import type { SessionConfig, SessionState } from "../types";

export { SessionService, getSessionOrchestrator };
export type { SessionConfig, SessionState };

export function setupMocks(): void {
  jest.mock("../SessionOrchestrator");
  jest.mock("../repository/SessionRepository");
  jest.mock("../SessionEventEmitter");
  jest.mock("../integration/RewardAdapter");
  jest.mock("../presets");
  jest.mock("../integration/SessionRewardIntegration");
}

setupMocks();

export function createService(): SessionService {
  return new SessionService({
    enableAnalytics: false,
    enableNotifications: false,
  });
}
