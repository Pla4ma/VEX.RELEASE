const mockEventBus = {
  publish: jest.fn(),
  subscribe: jest.fn(() => jest.fn()),
};

// Try mocking at different path levels
jest.mock("../../events/EventBus", () => ({ eventBus: mockEventBus }));

import { eventBus } from "../../events/EventBus";

test("eventBus mock is applied", () => {
  expect(eventBus).toBe(mockEventBus);
  expect(eventBus.subscribe).toBeDefined();
});
