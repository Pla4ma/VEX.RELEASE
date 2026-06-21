import { getNetInfoAdapter } from '../network/NetInfoAdapter';
import { getQueueLength, startAutoProcessing } from '../lib/offline/queue';
import { createDebugger } from '../utils/debug';
import {
  analyticsService,
  capture,
} from '../shared/analytics/analytics-service';
import { initializeAnalyticsEventBridge } from '../shared/analytics/event-bus-bridge';
import { ProductAnalyticsEvents } from '../shared/analytics/product-events';
import { setupGlobalErrorHandler, setupRejectionHandler } from '../errors/globalErrorHandlers';
import { initializeSessionCompletionOrchestrator } from '../features/session-completion';
import { getMmkvEncryptionKey } from '../persistence/mmkv-key';

let bootstrapped = false;
let sessionRuntimeInitialized = false;
const debug = createDebugger('app:bootstrap');

function deferBootCall(call: () => void): void {
  setTimeout(call, 0);
}

function initializeCoreSystems(): void {
  setupGlobalErrorHandler();
  setupRejectionHandler();
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

export const bootstrapApp = async (): Promise<void> => {
  if (bootstrapped) {
    return;
  }

  bootstrapped = true;
  await getMmkvEncryptionKey();
  initializeCoreSystems();
  initializeSessionCompletionOrchestrator();
  deferBootCall(initializeSessionRuntime);
};

export const bootstrapDevelopment = (): void => {
  bootstrapApp();
};
