import { eventBus } from '../../events';
import { analyticsService, capture, screen } from './analytics-service';
import { ProductAnalyticsEvents } from './product-events';

let cleanupBridge: (() => void) | null = null;

export function initializeAnalyticsEventBridge(): () => void {
  if (cleanupBridge) {
    return cleanupBridge;
  }

  const unsubscribeTrack = eventBus.subscribe('analytics:track', (payload) => {
    capture(payload.event, payload.properties);
  });

  const unsubscribeScreen = eventBus.subscribe(
    'analytics:screen',
    (payload) => {
      screen(payload.name, payload.params);
    },
  );

  const unsubscribeSettings = eventBus.subscribe(
    'settings:change',
    (payload) => {
      if (
        payload.key === 'privacy.analyticsOptOut' &&
        typeof payload.value === 'boolean'
      ) {
        analyticsService.setEnabled(!payload.value);
        capture(ProductAnalyticsEvents.SETTINGS_CHANGED, {
          key: payload.key,
          enabled: !payload.value,
        });
      }
    },
  );

  cleanupBridge = () => {
    unsubscribeTrack();
    unsubscribeScreen();
    unsubscribeSettings();
    cleanupBridge = null;
  };

  return cleanupBridge;
}
