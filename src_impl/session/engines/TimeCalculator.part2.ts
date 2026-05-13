import type { TimeBreakdown, TimeProgressMetrics } from "../types";


export const TimeCalculator = {
  calculateElapsedTime,
  calculateRemainingTime,
  calculateCompletionPercentage,
  calculateEffectiveTime,
  breakdownDuration,
  formatDuration,
  formatDurationLong,
  calculateProgressMetrics,
  shouldTriggerWarning,
  getTimeStatus,
  validateDuration,
  validateTimestamp,
  calculateCurrentInterval,
  constants: TIME_CONSTANTS,
};