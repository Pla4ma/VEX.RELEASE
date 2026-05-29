const mockEventBus = {
  publish: jest.fn(),
  subscribe: jest.fn(() => jest.fn()),
};

jest.mock("../../../events/EventBus", () => ({ eventBus: mockEventBus }));
jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({ debug: jest.fn(), error: jest.fn(), warn: jest.fn(), info: jest.fn() }),
}));
jest.mock("../../rewards/service", () => ({ createReward: jest.fn() }));

import { initializeProgressionRewardsIntegration } from "../progression-rewards";

test("eventBus mock is applied", () => {
  const unsub = initializeProgressionRewardsIntegration();
  expect(mockEventBus.subscribe).toHaveBeenCalledWith("progression:level_up", expect.any(Function));
  unsub();
});
