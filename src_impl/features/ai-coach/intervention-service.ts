/**
 * Coach Intervention Service
 *
 * Proactive interventions that modify game mechanics based on user state:
 * - Burnout detection: 5+ sessions in 24h with quality < 70
 * - Plateau detection: XP growth dropped >30% over 7 days
 * - Streak rescue: 6 hours before streak breaks
 * - Boss strategy: When boss < 30% health
 *
 * @phase 8
 */

import type { CoachMessage, CoachUserState } from './types';

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// 8.3 — Burnout Detection
// ============================================================================
// ============================================================================
// 8.3 — Plateau Detection
// ============================================================================
// ============================================================================
// 8.3 — Streak Rescue
// ============================================================================
// ============================================================================
// 8.3 — Boss Strategy
// ============================================================================
// ============================================================================
// Phase 2.3 - New Interventions
// ============================================================================

// New intervention types from Phase 2.3:
// - STUDY_BEHIND: Falling behind study plan
// - BOSS_OPPORTUNITY: Boss health low, good time to attack
// - MOMENTUM_BUILDING: 2+ day streak, encourage continuation
// - COMEBACK_READY: After streak break, optimal time to restart
// - STUDY_PLAN_COMPLETE: Milestone celebration
// ============================================================================
// Phase 1 - New Intervention Types (19/10 Plan)
// ============================================================================
// ============================================================================
// Original Phase 2.3 Interventions
// ============================================================================
// ============================================================================
// Main Intervention Evaluation
// ============================================================================
export default {
  detectBurnout,
  detectPlateau,
  detectStreakRescueNeeded,
  detectBossStrategyOpportunity,
  detectStudyStuck,
  detectDistraction,
  detectOptimalBreak,
  evaluateInterventions,
  generateBurnoutMessage,
  generatePlateauMessage,
  generateStreakRescueMessage,
  generateBossStrategyMessage,
};

export * from "./intervention-service.types";
export * from "./intervention-service.part1";
export * from "./intervention-service.part2";
export * from "./intervention-service.part3";
