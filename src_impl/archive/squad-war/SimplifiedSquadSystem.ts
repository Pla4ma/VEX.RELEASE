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

export interface SimplifiedSquad {
  id: string;
  name: string;
  description: string;
  avatarUrl: string | null;
  createdAt: number;
  createdByUserId: string;

  // Members (max 10 for accountability intimacy)
  members: SquadMember[];
  maxMembers: number;

  // Weekly Goal
  weeklyGoal: WeeklyGoal;

  // Squad Streak
  streak: SquadStreak;

  // Activity Feed (last 7 days only)
  recentActivity: SquadActivity[];

  // Boss Battle
  activeBossEncounter: SquadBossEncounter | null;

  // Settings
  isPublic: boolean; // Can be discovered
  joinCode: string | null; // For private squads
}

export interface SquadMember {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  role: 'LEADER' | 'MEMBER';
  joinedAt: number;

  // Activity Stats (current week)
  weeklyFocusMinutes: number;
  lastSessionAt: number | null;
  streakContributing: boolean; // Has contributed to squad streak this week

  // Status
  isActive: boolean; // Active in last 7 days
}

export interface WeeklyGoal {
  targetFocusHours: number; // Squad target (default: 10 hours per member average)
  currentTotalHours: number;
  weekStartsAt: number;
  weekEndsAt: number;
  achieved: boolean;
}

export interface SquadStreak {
  currentWeeks: number;
  longestWeeks: number;
  lastAchievedAt: number | null;
  requiresAllMembers: boolean; // All members must be active to continue streak
}

export interface SquadActivity {
  id: string;
  userId: string;
  userName: string;
  type: 'SESSION_COMPLETE' | 'BOSS_DAMAGE' | 'STREAK_MILESTONE' | 'GOAL_ACHIEVED';
  description: string;
  timestamp: number;
  metadata?: {
    duration?: number;
    damage?: number;
    streakDays?: number;
  };
}

export interface SquadBossEncounter {
  encounterId: string;
  bossId: string;
  bossName: string;
  startedAt: number;
  expiresAt: number;
  healthRemaining: number;
  maxHealth: number;
  participantDamage: Record<string, number>; // userId -> damage
  status: 'ACTIVE' | 'DEFEATED' | 'EXPIRED';
}

// ============================================================================
// Squad Creation & Management
// ============================================================================

const squads = new Map<string, SimplifiedSquad>();

/**
 * Create a new simplified squad
 */
