/**
 * Session Modes V2 - Consolidated Mode System
 *
 * Phase 1 Core Loop Revolution
 * Transforms 5 confusing modes into 3 meaningful choices
 *
 * Modes:
 * - FLOW: Standard productivity (balanced difficulty, standard rewards)
 * - CHALLENGE: Test limits (no pauses, harder bosses, 2x rewards)
 * - RECOVERY: After failure (easier targets, reduced penalties, comeback bonus)
 *
 * Dependencies:
 * - feature-flags (for gradual rollout)
 * - session/SessionOrchestrator (mode selection)
 * - features/boss (difficulty scaling)
 */

import { z } from 'zod';
import { featureFlags } from '../feature-flags/FeatureFlagEngine';

// ============================================================================
// New Consolidated Mode Enum
// ============================================================================
// ============================================================================
// Mode Configuration
// ============================================================================
// ============================================================================
// Mode Configurations
// ============================================================================
// ============================================================================
// Helper Functions
// ============================================================================
// ============================================================================
// Backward Compatibility Helpers
// ============================================================================
export * from "./modes-v2.types";
export * from "./modes-v2.part1";
export * from "./modes-v2.part2";
