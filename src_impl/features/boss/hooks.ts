/**
 * Boss Hooks
 * TanStack Query hooks for UI consumption
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import * as service from './service';
import * as repository from './repository';
import {
  CreateEncounterInputSchema,
  ApplyDamageInputSchema,
  CalculateDamageInputSchema,
  type CreateEncounterInput,
  type ApplyDamageInput,
  type CalculateDamageInput,
  type BossDamageResult,
} from './schemas';
import {
  getBountyStatus,
  placeBounty,
  BOUNTY_COST_COINS,
  type PlaceBountyInput,
  type BountyStatus,
} from './BossBountySystem';

// ============================================================================
// Query Keys
// ============================================================================
// ============================================================================
// Read Hooks
// ============================================================================
// ============================================================================
// Mutation Hooks
// ============================================================================
// ============================================================================
// Damage Calculator Hook
// ============================================================================
// ============================================================================
// Boss Check Hook
// ============================================================================
// ============================================================================
// Bounty Hooks — Phase 4
// ============================================================================
// Re-export bounty constants for convenience
export { BOUNTY_COST_COINS };

// ============================================================================
// Enhanced Hooks
// ============================================================================

export { useActiveBoss as useActiveBossEnhanced, type ActiveBossState, type DamageCalculation, type KillEstimate } from './hooks/useActiveBoss';
export * from "./hooks.part1";