export function createSquad(creatorId: string, creatorName: string, name: string, description: string, isPublic: boolean = false): SimplifiedSquad {
  const now = Date.now();
  const weekStart = getWeekStart(now);

  const squad: SimplifiedSquad = {
    id: `squad-${now}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    avatarUrl: null,
    createdAt: now,
    createdByUserId: creatorId,

    members: [
      {
        userId: creatorId,
        userName: creatorName,
        avatarUrl: null,
        role: 'LEADER',
        joinedAt: now,
        weeklyFocusMinutes: 0,
        lastSessionAt: null,
        streakContributing: false,
        isActive: true,
      },
    ],
    maxMembers: 10,

    weeklyGoal: {
      targetFocusHours: 10, // 10 hours for small squad, scales with members
      currentTotalHours: 0,
      weekStartsAt: weekStart,
      weekEndsAt: weekStart + 7 * 24 * 60 * 60 * 1000,
      achieved: false,
    },

    streak: {
      currentWeeks: 0,
      longestWeeks: 0,
      lastAchievedAt: null,
      requiresAllMembers: true,
    },

    recentActivity: [],
    activeBossEncounter: null,

    isPublic,
    joinCode: isPublic ? null : generateJoinCode(),
  };

  squads.set(squad.id, squad);

  eventBus.publish('squad:created', {
    squadId: squad.id,
    creatorId,
    name,
  });

  return squad;
}

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

/**
 * Join squad by code or ID
 */
export function joinSquad(squadId: string, userId: string, userName: string, joinCode?: string): { success: boolean; squad?: SimplifiedSquad; error?: string } {
  const squad = squads.get(squadId);
  if (!squad) {
    return { success: false, error: 'Squad not found' };
  }

  // Check if private and code required
  if (!squad.isPublic && squad.joinCode !== joinCode) {
    return { success: false, error: 'Invalid join code' };
  }

  // Check capacity
  if (squad.members.length >= squad.maxMembers) {
    return { success: false, error: 'Squad is full (max 10 members)' };
  }

  // Check if already member
  if (squad.members.some((m) => m.userId === userId)) {
    return { success: false, error: 'Already a member' };
  }

  // Add member
  squad.members.push({
    userId,
    userName,
    avatarUrl: null,
    role: 'MEMBER',
    joinedAt: Date.now(),
    weeklyFocusMinutes: 0,
    lastSessionAt: null,
    streakContributing: false,
    isActive: true,
  });

  // Update goal target based on member count
  squad.weeklyGoal.targetFocusHours = Math.round(squad.members.length * 8); // 8 hours avg per member

  eventBus.publish('squad:member_joined', {
    squadId,
    userId,
    role: 'member',
    userName,
    memberCount: squad.members.length,
  });

  return { success: true, squad };
}

/**
 * Leave squad
 */
export function leaveSquad(squadId: string, userId: string): boolean {
  const squad = squads.get(squadId);
  if (!squad) {
    return false;
  }

  const memberIndex = squad.members.findIndex((m) => m.userId === userId);
  if (memberIndex === -1) {
    return false;
  }

  const wasLeader = squad.members[memberIndex].role === 'LEADER';
  squad.members.splice(memberIndex, 1);

  // If leader left, assign new leader
  if (wasLeader && squad.members.length > 0) {
    squad.members[0].role = 'LEADER';
  }

  // Disband if empty
  if (squad.members.length === 0) {
    squads.delete(squadId);
    eventBus.publish('squad:disbanded', { squadId, userId, memberCount: 0 });
    return true;
  }

  // Update goal target
  squad.weeklyGoal.targetFocusHours = Math.round(squad.members.length * 8);

  eventBus.publish('squad:member_left', {
    squadId,
    userId,
    wasFounder: userId === (squad as any).founderId,
    memberCount: squad.members.length,
  });

  return true;
}

// ============================================================================
// Weekly Goal & Progress
// ============================================================================

/**
 * Record member session activity
 */
export function recordMemberActivity(squadId: string, userId: string, durationMinutes: number): SimplifiedSquad {
  const squad = squads.get(squadId);
  if (!squad) {
    throw new Error('Squad not found');
  }

  const member = squad.members.find((m) => m.userId === userId);
  if (!member) {
    throw new Error('Not a squad member');
  }

  // Update member stats
  member.weeklyFocusMinutes += durationMinutes;
  member.lastSessionAt = Date.now();
  member.isActive = true;
  member.streakContributing = true;

  // Recalculate squad goal progress
  const totalMinutes = squad.members.reduce((sum, m) => sum + m.weeklyFocusMinutes, 0);
  squad.weeklyGoal.currentTotalHours = Math.round((totalMinutes / 60) * 10) / 10;
  squad.weeklyGoal.achieved = squad.weeklyGoal.currentTotalHours >= squad.weeklyGoal.targetFocusHours;

  // Add to activity feed
  addActivity(squad, {
    id: `act-${Date.now()}`,
    userId,
    userName: member.userName,
    type: 'SESSION_COMPLETE',
    description: `${member.userName} focused for ${Math.round(durationMinutes)} minutes`,
    timestamp: Date.now(),
    metadata: { duration: durationMinutes },
  });

  // Check if goal was just achieved
  if (squad.weeklyGoal.achieved && !squad.streak.lastAchievedAt) {
    handleGoalAchieved(squad);
  }

  return squad;
}

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

/**
 * Reset weekly progress (called at week end)
 */
export function resetWeeklyProgress(squadId: string): SimplifiedSquad {
  const squad = squads.get(squadId);
  if (!squad) {
    throw new Error('Squad not found');
  }

  const now = Date.now();
  const weekStart = getWeekStart(now);

  // Check if streak continues
  const allMembersActive = squad.members.every((m) => m.streakContributing);

  if (!allMembersActive) {
    // Streak broken
    squad.streak.currentWeeks = 0;
    eventBus.publish('squad:streak_broken', {
      squadId: squad.id,
      userId: 'system',
      previousStreak: squad.streak.currentWeeks,
    });
  }

  // Reset all member weekly stats
  for (const member of squad.members) {
    member.weeklyFocusMinutes = 0;
    member.streakContributing = false;
    // Check if still active (session in last 7 days)
    member.isActive = member.lastSessionAt ? now - member.lastSessionAt < 7 * 24 * 60 * 60 * 1000 : false;
  }

  // Reset goal
  squad.weeklyGoal = {
    targetFocusHours: Math.round(squad.members.length * 8),
    currentTotalHours: 0,
    weekStartsAt: weekStart,
    weekEndsAt: weekStart + 7 * 24 * 60 * 60 * 1000,
    achieved: false,
  };

  return squad;
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

/**
 * Get activity feed for squad
 */
export function getActivityFeed(squadId: string, limit: number = 20): SquadActivity[] {
  const squad = squads.get(squadId);
  if (!squad) {
    return [];
  }
  return squad.recentActivity.slice(0, limit);
}

/**
 * Record boss damage activity
 */
export function recordBossDamageActivity(squadId: string, userId: string, damage: number): void {
  const squad = squads.get(squadId);
  if (!squad) {
    return;
  }

  const member = squad.members.find((m) => m.userId === userId);
  if (!member) {
    return;
  }

  addActivity(squad, {
    id: `act-${Date.now()}`,
    userId,
    userName: member.userName,
    type: 'BOSS_DAMAGE',
    description: `${member.userName} dealt ${damage} damage to the boss`,
    timestamp: Date.now(),
    metadata: { damage },
  });
}

// ============================================================================
// Cooperative Boss Battles
// ============================================================================

/**
 * Start squad boss encounter
 */
export function startSquadBoss(squadId: string, bossId: string, bossName: string, baseHealth: number): { success: boolean; encounter?: SquadBossEncounter; error?: string } {
  const squad = squads.get(squadId);
  if (!squad) {
    return { success: false, error: 'Squad not found' };
  }

  // Check if already has active boss
  if (squad.activeBossEncounter?.status === 'ACTIVE') {
    return { success: false, error: 'Squad already has an active boss' };
  }

  const now = Date.now();
  const scaledHealth = Math.floor(baseHealth * (1 + squad.members.length * 0.2)); // +20% per member

  const encounter: SquadBossEncounter = {
    encounterId: `encounter-${now}`,
    bossId,
    bossName,
    startedAt: now,
    expiresAt: now + 48 * 60 * 60 * 1000, // 48 hours
    healthRemaining: scaledHealth,
    maxHealth: scaledHealth,
    participantDamage: {},
    status: 'ACTIVE',
  };

  squad.activeBossEncounter = encounter;

  // Add activity
  addActivity(squad, {
    id: `act-${now}-boss`,
    userId: 'system',
    userName: 'Squad',
    type: 'BOSS_DAMAGE',
    description: `Squad boss ${bossName} has appeared! Defeat it together!`,
    timestamp: now,
  });

  eventBus.publish('squad:boss_started', {
    squadId,
    encounterId: encounter.encounterId,
    bossId,
    bossName,
    memberCount: squad.members.length,
  });

  return { success: true, encounter };
}

/**
 * Apply damage to squad boss
 */
export function damageSquadBoss(squadId: string, userId: string, damage: number): { success: boolean; isDefeated: boolean; encounter?: SquadBossEncounter } {
  const squad = squads.get(squadId);
  if (!squad || !squad.activeBossEncounter) {
    return { success: false, isDefeated: false };
  }

  const encounter = squad.activeBossEncounter;
  if (encounter.status !== 'ACTIVE') {
    return { success: false, isDefeated: false };
  }

  // Apply damage
  encounter.healthRemaining = Math.max(0, encounter.healthRemaining - damage);
  encounter.participantDamage[userId] = (encounter.participantDamage[userId] || 0) + damage;

  // Check defeat
  const isDefeated = encounter.healthRemaining === 0;
  if (isDefeated) {
    encounter.status = 'DEFEATED';
    handleBossDefeated(squad, encounter);
  }

  return { success: true, isDefeated, encounter };
}

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

/**
 * Get public squads for discovery
 */
export function discoverPublicSquads(limit: number = 20, excludeFull: boolean = true): SimplifiedSquad[] {
  const allSquads = Array.from(squads.values());
  return allSquads
    .filter((s) => s.isPublic && (!excludeFull || s.members.length < s.maxMembers))
    .sort((a, b) => b.members.length - a.members.length) // Most active first
    .slice(0, limit);
}

/**
 * Get user's squads
 */
export function getUserSquads(userId: string): SimplifiedSquad[] {
  return Array.from(squads.values()).filter((s) => s.members.some((m) => m.userId === userId));
}

/**
 * Get squad by ID
 */
export function getSquad(squadId: string): SimplifiedSquad | null {
  return squads.get(squadId) || null;
}

// ============================================================================
// Squad Summary (for display)
// ============================================================================

export interface SquadSummary {
  id: string;
  name: string;
  memberCount: number;
  maxMembers: number;
  isFull: boolean;
  streakWeeks: number;
  weeklyProgress: number; // 0-100
  recentActivityCount: number;
  hasActiveBoss: boolean;
  isMember: boolean;
  userRole?: 'LEADER' | 'MEMBER';
}

/**
 * Get squad summary for user
 */
export function getSquadSummary(squadId: string, userId: string): SquadSummary | null {
  const squad = squads.get(squadId);
  if (!squad) {
    return null;
  }

  const member = squad.members.find((m) => m.userId === userId);
  const progress = squad.weeklyGoal.targetFocusHours > 0 ? Math.min(100, (squad.weeklyGoal.currentTotalHours / squad.weeklyGoal.targetFocusHours) * 100) : 0;

  return {
    id: squad.id,
    name: squad.name,
    memberCount: squad.members.length,
    maxMembers: squad.maxMembers,
    isFull: squad.members.length >= squad.maxMembers,
    streakWeeks: squad.streak.currentWeeks,
    weeklyProgress: Math.round(progress),
    recentActivityCount: squad.recentActivity.length,
    hasActiveBoss: squad.activeBossEncounter?.status === 'ACTIVE',
    isMember: !!member,
    userRole: member?.role,
  };
}

// ============================================================================
// Exports
// ============================================================================

// Types are already exported via 'export interface' declarations above
