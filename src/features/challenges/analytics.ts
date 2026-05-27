/**
 * Challenges Analytics
 *
 * @deprecated This barrel file is maintained for backward compatibility.
 * Import directly from './analytics/events', './analytics/metrics', or './analytics/health' instead.
 */

// Re-export all analytics functions from modular structure
export {
  // Events
  trackChallengeView,
  trackChallengeAssigned,
  trackProgressUpdate,
  trackChallengeCompleted,
  trackRewardClaimed,
  trackChallengeReroll,
  trackChallengeExpired,
} from "./analytics/events";

export {
  // Metrics
  calculateChallengeMetrics,
  calculateDifficultyMetrics,
} from "./analytics/metrics";

export {
  // Health
  checkChallengesHealth,
} from "./analytics/health";
