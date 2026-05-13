/**
 * AI Coach Recommendation Pipeline
 *
 * Generates personalized recommendations based on user context and behavior.
 */

import { z } from 'zod';
import { createDebugger } from '../../utils/debug';
import type { ContextSnapshot } from './context-snapshot';

const debug = createDebugger('ai-coach:recommendations');

// Recommendation output schema
// Generate recommendations based on context
// Get priority weight for sorting
function priorityWeight(priority: CoachRecommendation['priority']): number {
  const weights = { critical: 4, high: 3, medium: 2, low: 1 };
  return weights[priority];
}

// Calculate optimal session hour based on context
function getOptimalSessionHour(context: ContextSnapshot): number {
  const preferred = context.behaviorContext.preferredTimeOfDay;

  const hourMap = {
    morning: 9,
    afternoon: 14,
    evening: 19,
    night: 21,
  };

  return hourMap[preferred];
}

// Filter expired recommendations
// Get top recommendation
// Check if recommendation is still relevant
// Format recommendation for display
// Track recommendation interaction
// Batch process recommendations
export * from "./recommendation-pipeline.types";
export * from "./recommendation-pipeline.part1";
export * from "./recommendation-pipeline.part2";
