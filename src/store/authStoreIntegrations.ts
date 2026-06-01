import { revenueCatService } from '../shared/monetization/revenuecat-service';
import type { User } from '../types/models';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('store:auth');

let integrationsInitializedForUserId: string | null = null;

export function resetServiceSingletonsForLogout(): void {
  integrationsInitializedForUserId = null;
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
  integrationsInitializedForUserId = null;
}
