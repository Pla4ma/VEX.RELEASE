/**
 * Squad Synergy Service - DEPRECATED
 *
 * This system is being sunset as part of the 10x Transformation.
 * Replaced by Squad Energy System in Phase 3.
 *
 * DO NOT USE FOR NEW FEATURES
 * This file is kept for backward compatibility during migration.
 *
 * Sunset Timeline:
 * - Month 1-2: Feature flag 'legacy_squad_synergy' = true (default)
 * - Month 3-4: Gradually set flag to false for 25% → 50% → 75% → 100%
 * - Month 5: Remove this file entirely
 *
 * Migration Path:
 * - Replace calls to addSynergyPoints() with energy system equivalents
 * - Replace SquadSynergy type with SquadEnergy type
 * - Update UI to show energy pool instead of synergy level
 */

import { getSupabaseClient } from '../../../config/supabase';
import { eventBus } from '../../../events';
import { featureFlags } from '../../../feature-flags/FeatureFlagEngine';
import { createDebugger } from '../../../utils/debug';
import * as repository from '../repository';
import { SYNERGY_POINTS_PER_LEVEL } from './constants';
import type { SynergyActivityType, SquadSynergy } from '../schemas';

const debug = createDebugger('squad-synergy-deprecated');

/**
 * @deprecated Use SquadEnergyService instead (Phase 3)
 * Initialize squad synergy - now a no-op during sunset
 */
export async function initializeSquadSynergy(squadId: string): Promise<void> {
  // Check if legacy system is still enabled
  if (!featureFlags.isEnabled('legacy_squad_synergy')) {
    debug.info('Squad synergy disabled. Use SquadEnergyService.');
    return;
  }

  // Legacy implementation
  const { error } = await getSupabaseClient()
    .from('squad_synergy')
    .insert({
      squad_id: squadId,
      level: 1,
      current_points: 0,
      points_to_next_level: 100,
      focus_multiplier_bonus: 0,
      daily_points: 0,
      daily_points_cap: 100,
      last_reset_at: Date.now(),
    });

  if (error) {
    debug.warn('Failed to initialize synergy: %s', error.message);
  }
}

/**
 * @deprecated Use addSquadEnergy() instead (Phase 3)
 * Add synergy points - now redirects to energy system during sunset
 */
export async function addSynergyPoints(
  squadId: string,
  userId: string,
  points: number,
  type: SynergyActivityType
): Promise<void> {
  // Check if legacy system is still enabled
  if (!featureFlags.isEnabled('legacy_squad_synergy')) {
    // Forward to new energy system when available
    debug.info('Synergy points redirected to energy system: %s %d', squadId, points);
    eventBus.publish('squad:activity', {
      squadId,
      userId,
      activityType: 'ENERGY_CONTRIBUTION',
      data: {
        amount: points,
        source: type,
        legacy: true,
      },
    });
    return;
  }

  // Legacy implementation
  const synergy = await repository.fetchSquadSynergy(squadId);
  if (!synergy) {return;}

  const newPoints = Math.min(synergy.dailyPoints + points, synergy.dailyPointsCap);
  const totalPoints = synergy.currentPoints + newPoints;
  let newLevel = synergy.level;
  let pointsToNext = synergy.pointsToNextLevel;

  if (totalPoints >= synergy.pointsToNextLevel && synergy.level < 10) {
    newLevel = Math.min(synergy.level + 1, 10);
    pointsToNext = SYNERGY_POINTS_PER_LEVEL[newLevel] || synergy.pointsToNextLevel * 1.5;

    // Emit legacy event
    eventBus.publish('squad:synergy_level_up', { squadId, newLevel, userId });

    // Also emit new energy event for migration
    eventBus.publish('squad:activity', {
      squadId,
      userId,
      activityType: 'ENERGY_LEVEL_UP',
      data: {
        newLevel,
        legacy: true,
      },
    });
  }

  const multiplierBonus = (newLevel - 1) * 0.05;
  await repository.updateSquadSynergy(squadId, {
    level: newLevel,
    currentPoints: totalPoints,
    pointsToNextLevel: pointsToNext,
    focusMultiplierBonus: multiplierBonus,
    dailyPoints: newPoints,
  });

  await repository.addSynergyActivity({
    squadId,
    userId,
    type,
    points,
    description: `Earned ${points} synergy points (LEGACY)`,
  });
}

/**
 * @deprecated Use getSquadEnergy() instead (Phase 3)
 * Get squad synergy - returns null during sunset
 */
export async function getSquadSynergy(squadId: string): Promise<SquadSynergy | null> {
  // Check if legacy system is still enabled
  if (!featureFlags.isEnabled('legacy_squad_synergy')) {
    return null;
  }

  return repository.fetchSquadSynergy(squadId);
}

/**
 * Migration helper: Convert old synergy data to energy format
 * @deprecated Remove after full sunset
 */
export function migrateSynergyToEnergy(synergy: SquadSynergy): {
  energyPool: number;
  maxEnergy: number;
  level: number;
  migrated: boolean;
} {
  return {
    energyPool: Math.floor(synergy.currentPoints * 10), // Convert points to energy
    maxEnergy: 1000,
    level: synergy.level,
    migrated: true,
  };
}
