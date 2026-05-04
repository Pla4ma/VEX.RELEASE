/**
 * Squads Service Synergy - DEPRECATED
 *
 * This module re-exports the deprecated synergy system.
 * All functionality has been moved to synergy-DEPRECATED.ts
 *
 * @deprecated Use SquadEnergyService (Phase 3) instead
 */

export {
  initializeSquadSynergy,
  addSynergyPoints,
  getSquadSynergy,
  migrateSynergyToEnergy,
} from './synergy-DEPRECATED';

// Re-export types for backward compatibility
export type { SquadSynergy } from '../schemas';
