/**
 * Progression Repository
 * Barrel re-export from split modules.
 */

export { RepositoryError, fetchProgression, createProgression, updateProgression } from './progression-queries';

export { fetchXpHistory, recordXpEntry, fetchXpForPeriod } from './xp-history';

export { recordLevelUp, fetchLevelUpHistory, type LevelUpRecordRow } from './level-history';
