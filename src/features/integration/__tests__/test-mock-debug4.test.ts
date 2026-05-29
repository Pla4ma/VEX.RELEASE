jest.mock("../../events/EventBus", () => {
  return {
    eventBus: {
      publish: jest.fn(),
      subscribe: jest.fn(() => jest.fn()),
    },
  };
});

import { eventBus } from "../../events/EventBus";

test("direct import gets mock", () => {
  console.log("eventBus:", eventBus);
  expect(eventBus).toBeDefined();
  expect(eventBus.subscribe).toBeDefined();
});
