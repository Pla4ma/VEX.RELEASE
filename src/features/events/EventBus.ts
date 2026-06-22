// Re-export shim so tests that jest.mock('../../events/EventBus') from a
// features/<feature>/__tests__/ path can resolve. Canonical lives at
// src/events/EventBus.ts.
export * from '../../events/EventBus';
export { EventBus, eventBus } from '../../events/EventBus';
