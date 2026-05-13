/**
 * Streak Creature System
 *
 * Phase 5B: Retention - Replace streak numbers with evolving creatures
 *
 * Transforms abstract streak counters into engaging creature companions
 * that evolve based on user consistency. Features include:
 *
 * - Creature evolution stages (Egg → Baby → Teen → Adult → Epic)
 * - Personality traits based on session patterns
 * - Interactive care and feeding mechanics
 * - Visual progression and achievements
 * - Creature abilities that help with focus
 *
 * Dependencies:
 * - feature-flags (gradual rollout)
 * - events (eventBus for creature updates)
 * - streaks (integration with existing streak system)
 * - session (session data for creature growth)
 */

import { z } from 'zod';
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';

// ============================================================================
// Streak Creature Constants
// ============================================================================
// ============================================================================
// Types & Schemas
// ============================================================================
// ============================================================================
// Streak Creature Service
// ============================================================================
// ============================================================================
// Factory & Exports
// ============================================================================
// Singleton instance
let streakCreatureService: StreakCreatureService | null = null;
export * from "./StreakCreatureSystem.types";
export * from "./StreakCreatureSystem.part1";
export * from "./StreakCreatureSystem.part2";
export * from "./StreakCreatureSystem.part3";
