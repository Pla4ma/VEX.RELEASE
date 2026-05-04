/**
 * Study Buddies - Domain Types
 *
 * Non-competitive accountability pairs (renamed from Rivals).
 * Mutual support, not competition.
 *
 * Phase 3: Gamification Simplification
 */

// ============================================================================
// Core Buddy Types
// ============================================================================

export interface StudyBuddy {
  id: string;
  userId: string;
  buddyId: string;

  // Simple status
  status: BuddyStatus;
  initiatedBy: string;
  initiatedAt: number;
  acceptedAt: number | null;
  endedAt: number | null;

  // Shared goal (not stakes/competition)
  sharedGoal: SharedGoal | null;

  // Mutual stats (no winner/loser)
  mutualStats: MutualStats;

  // Encouragement tracking
  encouragementsSent: number;
  encouragementsReceived: number;
}

export type BuddyStatus =
  | 'PENDING'      // Waiting for acceptance
  | 'ACTIVE'       // Buddies working together
  | 'PAUSED'       // Temporarily inactive
  | 'ENDED';       // Mutual end

// ============================================================================
// Shared Goal (replaces stakes/competition)
// ============================================================================

export interface SharedGoal {
  id: string;
  description: string; // e.g., "Study 5 days this week"
  metric: 'SESSIONS' | 'MINUTES' | 'STREAK_DAYS' | 'DAYS_ACTIVE';
  target: number;
  timeframe: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  // Individual progress
  userProgress: number;
  buddyProgress: number;

  // Mutual success
  bothCompleted: boolean;
  completedAt: number | null;
}

// ============================================================================
// Mutual Stats (non-competitive)
// ============================================================================

export interface MutualStats {
  totalSessionsTogether: number; // Sessions completed while buddies
  combinedFocusTime: number;     // Total minutes together
  streakDaysTogether: number;    // Days both completed sessions
  longestStreak: number;         // Longest streak together

  // Since becoming buddies
  startedAt: number;
}

// ============================================================================
// Buddy Activity Types
// ============================================================================

export interface BuddyActivity {
  id: string;
  buddyPairId: string;
  userId: string; // Who did the activity
  type: BuddyActivityType;
  data: Record<string, unknown>;
  createdAt: number;
}

export type BuddyActivityType =
  | 'SESSION_COMPLETED'    // Buddy finished a session
  | 'STREAK_MILESTONE'     // Buddy hit streak milestone
  | 'GOAL_PROGRESS'        // Progress on shared goal
  | 'GOAL_COMPLETED'       // Shared goal achieved
  | 'ENCOURAGEMENT_SENT'     // Sent supportive message
  | 'CHECK_IN';            // Daily check-in

// ============================================================================
// Encouragement System (replaces taunts/competition)
// ============================================================================

export interface Encouragement {
  id: string;
  buddyPairId: string;
  fromUserId: string;
  toUserId: string;
  type: EncouragementType;
  message: string;
  createdAt: number;
  seen: boolean;
}

export type EncouragementType =
  | 'GREAT_JOB'        // "Great job on your session!"
  | 'KEEP_GOING'       // "Keep going, you've got this!"
  | 'STREAK_ALMOST'    // "Almost at your streak goal!"
  | 'MISSED_YOU'       // "Missed you yesterday, ready to get back?"
  | 'CUSTOM';          // Custom message

// ============================================================================
// Buddy Preferences (for matching)
// ============================================================================

export interface BuddyPreferences {
  userId: string;

  // Study habits
  preferredStudyTimes: number[]; // Hours of day (0-23)
  preferredSessionLength: number; // Minutes
  studyStyle: 'STRUCTURED' | 'FLEXIBLE';

  // Goals
  primaryGoal: string;
  weeklyTargetMinutes: number;

  // Matching preferences
  preferredBuddyCount: 1 | 2 | 3; // How many buddies they want
  timezone: string;
  language: string;

  // Active status
  lookingForBuddy: boolean;
  updatedAt: number;
}

// ============================================================================
// Buddy Matching
// ============================================================================

export interface BuddyMatch {
  userId: string;
  potentialBuddyId: string;
  compatibilityScore: number; // 0-100
  reasons: string[]; // Why they're a good match
  sharedGoals: string[];
  overlappingStudyTimes: number[]; // Hours they both study
}

// ============================================================================
// Check-ins (async accountability)
// ============================================================================

export interface BuddyCheckIn {
  id: string;
  buddyPairId: string;
  userId: string;
  date: string; // YYYY-MM-DD

  // Simple daily check-in
  completedSession: boolean;
  minutesStudied: number;
  mood: 'GREAT' | 'GOOD' | 'OKAY' | 'STRUGGLING';
  note: string | null;

  createdAt: number;
}

// ============================================================================
// Removed from Rivals (not in Study Buddies):
// - Competitive leaderboards
// - Winner/loser mechanics
// - Stakes/penalties
// - Damage/combat metaphors
// - Real-time duels
// - Skill-based matching
// - Tournaments
// ============================================================================
