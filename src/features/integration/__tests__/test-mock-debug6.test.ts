jest.mock("../../../events/EventBus", () => {
  return {
    eventBus: {
      publish: jest.fn(),
      subscribe: jest.fn(() => jest.fn()),
    },
  };
});
jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  }),
}));
jest.mock("../../rewards/service", () => ({ createReward: jest.fn().mockResolvedValue({ id: "reward-1" }) }));

import { initializeProgressionRewardsIntegration } from "../progression-rewards";

const mockEventBus = jest.requireMock("../../../events/EventBus") as {
  eventBus: { publish: jest.Mock; subscribe: jest.Mock };
};

test("eventBus mock is applied to progression-rewards", () => {
  const unsub = initializeProgressionRewardsIntegration();
  expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith("progression:level_up", expect.any(Function));
  expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith("progression:xp_added", expect.any(Function));
  unsub();
});
