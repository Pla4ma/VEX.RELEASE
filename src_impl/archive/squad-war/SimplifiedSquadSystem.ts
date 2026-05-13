/**
 * Simplified Squad System
 *
 * Phase 5.1 - Squad System Simplification
 * Transforms squads from complex competitive groups to lightweight accountability groups
 *
 * New Core Features:
 * - Shared weekly focus hour goal
 * - Simple activity feed (who focused recently)
 * - Squad streak (collective when all members active)
 * - Optional cooperative boss battles
 *
 * Removed:
 * - Wars (already deleted)
 * - Complex mission system
 * - Ranking/competition between squads
 * - Chat/messaging
 *
 * Dependencies:
 * - Squads (base system)
 * - Sessions (activity tracking)
 * - Boss (cooperative battles)
 * - Streaks (squad streak logic)
 */

import { eventBus } from '../../events';

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Squad Creation & Management
// ============================================================================

const squads = new Map<string, SimplifiedSquad>();

function getWeekStart(timestamp: number): number {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diff = date.getDate() - day;
  const start = new Date(date.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ============================================================================
// Weekly Goal & Progress
// ============================================================================

function handleGoalAchieved(squad: SimplifiedSquad): void {
  squad.streak.currentWeeks += 1;
  squad.streak.lastAchievedAt = Date.now();
  if (squad.streak.currentWeeks > squad.streak.longestWeeks) {
    squad.streak.longestWeeks = squad.streak.currentWeeks;
  }

  // Add celebration activity
  addActivity(squad, {
    id: `act-${Date.now()}-goal`,
    userId: 'system',
    userName: 'Squad',
    type: 'GOAL_ACHIEVED',
    description: `Weekly goal achieved! ${squad.streak.currentWeeks} week streak!`,
    timestamp: Date.now(),
  });

  eventBus.publish('squad:goal_achieved', {
    squadId: squad.id,
    goalId: `weekly-${squad.id}`,
    goalType: 'weekly',
    achievedBy: squad.members.map((m) => m.userId),
  });
}

// ============================================================================
// Activity Feed
// ============================================================================

/**
 * Add activity to feed (maintains last 50 only)
 */
function addActivity(squad: SimplifiedSquad, activity: SquadActivity): void {
  squad.recentActivity.unshift(activity);

  // Keep only last 50 activities
  if (squad.recentActivity.length > 50) {
    squad.recentActivity = squad.recentActivity.slice(0, 50);
  }

  // Also clean old activities (> 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  squad.recentActivity = squad.recentActivity.filter((a) => a.timestamp > sevenDaysAgo);
}

// ============================================================================
// Cooperative Boss Battles
// ============================================================================

function handleBossDefeated(squad: SimplifiedSquad, encounter: SquadBossEncounter): void {
  // Add celebration activity
  addActivity(squad, {
    id: `act-${Date.now()}-victory`,
    userId: 'system',
    userName: 'Squad',
    type: 'BOSS_DAMAGE',
    description: `${encounter.bossName} defeated by the squad! Great teamwork!`,
    timestamp: Date.now(),
  });

  eventBus.publish('squad:boss_defeated', {
    squadId: squad.id,
    encounterId: encounter.encounterId,
    bossId: encounter.encounterId,
    bossName: encounter.bossName,
    totalDamage: encounter.maxHealth || 1000,
  } as any);
}

// ============================================================================
// Squad Discovery
// ============================================================================
// ============================================================================
// Squad Summary (for display)
// ============================================================================
// ============================================================================
// Exports
// ============================================================================

// Types are already exported via 'export interface' declarations above
export * from "./SimplifiedSquadSystem.types";
export * from "./SimplifiedSquadSystem.part1";
export * from "./SimplifiedSquadSystem.part2";
export * from "./SimplifiedSquadSystem.part3";
