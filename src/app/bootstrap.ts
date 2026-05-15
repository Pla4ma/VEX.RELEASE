import { getNetInfoAdapter } from '../network';
import { getQueueLength, startAutoProcessing } from '../lib/offline/queue';
import { createDebugger } from '../utils/debug';
import {
  analyticsService,
  capture,
  initializeAnalyticsEventBridge,
  ProductAnalyticsEvents,
} from '../shared/analytics';

let bootstrapped = false;
const debug = createDebugger('app:bootstrap');

function initializeCoreSystems(): void {
  initializeAnalyticsEventBridge();
  analyticsService.initialize().then((enabled) => {
    if (enabled) {
      capture(ProductAnalyticsEvents.APP_OPENED, { source: 'bootstrap' });
    }
  });

  const netInfo = getNetInfoAdapter();
  netInfo.initialize();
  debug.info('Offline sync queue size at boot: %d', getQueueLength());
  startAutoProcessing();
}

export const bootstrapApp = (): void => {
  if (bootstrapped) {
    return;
  }

  bootstrapped = true;
  initializeCoreSystems();
};

export const bootstrapDevelopment = (): void => {
  bootstrapApp();
};
