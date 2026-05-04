/**
 * Simplified Progression System - Barrel Export
 *
 * Collapses 8+ progression tracks into 3 meaningful paths:
 * 1. LEVEL - Long-term character growth
 * 2. STREAK - Daily commitment tracking
 * 3. MISSION - Weekly rotating challenge with story context
 */

export type {
  SimplifiedProgression,
  Mission,
  MissionType,
  CompletedMission,
} from './types';
export {
  calculateSessionXp,
  getXpForLevel,
  generateWeeklyMission,
  STREAK_QUALIFYING_MINUTES,
} from './types';
