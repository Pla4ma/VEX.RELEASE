import { getNetInfoAdapter } from '../network';
import { getQueueLength, startAutoProcessing } from '../lib/offline/queue';
import { createDebugger } from '../utils/debug';
import {
  analyticsService,
  capture,
  initializeAnalyticsEventBridge,
  ProductAnalyticsEvents,
} from '../shared/analytics';
import { initializeSessionCompletionOrchestrator } from '../features/session-completion/completion-orchestrator';
import { initializeEmotionRetention } from '../features/emotion-retention';
import { setupGlobalErrorHandler, setupRejectionHandler } from '../errors';
import { IS_DEVELOPMENT } from '../constants/app';

let bootstrapped = false;
let sessionRuntimeInitialized = false;
const debug = createDebugger('app:bootstrap');

function initializeCoreSystems(): void {
  if (!IS_DEVELOPMENT) {
    setupGlobalErrorHandler();
    setupRejectionHandler();
  }
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
  initializeSessionCompletionOrchestrator();
  initializeEmotionRetention();
  initializeSessionRuntime();
};

export const bootstrapDevelopment = (): void => {
  bootstrapApp();
};
