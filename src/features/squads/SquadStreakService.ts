/**
 * SquadStreakService
 *
 * Tracks squad focus streaks — consecutive days where at least 1 squad member
 * completes a qualifying session. This is a shared goal, different from individual streaks.
 *
 * @phase 11.4
 */

import { getSupabaseClient } from '../../config/supabase';
import { eventBus } from '../../events';

// Constants
const QUALIFYING_SESSION_MINUTES = 15; // 15+ min session qualifies
const STREAK_MILESTONE_BADGE = 7; // 7-day streak = shared badge

export interface SquadStreak {
  squadId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: number | null; // timestamp of last day with qualifying session
  qualifyingSessionToday: boolean;
  streakAtRisk: boolean;
}

export interface SquadMemberSessionStatus {
  userId: string;
  displayName: string;
  hasCompletedToday: boolean;
  totalFocusMinutesToday: number;
}

/**
 * Check if a session qualifies for streak counting
 */
function isQualifyingSession(durationSeconds: number): boolean {
  return durationSeconds >= QUALIFYING_SESSION_MINUTES * 60;
}

/**
 * Get start of day timestamp for a given timezone
 */
function getStartOfDay(timestamp: number, timezone: string = 'UTC'): number {
  const date = new Date(timestamp);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;

  return new Date(`${year}-${month}-${day}T00:00:00`).getTime();
}

/**
 * Check if squad has qualifying activity today
 */
export async function checkSquadActivityToday(
  squadId: string
): Promise<{ hasActivity: boolean; memberCount: number; totalMinutes: number }> {
  const supabase = getSupabaseClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  // Get squad member IDs
  const { data: members, error: memberError } = await supabase
    .from('squad_members')
    .select('user_id')
    .eq('squad_id', squadId)
    .eq('is_active', true);

  if (memberError) {
    throw new Error(`Failed to fetch squad members: ${memberError.message}`);
  }

  const memberIds = (members || []).map((m: { user_id: string }) => m.user_id);

  if (memberIds.length === 0) {
    return { hasActivity: false, memberCount: 0, totalMinutes: 0 };
  }

  // Check for completed sessions today
  const { data: sessions, error: sessionError } = await supabase
    .from('sessions')
    .select('user_id, effective_duration')
    .in('user_id', memberIds)
    .eq('status', 'COMPLETED')
    .gte('completed_at', todayStart)
    .lt('completed_at', todayEnd);

  if (sessionError) {
    throw new Error(`Failed to fetch sessions: ${sessionError.message}`);
  }

  // Check if any session qualifies (15+ min)
  const qualifyingSessions = (sessions || []).filter((s: { effective_duration: number }) =>
    isQualifyingSession(s.effective_duration)
  );

  const totalMinutes = qualifyingSessions.reduce(
    (sum: number, s: { effective_duration: number }) => sum + s.effective_duration / 60,
    0
  );

  return {
    hasActivity: qualifyingSessions.length > 0,
    memberCount: new Set(qualifyingSessions.map((s: { user_id: string }) => s.user_id)).size,
    totalMinutes: Math.round(totalMinutes),
  };
}

/**
 * Get squad streak from database or calculate if not stored
 */
export async function getSquadStreak(squadId: string): Promise<SquadStreak> {
  const supabase = getSupabaseClient();

  // Try to get stored streak
  const { data: streakData, error } = await supabase
    .from('squad_streaks')
    .select('*')
    .eq('squad_id', squadId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch squad streak: ${error.message}`);
  }

  // Check today's activity
  const todayActivity = await checkSquadActivityToday(squadId);

  // Calculate streak
  let currentStreak = streakData?.current_streak || 0;
  let lastCompletedDate = streakData?.last_completed_date || null;
  let streakAtRisk = false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();

  if (todayActivity.hasActivity) {
    // Activity today - streak continues or starts
    if (!lastCompletedDate) {
      // First day of streak
      currentStreak = 1;
    } else {
      const lastDate = new Date(lastCompletedDate);
      lastDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((todayStart - lastDate.getTime()) / (24 * 60 * 60 * 1000));

      if (daysDiff === 0) {
        // Already counted today
      } else if (daysDiff === 1) {
        // Continuing streak
        currentStreak += 1;
      } else {
        // Streak broken, start new
        currentStreak = 1;
      }
    }
    lastCompletedDate = todayStart;
    streakAtRisk = false;
  } else {
    // No activity today - check if streak is at risk
    if (lastCompletedDate) {
      const lastDate = new Date(lastCompletedDate);
      lastDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((todayStart - lastDate.getTime()) / (24 * 60 * 60 * 1000));

      if (daysDiff >= 1) {
        streakAtRisk = true;
      }
      if (daysDiff > 1) {
        // Streak broken
        currentStreak = 0;
        lastCompletedDate = null;
      }
    }
  }

  return {
    squadId,
    currentStreak,
    longestStreak: streakData?.longest_streak || currentStreak,
    lastCompletedDate,
    qualifyingSessionToday: todayActivity.hasActivity,
    streakAtRisk,
  };
}

/**
 * Update squad streak in database
 */
export async function updateSquadStreak(
  squadId: string,
  streak: Partial<SquadStreak>
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('squad_streaks').upsert(
    {
      squad_id: squadId,
      current_streak: streak.currentStreak ?? 0,
      longest_streak: streak.longestStreak ?? 0,
      last_completed_date: streak.lastCompletedDate,
      updated_at: Date.now(),
    },
    {
      onConflict: 'squad_id',
    }
  );

  if (error) {
    throw new Error(`Failed to update squad streak: ${error.message}`);
  }
}

/**
 * Check if squad earned milestone badge (7+ day streak)
 */
export function hasSquadStreakMilestone(streakDays: number): boolean {
  return streakDays >= STREAK_MILESTONE_BADGE;
}

/**
 * Get motivational message when squad streak > individual streak
 */
export function getSquadStreakMotivation(
  squadStreak: number,
  individualStreak: number
): string | null {
  if (squadStreak <= individualStreak) {return null;}

  if (squadStreak >= 30) {
    return `Your squad has a ${squadStreak}-day UNSTOPPABLE streak! Don't break it! 👑`;
  }
  if (squadStreak >= 14) {
    return `Your squad has a ${squadStreak}-day legendary streak! Don't let them down! 🔥`;
  }
  if (squadStreak >= 7) {
    return `Your squad has a ${squadStreak}-day streak! Don't break it! 💪`;
  }
  return `Your squad has a ${squadStreak}-day streak! Keep it going! 🎯`;
}

