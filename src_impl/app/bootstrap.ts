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
let sessionRuntimeInitialized = false;
const debug = createDebugger('app:bootstrap');

function initializeCoreSystems(): void {
  initializeAnalyticsEventBridge();
  analyticsService.initialize().then((enabled) => {
    if (enabled) {
      capture(ProductAnalyticsEvents.APP_OPENED, { source: 'bootstrap' });
    }
  });
}

export const initializeSessionRuntime = (): void => {
  if (sessionRuntimeInitialized) {
    return;
  }

  sessionRuntimeInitialized = true;
  const netInfo = getNetInfoAdapter();
  netInfo.initialize();
  debug.info('Offline sync queue size at runtime init: %d', getQueueLength());
  startAutoProcessing();
};

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
