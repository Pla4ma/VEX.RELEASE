/**
 * Adaptive Difficulty System
 *
 * Phase 6B: AI Coach - Dynamic boss difficulty based on user performance
 *
 * Creates personalized boss encounters that adapt to user skill level,
 * ensuring optimal challenge without frustration. Features include:
 *
 * - Real-time difficulty adjustment during boss fights
 * - Performance-based scaling (purity, completion rate, streak)
 * - Squad-aware difficulty balancing
 * - Predictive difficulty recommendations
 * - Smooth difficulty transitions
 *
 * Dependencies:
 * - feature-flags (gradual rollout)
 * - events (eventBus for difficulty changes)
 * - boss (existing boss system)
 * - session (performance data)
 * - ai-coach (predictive analytics)
 */

import { z } from 'zod';
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';

// ============================================================================
// Adaptive Difficulty Constants
// ============================================================================
// ============================================================================
// Types & Schemas
// ============================================================================
// ============================================================================
// Adaptive Difficulty Service
// ============================================================================
// ============================================================================
// Factory & Exports
// ============================================================================
// Singleton instance
let adaptiveDifficultyService: AdaptiveDifficultyService | null = null;
export * from "./AdaptiveDifficulty.types";
export * from "./AdaptiveDifficulty.part1";
export * from "./AdaptiveDifficulty.part2";
