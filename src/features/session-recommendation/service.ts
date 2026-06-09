/**
 * Session Recommendation Service
 *
 * Main service for generating personalized session recommendations.
 */

import {
  SessionRecommendationSchema,
  SessionRecommendationInputSchema,
  type SessionRecommendation,
  type SessionRecommendationInput,
} from './schemas';
import { getPriorityRecommendation } from './recommendation-engine';

// Re-export types for consumers
export type { SessionRecommendation, SessionRecommendationInput };

/**
 * Generates a session recommendation based on user input
 */
export function generateSessionRecommendation(
  input: SessionRecommendationInput,
): SessionRecommendation {
  const parsed = SessionRecommendationInputSchema.parse(input);

  // Check if user is blocked from starting a session
  if (parsed.hasActiveSession) {
    return SessionRecommendationSchema.parse({
      duration: 25,
      mode: 'FOCUS',
      reason: 'You already have an active session',
      fallback: true,
      inputs: parsed,
      confidence: 1.0,
      isBlocked: true,
      blockReason: 'Active session in progress',
    });
  }

  // Get priority-based recommendation
  const recommendation = getPriorityRecommendation(parsed);

  return SessionRecommendationSchema.parse({
    ...recommendation,
    inputs: parsed,
  });
}

/**
 * Validates if a recommendation is still valid
 */
export function isRecommendationValid(
  recommendation: SessionRecommendation,
): boolean {
  return !recommendation.isBlocked && recommendation.confidence > 0.5;
}

/**
 * Gets fallback recommendation when primary recommendation is invalid
 */
export function getFallbackRecommendation(
  input: SessionRecommendationInput,
): SessionRecommendation {
  return SessionRecommendationSchema.parse({
    duration: 25,
    mode: 'FOCUS',
    reason: 'Default session: A reliable 25-minute focus block',
    fallback: true,
    inputs: input,
    confidence: 0.6,
    isBlocked: false,
  });
}
