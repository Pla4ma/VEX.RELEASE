import { RealTimeBossService, createBossEncounter } from "../features/boss-realtime/service";
import type { RealTimeBossEncounter, CombatEvent } from "../features/boss-realtime/types";
import { featureFlags } from "../feature-flags/FeatureFlagEngine";
import { eventBus } from "../events";
import { getAnalyticsService } from "../analytics/AnalyticsService";
import { createDebugger } from "../utils/debug";


export function createCombatAdapter(config: CombatAdapterConfig): SessionCombatAdapter {
  return new SessionCombatAdapter(config);
}

export function shouldShowRealTimeCombat(): boolean {
  return SessionCombatAdapter.isEnabled();
}