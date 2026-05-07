import { initializeSessionCompletionOrchestrator } from '../session/integration/SessionCompletionOrchestrator';
import { initializeSessionBossIntegration } from '../session/integration/SessionBossIntegration';
import { initializeStreakInsuranceIntegration } from '../integration/streak-insurance';
import { initializeWeeklyQuestIntegration } from '../features/weekly-quests/integration';
import { getNetInfoAdapter } from '../network';
import { getQueueLength, startAutoProcessing } from '../lib/offline/queue';
import { createDebugger } from '../utils/debug';
import { configureProgressionService } from '../features/progression/service-enhanced';
import {
  analyticsService,
  capture,
  initializeAnalyticsEventBridge,
  ProductAnalyticsEvents,
} from '../shared/analytics';

let bootstrapped = false;
const debug = createDebugger('app:bootstrap');

export const bootstrapApp = (): void => {
  if (bootstrapped) {
    return;
  }

  bootstrapped = true;
  initializeAnalyticsEventBridge();
  void analyticsService.initialize().then((enabled) => {
    if (enabled) {
      capture(ProductAnalyticsEvents.APP_OPENED, { source: 'bootstrap' });
    }
  });
  configureProgressionService({
    maxLevel: 100,
    prestigeEnabled: true,
    enableOfflineQueue: true,
  });
  initializeSessionCompletionOrchestrator();
  initializeSessionBossIntegration();
  initializeStreakInsuranceIntegration();
  initializeWeeklyQuestIntegration();
  const netInfo = getNetInfoAdapter();
  void netInfo.initialize();
  debug.info('Offline sync queue size at boot: %d', getQueueLength());
  startAutoProcessing();
};

export const bootstrapDevelopment = (): void => {
  bootstrapApp();
};