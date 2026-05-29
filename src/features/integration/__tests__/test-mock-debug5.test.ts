// Use manual mock approach
let mockPublish: jest.Mock;
let mockSubscribe: jest.Mock;

jest.mock("../../../events/EventBus", () => {
  mockPublish = jest.fn();
  mockSubscribe = jest.fn(() => jest.fn());
  return {
    eventBus: {
      publish: mockPublish,
      subscribe: mockSubscribe,
    },
  };
});

import { eventBus } from "../../../events/EventBus";

test("direct import gets mock", () => {
  expect(eventBus).toBeDefined();
  expect(eventBus.subscribe).toBeDefined();
  expect(eventBus.publish).toBeDefined();
});
