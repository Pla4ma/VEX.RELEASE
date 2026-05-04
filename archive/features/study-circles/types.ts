/**
 * Study Circles - Domain Types
 *
 * Async accountability groups (renamed from Squads).
 * Shared goals, no real-time combat. Simple and focused.
 *
 * Phase 3: Gamification Simplification
 */

// ============================================================================
// Core Circle Types
// ============================================================================

export interface StudyCircle {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;

  // Stats (simplified - no complex multipliers)
  memberCount: number;
  maxMembers: number; // Typically 3-8 people for accountability
  totalFocusTime: number; // Combined focus time
  completedSessions: number;

  // Shared goal (replaces boss/challenge)
  weeklyGoalMinutes: number;
  currentWeekProgress: number; // Minutes completed this week

  // Settings
  isPublic: boolean;
  joinRequirements: CircleJoinRequirement;

  // Metadata
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface StudyCircleSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  memberCount: number;
  maxMembers: number;
  weeklyGoalMinutes: number;
  currentWeekProgress: number;
  isPublic: boolean;
  isMember: boolean;
  userRole: CircleRole | null;
}

export type CircleRole = 'FOUNDER' | 'MEMBER';

export type CircleJoinRequirement = 'OPEN' | 'APPROVAL' | 'INVITE_ONLY';

// ============================================================================
// Circle Member Types
// ============================================================================

export interface CircleMember {
  circleId: string;
  userId: string;
  role: CircleRole;

  // Membership state
  joinedAt: number;
  lastActiveAt: number;
  isActive: boolean;

  // Contribution (simplified)
  sessionsCompleted: number;
  totalFocusTime: number;
  weeklyContribution: number; // Minutes this week
  streakDays: number;
}

export interface CircleMemberDetail extends CircleMember {
  displayName: string;
  avatarUrl: string | null;
  level: number;
  currentStreak: number;
}

// ============================================================================
// Accountability Types (Async Only)
// ============================================================================

export interface AccountabilityCheck {
  id: string;
  circleId: string;
  weekStart: number; // Monday timestamp
  weekEnd: number;   // Sunday timestamp

  // Each member's commitment
  memberGoals: Array<{
    userId: string;
    goalMinutes: number;
    actualMinutes: number;
    completed: boolean;
  }>;

  // Circle totals
  totalGoalMinutes: number;
  totalActualMinutes: number;
  percentComplete: number;
  allMembersMetGoal: boolean;
}

export interface WeeklyReport {
  circleId: string;
  weekStart: number;
  weekEnd: number;

  // Rankings (non-competitive, just for visibility)
  memberContributions: Array<{
    userId: string;
    displayName: string;
    minutes: number;
    sessions: number;
    streak: number;
  }>;

  // Circle stats
  totalMinutes: number;
  totalSessions: number;
  bestDay: string; // Day with most activity
  streakMaintained: boolean;
}

// ============================================================================
// Activity Feed Types (Async Updates)
// ============================================================================

export interface CircleActivity {
  id: string;
  circleId: string;
  userId: string;
  type: CircleActivityType;
  data: Record<string, unknown>;
  createdAt: number;
}

export type CircleActivityType =
  | 'SESSION_COMPLETED'      // Someone finished a session
  | 'GOAL_UPDATED'           // Weekly goal changed
  | 'MEMBER_JOINED'          // New member
  | 'STREAK_MILESTONE'       // Someone hit a streak milestone
  | 'WEEKLY_GOAL_MET';       // Circle hit weekly goal

export interface ActivityFeed {
  circleId: string;
  activities: CircleActivity[];
  hasMore: boolean;
  lastReadAt: number;
  unreadCount: number;
}

// ============================================================================
// Invites
// ============================================================================

export interface CircleInvite {
  id: string;
  circleId: string;
  invitedByUserId: string;
  invitedUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: number;
  expiresAt: number;
}

export interface WeeklyCheck {
  id: string;
  circleId: string;
  weekStart: number;
  weekEnd: number;
  memberGoals: Array<{
    userId: string;
    goalMinutes: number;
    actualMinutes: number;
    completed: boolean;
  }>;
  totalGoalMinutes: number;
  totalActualMinutes: number;
  percentComplete: number;
  allMembersMetGoal: boolean;
}

// ============================================================================
// Removed from Squads (not in Study Circles):
// - Real-time shared sessions
// - Boss encounters
// - Live combat
// - Complex multipliers
// - Synergy levels
// - Rankings/leaderboards
// ============================================================================
