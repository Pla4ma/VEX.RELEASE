import { getNetInfoAdapter } from '../network/NetInfoAdapter';
import { getQueueLength, startAutoProcessing } from '../lib/offline/queue';
import { createDebugger } from '../utils/debug';
import { capture } from '../shared/analytics/analytics-service';
import { initializeAnalyticsEventBridge } from '../shared/analytics/event-bus-bridge';
import { initializeAnalyticsPreference } from '../features/settings/analytics-preference';
import { ProductAnalyticsEvents } from '../shared/analytics/product-events';
import { setupGlobalErrorHandler, setupRejectionHandler } from '../errors/globalErrorHandlers';
import { initializeSessionCompletionOrchestrator } from '../features/session-completion/completion-orchestrator-init';
import { getMmkvEncryptionKey } from '../persistence/mmkv-key';

let bootstrapPromise: Promise<void> | null = null;
let sessionRuntimeInitialized = false;
const debug = createDebugger('app:bootstrap');

function deferBootCall(call: () => void): void {
  setTimeout(() => {
    try {
      call();
    } catch (error) {
      debug.error('Deferred bootstrap call failed', error);
    }
  }, 0);
}

function initializeCoreSystems(): void {
  setupGlobalErrorHandler();
  setupRejectionHandler();
  initializeAnalyticsEventBridge();
  initializeAnalyticsPreference()
    .then((enabled) => {
      if (enabled) {
        capture(ProductAnalyticsEvents.APP_OPENED, { source: 'bootstrap' });
      }
    })
    .catch((error) => debug.error('Analytics initialization failed', error));
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

export const bootstrapApp = (): Promise<void> => {
  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async (): Promise<void> => {
    try {
      await getMmkvEncryptionKey();
    } catch (error) {
      debug.error('MMKV encryption key initialization failed', error);
    }
    try {
      initializeCoreSystems();
    } catch (error) {
      debug.error('Core system initialization failed', error);
    }
    try {
      initializeSessionCompletionOrchestrator();
    } catch (error) {
      debug.error('Session completion orchestrator initialization failed', error);
    }
    deferBootCall(initializeSessionRuntime);
  })();

  return bootstrapPromise;
};

export const bootstrapDevelopment = (): void => {
  void bootstrapApp().catch((error: unknown) => {
    debug.error('Development bootstrap failed', error);
  });
};
