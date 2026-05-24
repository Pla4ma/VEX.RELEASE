/**
 * Performance-Based Recommendations
 *
 * Handles recommendations based on recent session performance.
 */

import type { SessionMode } from './schemas';

/**
 * Gets recommendation based on recent performance
 */
export function getPerformanceBasedRecommendation(
  recentLength: number,
  recentGrade: string
): { duration: number; mode: SessionMode; reason: string } {
  // If recent grade was low, recommend shorter recovery session
  if (recentGrade === 'D' || recentGrade === 'F') {
    return {
      duration: Math.max(15, recentLength - 10),
      mode: 'RECOVERY',
      reason: 'Recovery session: Shorter focus to rebuild confidence',
    };
  }

  // If recent grade was high, can increase duration
  if (recentGrade === 'A' || recentGrade === 'A+') {
    return {
      duration: Math.min(60, recentLength + 10),
      mode: 'FOCUS',
      reason: 'Build on success: Extend your focus time slightly',
    };
  }

  // Average performance: maintain similar duration
  return {
    duration: recentLength,
    mode: 'FOCUS',
    reason: 'Maintain your rhythm with a familiar session length',
  };
}
