import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ─── Event bus mock ────────────────────────────────────────────────────────
jest.mock('../../../events/EventBus', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

// ─── Sentry mock ───────────────────────────────────────────────────────────
jest.mock('@sentry/react-native', () => ({ addBreadcrumb: jest.fn() }));

// ─── Debug mock ────────────────────────────────────────────────────────────
jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

// ─── Repository mock (auto-mock) ───────────────────────────────────────────
jest.mock('../repository');

// ─── Liveops feature access mock ───────────────────────────────────────────
jest.mock('../../liveops-config/feature-access-store', () => ({
  getAvailabilityFor: jest.fn(() => ({
    canSubscribeToEvents: true,
    isEnabled: true,
  })),
}));

// ─── Imports (after mocks) ──────────────────────────────────────────────────
import * as repository from '../repository';
import {
  AchievementEventHandler,
} from '../EventHandler';
import {
  getAvailabilityFor,
} from '../../liveops-config/feature-access-store';
import { eventBus as eventBusFromEventBus } from '../../../events/EventBus';

// ─── Typed mock accessors ──────────────────────────────────────────────────
const mockedRepository = jest.mocked(repository);
const mockedEventBusFromEventBus = jest.mocked(eventBusFromEventBus);
const mockedGetAvailabilityFor = jest.mocked(getAvailabilityFor);

describe('AchievementEventHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAvailabilityFor.mockReturnValue({ canSubscribeToEvents: true, isEnabled: true } as any);
    // EventHandler.ts imports eventBus from events/EventBus, so use that mock
    mockedEventBusFromEventBus.subscribe.mockReturnValue(jest.fn());
  });

  it('subscribes to events on initialize', () => {
    const h = new AchievementEventHandler();
    h.initialize();
    expect(mockedEventBusFromEventBus.subscribe).toHaveBeenCalled();
    h.destroy();
  });

  it('does not double-initialize', () => {
    const h = new AchievementEventHandler();
    h.initialize();
    const count = mockedEventBusFromEventBus.subscribe.mock.calls.length;
    h.initialize();
    expect(mockedEventBusFromEventBus.subscribe.mock.calls.length).toBe(count);
    h.destroy();
  });

  it('unsubscribes all on destroy', () => {
    const unsubFn = jest.fn();
    mockedEventBusFromEventBus.subscribe.mockReturnValue(unsubFn);
    const h = new AchievementEventHandler();
    h.initialize();
    h.destroy();
    expect(unsubFn).toHaveBeenCalled();
  });

  it('skips initialization when feature not available', () => {
    mockedGetAvailabilityFor.mockReturnValue({ canSubscribeToEvents: false, isEnabled: false } as any);
    const h = new AchievementEventHandler();
    h.initialize();
    expect(mockedEventBusFromEventBus.subscribe).not.toHaveBeenCalled();
    h.destroy();
  });
});
