/**
 * Unified Mastery System — barrel re-export.
 *
 * Split from the original monolith into focused modules:
 *  - mastery-types.ts    — types, schemas, rank config
 *  - mastery-unlocks.ts  — unlock definitions + checker
 *  - xp-calculators.ts   — pure XP calculation functions
 *  - mastery-service.ts  — orchestration, state management, migration
 */

export {
  MasteryTrackSchema,
  type MasteryTrack,
  MASTERY_TRACKS,
  type MasteryTrackState,
  type UnifiedMasteryState,
  type MasteryRank,
  RANK_CONFIG,
  calculateXpForLevel,
  type SessionMasteryXp,
  type SessionMasteryResult,
  type ApplyXpResult,
  calculateMasteryRank,
} from './mastery-types';

export {
  type MasteryUnlock,
  MASTERY_UNLOCKS,
  checkUnlocks,
} from './mastery-unlocks';

export {
  calculateDurationMasteryXp,
  calculatePurityMasteryXp,
  calculateConsistencyMasteryXp,
  calculateComebackMasteryXp,
  calculateBossMasteryXp,
} from './xp-calculators';

export {
  calculateMasteryXpFromSession,
  applyMasteryXp,
  createInitialMasteryState,
  migrateFromLegacyProgression,
} from './mastery-service';