/**
 * Process squad streak after a member completes a session
 */
export async function processSquadStreakOnSessionComplete(
  squadId: string,
  userId: string,
  sessionDuration: number
): Promise<SquadStreak | null> {
  // Only process qualifying sessions
  if (!isQualifyingSession(sessionDuration)) {
    return null;
  }

  const currentStreak = await getSquadStreak(squadId);

  // If already counted today, no change
  if (currentStreak.qualifyingSessionToday) {
    return currentStreak;
  }

  // Update streak with today's activity
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const newStreak: SquadStreak = {
    ...currentStreak,
    currentStreak: currentStreak.currentStreak + 1,
    lastCompletedDate: today.getTime(),
    qualifyingSessionToday: true,
    streakAtRisk: false,
  };

  // Update longest streak if needed
  if (newStreak.currentStreak > currentStreak.longestStreak) {
    newStreak.longestStreak = newStreak.currentStreak;
  }

  // Persist to database
  await updateSquadStreak(squadId, newStreak);

  // Publish event
  (eventBus as any).publish('squad:streak_updated', {
    squadId,
    userId,
    newStreak: newStreak.currentStreak,
    milestone: hasSquadStreakMilestone(newStreak.currentStreak),
  });

  // Check for milestone
  if (hasSquadStreakMilestone(newStreak.currentStreak) &&
      !hasSquadStreakMilestone(currentStreak.currentStreak)) {
    (eventBus as any).publish('squad:streak_milestone_reached', {
      squadId,
      streakDays: newStreak.currentStreak,
    });
  }

  return newStreak;
}

/**
 * Get daily squad member completion status
 */
export async function getSquadMemberCompletionStatus(
  squadId: string
): Promise<SquadMemberSessionStatus[]> {
  const supabase = getSupabaseClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  // Get squad members with user info
  const { data: members, error: memberError } = await supabase
    .from('squad_members')
    .select(`
      user_id,
      users:user_id (
        display_name
      )
    `)
    .eq('squad_id', squadId)
    .eq('is_active', true);

  if (memberError) {
    throw new Error(`Failed to fetch squad members: ${memberError.message}`);
  }

  if (!members || members.length === 0) {
    return [];
  }

  const memberIds = members.map((m: { user_id: string }) => m.user_id);

  // Get today's sessions for all members
  const { data: sessions, error: sessionError } = await supabase
    .from('sessions')
    .select('user_id, effective_duration')
    .in('user_id', memberIds)
    .eq('status', 'COMPLETED')
    .gte('completed_at', todayStart)
    .lt('completed_at', todayEnd);

  if (sessionError) {
    throw new Error(`Failed to fetch sessions: ${sessionError.message}`);
  }

  // Aggregate by member
  const sessionMap = new Map<string, number>();
  (sessions || []).forEach((s: { user_id: string; effective_duration: number }) => {
    const current = sessionMap.get(s.user_id) || 0;
    sessionMap.set(s.user_id, current + s.effective_duration);
  });

  return members.map((m: { user_id: string; users: { display_name: string }[] }) => {
    const totalSeconds = sessionMap.get(m.user_id) || 0;
    return {
      userId: m.user_id,
      displayName: m.users?.[0]?.display_name || 'Unknown',
      hasCompletedToday: isQualifyingSession(totalSeconds),
      totalFocusMinutesToday: Math.round(totalSeconds / 60),
    };
  });
}

/**
 * Service object for export
 */
export const SquadStreakService = {
  getSquadStreak,
  updateSquadStreak,
  checkSquadActivityToday,
  processSquadStreakOnSessionComplete,
  hasSquadStreakMilestone,
  getSquadStreakMotivation,
  getSquadMemberCompletionStatus,
};

export default SquadStreakService;
