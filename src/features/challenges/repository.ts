// Re-export all repository functions to maintain `import * as repository` compatibility
export { RepositoryError } from './repository-helpers';
export {
  fetchChallengeById,
  fetchActiveChallenges,
  fetchChallengesByType,
  fetchChallengeTemplates,
} from './repository-challenges';
export {
  fetchUserChallenge,
  fetchUserChallenges,
  fetchUserActiveChallenges,
  fetchActiveChallengeDetails,
  fetchCompletedChallengeDetails,
  createUserChallenge,
  updateUserChallenge,
  addChallengeProgress,
} from './repository-user';
export {
  recordReroll,
  getRerollCountToday,
  getFreeRerollCountToday,
  expireOldChallenges,
  cleanupRerollHistory,
} from './repository-reroll';
