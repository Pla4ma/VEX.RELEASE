// Re-export shim so tests that jest.mock('../../../events') can resolve.
// Canonical EventBus lives at src/events/EventBus.ts.
export { EventBus, eventBus } from '../../events/EventBus';
export type { EventChannels } from '../../events/EventBus';
