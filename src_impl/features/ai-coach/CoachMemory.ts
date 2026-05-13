/**
 * CoachMemory
 *
 * Stores and retrieves key user milestones for personalized coach messages.
 * Milestones: first S grade, longest session, best streak, first boss defeated.
 * References these in messages for relationship depth.
 *
 * @phase 8
 */

import type { CoachMessage, MessageCategory } from './types';
import { createDebugger } from '../../utils/debug';
import { createMemory as repoCreateMemory, getMemoriesByUser as repoGetMemoriesByUser, getMemoriesByType as repoGetMemoriesByType, markMemoryReferenced as repoMarkMemoryReferenced, hasMemoryOfType as repoHasMemoryOfType, getMostRecentMemoryByType as repoGetMostRecentMemoryByType } from './repository/memories';

const debug = createDebugger('ai-coach:memory');

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Phase 1: Memory Deepening - Study Patterns & Behaviors
// ============================================================================
// ============================================================================
// Milestone Detection
// ============================================================================
// ============================================================================
// Memory Retrieval for Messages
// ============================================================================
// ============================================================================
// Memory-Based Message Generation
// ============================================================================
// ============================================================================
// Export
// ============================================================================

export default {
  storeMemory,
  getUserMemories,
  getMemoriesByType,
  markMemoryReferenced,
  checkFirstSGrade,
  checkLongestSession,
  checkBestStreak,
  checkFirstBossDefeated,
  checkFirstRivalWin,
  storeOnboardingGoal,
  getRelevantMemories,
  generateMemoryReferenceMessage,
  getOnboardingGoal,
  getMilestoneSummary,
  // Phase 1: Memory Deepening
  storeStudyPattern,
  storePreferredTechnique,
  storeFailureMode,
  storeOptimalFocusTime,
  storeDocumentMilestone,
  getStudyPatterns,
  getPreferredTechniques,
  getFailureModes,
  getOptimalFocusTimes,
};

export * from "./CoachMemory.types";
export * from "./CoachMemory.part1";
export * from "./CoachMemory.part2";
