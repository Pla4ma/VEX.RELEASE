import { revenueCatService } from '../shared/monetization/revenuecat-service';
import { resetSessionOrchestrator } from '../session/SessionOrchestrator';
import type { User } from '../types/models';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('store:auth');

let _integrationsInitializedForUserId: string | null = null;

export function resetServiceSingletonsForLogout(): void {
  _integrationsInitializedForUserId = null;
}

export function initializeServicesAfterAuth(user: User): void {
  try {
    revenueCatService.setUserId(user.id);
  } catch (error) {
    debug.error('[AuthStore] Failed to set RevenueCat user ID:', error);
  }
  integrationsInitializedForUserId = user.id;
}

export function deinitializeServicesAfterLogout(): void {
  try {
    revenueCatService.clearUserId();
  } catch (error) {
    debug.error('[AuthStore] Failed to clear RevenueCat user ID:', error);
  }
  try {
    resetSessionOrchestrator();
  } catch (error) {
    debug.error('[AuthStore] Failed to reset session orchestrator:', error);
  }
  _integrationsInitializedForUserId = null;
}
