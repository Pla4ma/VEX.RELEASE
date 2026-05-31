/**
 * Session Recommendation Analytics
 *
 * Handles tracking and analytics for session recommendation events.
 */

import Sentry from '@sentry/react-native';
import { eventBus } from '../../events';
import type {
  SessionRecommendation,
  SessionRecommendationInput,
} from './types';

/**
 * Tracks when a session recommendation is generated
 */
export function trackRecommendationGenerated(
  recommendation: SessionRecommendation,
  input: SessionRecommendationInput,
): void {
  Sentry.addBreadcrumb({
    category: 'session-recommendation',
    message: `Recommendation generated: ${recommendation.mode} ${recommendation.duration}min`,
    data: {
      duration: recommendation.duration,
      mode: recommendation.mode,
      reason: recommendation.reason,
      confidence: recommendation.confidence,
      isFallback: recommendation.fallback,
      isBlocked: recommendation.isBlocked,
      inputs: {
        userGoal: input.userGoal,
        timeOfDay: input.timeOfDay,
        streakUrgency: input.streakUrgency,
        recoveryStatus: input.recoveryStatus,
        dailyMissionType: input.dailyMissionType,
        isFirstSession: input.isFirstSession,
      },
    },
    level: 'info',
  });

  eventBus.emit('session-recommendation:generated', {
    recommendationId: `${input.userId}-${Date.now()}`,
    duration: recommendation.duration,
    mode: recommendation.mode,
    reason: recommendation.reason,
    confidence: recommendation.confidence,
    isFallback: recommendation.fallback,
    inputs: input,
    timestamp: Date.now(),
  });
}

/**
 * Tracks when a user accepts a session recommendation
 */
export function trackRecommendationAccepted(
  recommendation: SessionRecommendation,
  input: SessionRecommendationInput,
): void {
  Sentry.addBreadcrumb({
    category: 'session-recommendation',
    message: `Recommendation accepted: ${recommendation.mode} ${recommendation.duration}min`,
    data: {
      duration: recommendation.duration,
      mode: recommendation.mode,
      confidence: recommendation.confidence,
      isFallback: recommendation.fallback,
    },
    level: 'info',
  });

  eventBus.emit('session-recommendation:accepted', {
    duration: recommendation.duration,
    mode: recommendation.mode,
    confidence: recommendation.confidence,
    isFallback: recommendation.fallback,
    inputs: input,
    timestamp: Date.now(),
  });
}

/**
 * Tracks when a user dismisses a session recommendation
 */
export function trackRecommendationDismissed(
  recommendation: SessionRecommendation,
  input: SessionRecommendationInput,
  reason?: string,
): void {
  Sentry.addBreadcrumb({
    category: 'session-recommendation',
    message: `Recommendation dismissed: ${recommendation.mode} ${recommendation.duration}min`,
    data: {
      duration: recommendation.duration,
      mode: recommendation.mode,
      confidence: recommendation.confidence,
      isFallback: recommendation.fallback,
      dismissReason: reason,
    },
    level: 'info',
  });

  eventBus.emit('session-recommendation:dismissed', {
    duration: recommendation.duration,
    mode: recommendation.mode,
    confidence: recommendation.confidence,
    isFallback: recommendation.fallback,
    inputs: input,
    dismissReason: reason,
    timestamp: Date.now(),
  });
}

/**
 * Tracks when a session recommendation is blocked
 */
export function trackRecommendationBlocked(
  recommendation: SessionRecommendation,
  input: SessionRecommendationInput,
): void {
  Sentry.addBreadcrumb({
    category: 'session-recommendation',
    message: `Recommendation blocked: ${recommendation.blockReason}`,
    data: {
      blockReason: recommendation.blockReason,
      inputs: {
        hasActiveSession: input.hasActiveSession,
        isFirstSession: input.isFirstSession,
      },
    },
    level: 'warning',
  });

  eventBus.emit('session-recommendation:blocked', {
    blockReason: recommendation.blockReason,
    inputs: input,
    timestamp: Date.now(),
  });
}

/**
 * Tracks recommendation performance (session completion vs recommendation)
 */
export function trackRecommendationPerformance(
  recommendation: SessionRecommendation,
  actualDuration: number,
  actualMode: string,
  sessionGrade: string,
  sessionCompleted: boolean,
): void {
  Sentry.addBreadcrumb({
    category: 'session-recommendation',
    message: `Recommendation performance: ${sessionCompleted ? 'completed' : 'incomplete'}`,
    data: {
      recommendedDuration: recommendation.duration,
      actualDuration,
      recommendedMode: recommendation.mode,
      actualMode,
      sessionGrade,
      sessionCompleted,
      durationAccuracy:
        Math.abs(recommendation.duration - actualDuration) /
        recommendation.duration,
      modeMatch: recommendation.mode === actualMode,
    },
    level: 'info',
  });

  eventBus.emit('session-recommendation:performance', {
    recommendedDuration: recommendation.duration,
    actualDuration,
    recommendedMode: recommendation.mode,
    actualMode,
    sessionGrade,
    sessionCompleted,
    durationAccuracy:
      Math.abs(recommendation.duration - actualDuration) /
      recommendation.duration,
    modeMatch: recommendation.mode === actualMode,
    timestamp: Date.now(),
  });
}
