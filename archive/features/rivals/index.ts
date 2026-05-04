/**
 * Rivals Feature - Public API
 */

// Schemas & Types
export {
  RivalMatchSchema,
} from './loop-service';

export type {
  RivalMatch,
  RivalMatchStatus,
  PotentialRival,
} from './loop-service';

// Phase 9 - Rival Loop
export {
  calculateSimilarityScore,
  createRivalMatch,
  discoverPotentialRivals,
  endRivalMatch,
  getRivalLeaderboard,
  getRivalStatusMessage,
  shouldSuggestNewRival,
  updateRivalScores,
} from './loop-service';
