import { eventBus } from '../../../events/EventBus';
import { initializeAnalyticsEventBridge } from '../event-bus-bridge';
import { applyAnalyticsPreference } from '../../../features/settings/analytics-preference';

jest.mock('../../../features/settings/analytics-preference', () => ({
  applyAnalyticsPreference: jest.fn(),
}));

jest.mock('../analytics-service', () => ({
  analyticsService: { initialize: jest.fn(), setEnabled: jest.fn() },
  capture: jest.fn(),
  screen: jest.fn(),
}));

describe('analytics consent bridge', () => {
  let cleanup: (() => void) | null = null;

  afterEach(() => {
    cleanup?.();
    cleanup = null;
    jest.clearAllMocks();
  });

  it('forwards persisted opt-in to the analytics preference handler', () => {
    cleanup = initializeAnalyticsEventBridge();
    eventBus.publish('settings:change', {
      key: 'privacy.analyticsOptOut',
      value: false,
    });

    expect(applyAnalyticsPreference).toHaveBeenCalledWith(true);
  });

  it('forwards persisted opt-out to the analytics preference handler', () => {
    cleanup = initializeAnalyticsEventBridge();
    eventBus.publish('settings:change', {
      key: 'privacy.analyticsOptOut',
      value: true,
    });

    expect(applyAnalyticsPreference).toHaveBeenCalledWith(false);
  });
});
