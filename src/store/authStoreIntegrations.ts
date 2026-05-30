import { revenueCatService } from "../shared/monetization/revenuecat-service";
import { progressionService } from "../services/progressionService";
import type { User } from "../types/models";
import { createDebugger } from "../utils/debug";

const debug = createDebugger("store:auth");

let integrationsInitializedForUserId: string | null = null;
let cleanupIntegrations: (() => void) | null = null;

export function resetServiceSingletonsForLogout(): void {
  try {
    progressionService.reset();
  } catch (error) {
    debug.error("Failed to reset progression service on logout", error);
  }
}

export function initializeServicesAfterAuth(user: User): void {
  try {
    revenueCatService.setUserId(user.id);
  } catch (error) {
    debug.error("[AuthStore] Failed to set RevenueCat user ID:", error);
  }
  if (integrationsInitializedForUserId !== user.id) {
    progressionService.setUserId(user.id);
    integrationsInitializedForUserId = user.id;
  }
}

export function deinitializeServicesAfterLogout(): void {
  try {
    revenueCatService.clearUserId();
  } catch (error) {
    debug.error("[AuthStore] Failed to clear RevenueCat user ID:", error);
  }
  if (cleanupIntegrations) {
    cleanupIntegrations();
    cleanupIntegrations = null;
  }
  integrationsInitializedForUserId = null;
}
