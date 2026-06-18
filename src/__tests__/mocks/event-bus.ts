/**
 * Global EventBus mock for tests.
 * Intercepts all imports of events/EventBus regardless of relative path depth.
 */
const mockEventBus = {
  publish: jest.fn(),
  subscribe: jest.fn(() => jest.fn()),
  unsubscribe: jest.fn(),
  getInstance: jest.fn(),
  clear: jest.fn(),
  getHistory: jest.fn(() => []),
  clearHistory: jest.fn(),
  hasSubscribers: jest.fn(() => false),
  subscriberCount: jest.fn(() => 0),
  getActiveChannels: jest.fn(() => []),
};

export const eventBus = mockEventBus;
export class EventBus {
  static getInstance() {
    return mockEventBus;
  }
}

export default mockEventBus;
