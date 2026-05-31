/**
 * Basic Challenges Service
 *
 * Simplified challenges system for PHASE 8 launch scope.
 * Focuses on daily and weekly challenges only.
 *
 * Barrel re-export — implementation lives in basic-challenges-operations.ts
 */

export {
  getOrCreateBasicDailyChallenge,
  getOrCreateBasicWeeklyChallenge,
  getBasicChallengesStatus,
  updateBasicChallengeProgressFromSession,
  claimBasicChallengeReward,
} from './basic-challenges-operations';

export {
  CONFIG,
  getRequiredCount,
  type BasicChallengeConfig,
  type BasicChallengesStatus,
  type BasicChallengeProgressResult,
  type BasicChallengeClaimResult,
} from './basic-challenge-types';
