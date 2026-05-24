/**
 * Challenge Analytics - Barrel Export
 *
 * @deprecated Import directly from submodules:
 * - events.ts: Event tracking functions
 * - metrics.ts: Metrics calculation functions
 * - health.ts: Health check functions
 */

// Re-export all analytics functions
export {
  trackChallengeView,
  trackChallengeAssigned,
  trackProgressUpdate,
  trackChallengeCompleted,
  trackRewardClaimed,
  trackChallengeReroll,
  trackChallengeExpired,
} from './events';

export {
  calculateChallengeMetrics,
  calculateDifficultyMetrics,
} from './metrics';

export {
  checkChallengesHealth,
} from './health';
