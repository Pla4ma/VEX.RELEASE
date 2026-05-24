/**
 * Session Recommendation Engine
 *
 * Core recommendation logic based on priority rules.
 */

import {
  type SessionRecommendation,
  type SessionRecommendationInput,
} from './schemas';
import { getMissionBasedRecommendation } from './mission-based-recommendations';
import { getTimeBasedRecommendation } from './time-based-recommendations';
import { getPerformanceBasedRecommendation } from './performance-based-recommendations';

/**
 * Gets recommendation based on priority rules
 */
export function getPriorityRecommendation(input: SessionRecommendationInput): Omit<SessionRecommendation, 'inputs'> {
  // Priority 1: First session
  if (input.isFirstSession) {
    return {
      duration: 10, // Short starter session
      mode: 'RECOVERY',
      reason: 'Start with a quick 10-minute session to build the habit',
      fallback: false,
      confidence: 0.95,
      isBlocked: false,
    };
  }

  // Priority 2: Streak critical
  if (input.streakUrgency === 'critical') {
    return {
      duration: 15, // Minimum to save streak
      mode: 'RECOVERY',
      reason: 'Critical: Complete this 15-minute session to save your streak',
      fallback: false,
      confidence: 0.98,
      isBlocked: false,
    };
  }

  // Priority 3: Recovery urgent
  if (input.recoveryStatus === 'urgent') {
    return {
      duration: 20,
      mode: 'RECOVERY',
      reason: 'Your focus needs recovery. Start with a gentle 20-minute session',
      fallback: false,
      confidence: 0.9,
      isBlocked: false,
    };
  }

  // Priority 4: Daily mission alignment
  if (input.dailyMissionType) {
    const missionRecommendation = getMissionBasedRecommendation(input.dailyMissionType);
    return {
      ...missionRecommendation,
      fallback: false,
      confidence: 0.85,
      isBlocked: false,
    };
  }

  // Priority 5: Time-based optimization
  const timeRecommendation = getTimeBasedRecommendation(input.timeOfDay);
  if (timeRecommendation) {
    return {
      ...timeRecommendation,
      fallback: false,
      confidence: 0.8,
      isBlocked: false,
    };
  }

  // Priority 6: Recent performance adjustment
  if (input.recentSessionLength && input.recentGrade) {
    const performanceRecommendation = getPerformanceBasedRecommendation(
      input.recentSessionLength,
      input.recentGrade
    );
    return {
      ...performanceRecommendation,
      fallback: false,
      confidence: 0.75,
      isBlocked: false,
    };
  }

  // Priority 7: Default recommendation
  return {
    duration: 25,
    mode: 'FOCUS',
    reason: 'A balanced 25-minute focus session to maintain momentum',
    fallback: true,
    confidence: 0.7,
    isBlocked: false,
  };
}
