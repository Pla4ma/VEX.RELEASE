const mockEventBus = {
  publish: jest.fn(),
  subscribe: jest.fn(() => jest.fn()),
};

jest.mock("../../../events/EventBus", () => ({ eventBus: mockEventBus }));

import { eventBus } from "../../../events/EventBus";

test("direct import gets mock", () => {
  expect(eventBus).toBe(mockEventBus);
});

// Now try importing a module that imports EventBus
import { initializeProgressionRewardsIntegration } from "../progression-rewards";

test("indirect import via progression-rewards gets mock", () => {
  const unsub = initializeProgressionRewardsIntegration();
  expect(mockEventBus.subscribe).toHaveBeenCalled();
  unsub();
});
