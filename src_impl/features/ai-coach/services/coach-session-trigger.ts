/**
 * Coach Session Trigger Service
 *
 * Phase 9.4 — Coach-triggered session start with pre-filled config
 * Handles CTA clicks from coach messages that create pre-configured sessions
 */

import { eventBus } from '../../../events';
import { capture } from '@/shared/analytics';
import { CoachEvents } from '@/shared/analytics/analytics-events';
import { getPersonalizedContext } from './coach-memory';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('ai-coach:session-trigger');

// ============================================================================
// Types
// ============================================================================

function toAnalyticsDifficulty(difficulty: CoachSessionConfig['difficulty']): 'easy' | 'medium' | 'hard' {
  if (difficulty === 'EASY') {
    return 'easy';
  }
  if (difficulty === 'PUSH' || difficulty === 'CHALLENGING') {
    return 'hard';
  }
  return 'medium';
}

function toAnalyticsSessionType(sessionType: CoachSessionConfig['sessionType']): 'focus' | 'challenge' | 'boss' {
  if (sessionType === 'CHALLENGE') {
    return 'challenge';
  }
  if (sessionType === 'BOSS_BATTLE') {
    return 'boss';
  }
  return 'focus';
}

// ============================================================================
// Configuration Presets
// ============================================================================
// ============================================================================
// Main Trigger Function
// ============================================================================
// ============================================================================
// Analytics Helper
// ============================================================================
export * from "./coach-session-trigger.types";
export * from "./coach-session-trigger.part1";
export * from "./coach-session-trigger.part2";
