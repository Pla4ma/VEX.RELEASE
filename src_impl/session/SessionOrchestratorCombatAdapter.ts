/**
 * Session Orchestrator Combat Adapter
 *
 * Phase 1: Core Loop Revolution
 * Integrates real-time boss combat into the session flow.
 *
 * This adapter bridges the SessionOrchestrator with the RealTimeBossService,
 * enabling damage calculation every 3-5 seconds based on live purity scores.
 *
 * Dependencies:
 * - session/SessionOrchestrator (parent)
 * - features/boss-realtime/service (combat logic)
 * - feature-flags (gradual rollout)
 */

import { RealTimeBossService, createBossEncounter } from '../features/boss-realtime/service';
import type { RealTimeBossEncounter, CombatEvent } from '../features/boss-realtime/types';
import { featureFlags } from '../feature-flags/FeatureFlagEngine';
import { eventBus } from '../events';
import { getAnalyticsService } from '../analytics/AnalyticsService';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('combat-adapter');

interface CombatAdapterConfig {
  userId: string;
  sessionId: string;
  bossId: string;
  bossName: string;
  bossAvatar: string;
  sessionDurationMinutes: number;
  userLevel: number;
  tickIntervalMs: number;
}

interface CombatTickResult {
  damageDealt: number;
  bossDefeated: boolean;
  combatStateChanged: boolean;
  newCombatState?: string;
  event?: CombatEvent;
}

export * from "./SessionOrchestratorCombatAdapter.types";
export * from "./SessionOrchestratorCombatAdapter.types";
export * from "./SessionOrchestratorCombatAdapter.part1";
export * from "./SessionOrchestratorCombatAdapter.part2";
