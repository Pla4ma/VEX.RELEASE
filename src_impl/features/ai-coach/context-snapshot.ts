/**
 * AI Coach Context Snapshot
 *
 * Captures user's current context for personalized AI coach interventions.
 */

import { z } from 'zod';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('ai-coach:context');

// Context snapshot schema
// Generate context snapshot for user
// Get preferred time of day
function getPreferredTime(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 5 && hour < 12) {
    return 'morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'afternoon';
  }
  if (hour >= 17 && hour < 22) {
    return 'evening';
  }
  return 'night';
}

// Determine coach intervention priority
// Get contextual coach prompt
// Check if coach should intervene
// Get context hash for caching
export * from "./context-snapshot.types";
export * from "./context-snapshot.part1";
export * from "./context-snapshot.part2";
