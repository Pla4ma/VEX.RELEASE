/**
 * Boss Narrative System
 *
 * Phase 3.1 - Boss Battle System Overhaul
 * Narrative arcs, phase transitions, and visual themes for boss battles
 */

import { eventBus } from '../../events';

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Constants
// ============================================================================
// ============================================================================
// Functions
// ============================================================================
// Phase state management (in-memory for now)
const phaseStateMap = new Map<string, BossPhaseState>();
export * from "./BossNarrativeSystem.types";
export * from "./BossNarrativeSystem.part1";
export * from "./BossNarrativeSystem.part2";
