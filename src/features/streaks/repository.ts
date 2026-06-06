export { RepositoryError } from '../../lib/repository/error-handling';

export {
  fetchStreak,
  createStreak,
  updateStreak,
  recordShieldEarned,
  recordShieldUsed,
  getAvailableShield,
} from './streak-queries';

export {
  fetchActiveRepairQuest,
  saveRepairQuest,
  updateRepairQuest,
  fetchExpiredRepairQuests,
  fetchUsersWithActiveStreaks,
} from './repair-quest-queries';
