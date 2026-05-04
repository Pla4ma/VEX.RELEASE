/**
 * Study Buddies Repository
 *
 * Data access layer for non-competitive accountability pairs.
 * Replaces Rivals with mutual support and encouragement.
 *
 * @phase 3
 */

import { supabase } from '../../supabase/client';
import { createDebugger } from '../../../utils/debug';
import type {
  StudyBuddy,
  SharedGoal,
  BuddyEncouragement,
  BuddyCheckIn,
  BuddyPreferences,
  BuddyMatch,
} from './types';

const debug = createDebugger('study-buddies:repository');

// ============================================================================
// Types
// ============================================================================

interface StudyBuddyRow {
  id: string;
  user_id: string;
  buddy_id: string;
  status: string;
  initiated_by: string;
  initiated_at: string;
  accepted_at: string | null;
  ended_at: string | null;
  end_reason: string | null;
  shared_goal_id: string | null;
  mutual_stats: string;
  encouragements_sent: number;
  encouragements_received: number;
  created_at: string;
  updated_at: string;
}

interface SharedGoalRow {
  id: string;
  description: string;
  metric: string;
  target: number;
  timeframe: string;
  created_at: string;
  updated_at: string;
}

interface BuddyEncouragementRow {
  id: string;
  buddy_pair_id: string;
  from_user_id: string;
  to_user_id: string;
  type: string;
  message: string;
  created_at: string;
  seen: boolean;
}

interface BuddyCheckInRow {
  id: string;
  buddy_pair_id: string;
  user_id: string;
  date: string;
  completed_session: boolean;
  minutes_studied: number;
  mood: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Repository
// ============================================================================

export class StudyBuddiesRepository {
  private userId: string | null = null;

  setUserId(userId: string): void {
    this.userId = userId;
  }

  // ============================================================================
  // Buddy Management
  // ============================================================================

  /**
   * Create a new buddy relationship
   */
  async createBuddyRequest(buddyId: string, sharedGoalId?: string): Promise<StudyBuddy> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { data: result, error } = await supabase
        .from('study_buddies')
        .insert({
          user_id: this.userId,
          buddy_id: buddyId,
          status: 'PENDING',
          initiated_by: this.userId,
          shared_goal_id: sharedGoalId || null,
          mutual_stats: JSON.stringify({
            totalSessionsTogether: 0,
            combinedFocusTime: 0,
            streakDaysTogether: 0,
            longestStreak: 0,
          }),
          encouragements_sent: 0,
          encouragements_received: 0,
        })
        .select()
        .single();

      if (error) throw error;

      debug.info('Buddy request created', { buddyId, sharedGoalId });

      return this.mapRowToBuddy(result as StudyBuddyRow);
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to create buddy request:', error.message);
      throw error;
    }
  }

  /**
   * Get user's buddy relationships
   */
  async getUserBuddies(): Promise<StudyBuddy[]> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { data, error } = await supabase
        .rpc('get_user_study_buddies', {
          p_user_id: this.userId,
        });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.buddy_pair_id,
        userId: this.userId,
        buddyId: row.buddy_user_id,
        buddyDisplayName: row.buddy_display_name,
        buddyAvatarUrl: row.buddy_avatar_url,
        status: row.status,
        initiatedBy: row.buddy_user_id === this.userId ? this.userId : row.buddy_user_id,
        initiatedAt: new Date(row.created_at).getTime(),
        acceptedAt: null, // Would need to join with actual table
        endedAt: null,
        endReason: null,
        sharedGoal: row.shared_goal_description ? {
          id: '', // Would need to get from shared_goal_id
          description: row.shared_goal_description,
          metric: row.shared_goal_metric,
          target: row.shared_goal_target,
          timeframe: row.shared_goal_timeframe,
        } : null,
        mutualStats: {
          totalSessionsTogether: row.mutual_total_sessions || 0,
          combinedFocusTime: row.mutual_focus_time || 0,
          streakDaysTogether: row.mutual_streak_days || 0,
          longestStreak: row.longest_streak || 0,
        },
        encouragementsSent: row.encouragements_sent || 0,
        encouragementsReceived: row.encouragements_received || 0,
        canSendEncouragement: row.can_send_encouragement || false,
      }));
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get user buddies:', error.message);
      throw error;
    }
  }

  /**
   * Accept a buddy request
   */
  async acceptBuddyRequest(buddyPairId: string): Promise<boolean> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { error } = await supabase
        .from('study_buddies')
        .update({
          status: 'ACTIVE',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', buddyPairId)
        .eq('buddy_id', this.userId); // Only buddy can accept

      if (error) throw error;

      debug.info('Buddy request accepted', { buddyPairId });

      return true;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to accept buddy request:', error.message);
      throw error;
    }
  }

  /**
   * Decline a buddy request
   */
  async declineBuddyRequest(buddyPairId: string): Promise<boolean> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { error } = await supabase
        .from('study_buddies')
        .update({
          status: 'ENDED',
          end_reason: 'USER_INITIATED',
          ended_at: new Date().toISOString(),
        })
        .eq('id', buddyPairId)
        .eq('buddy_id', this.userId); // Only buddy can decline

      if (error) throw error;

      debug.info('Buddy request declined', { buddyPairId });

      return true;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to decline buddy request:', error.message);
      throw error;
    }
  }

  /**
   * End buddy relationship
   */
  async endBuddyRelationship(buddyPairId: string, reason: string): Promise<boolean> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { error } = await supabase
        .from('study_buddies')
        .update({
          status: 'ENDED',
          end_reason: reason,
          ended_at: new Date().toISOString(),
        })
        .eq('id', buddyPairId)
        .or('user_id.eq.${this.userId}', 'buddy_id.eq.${this.userId}');

      if (error) throw error;

      debug.info('Buddy relationship ended', { buddyPairId, reason });

      return true;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to end buddy relationship:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Shared Goals
  // ============================================================================

  /**
   * Get available shared goals
   */
  async getSharedGoals(): Promise<SharedGoal[]> {
    try {
      const { data, error } = await supabase
        .from('study_buddy_shared_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: SharedGoalRow) => ({
        id: row.id,
        description: row.description,
        metric: row.metric,
        target: row.target,
        timeframe: row.timeframe,
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.updated_at).getTime(),
      }));
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get shared goals:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Encouragements
  // ============================================================================

  /**
   * Send encouragement to buddy
   */
  async sendEncouragement(
    buddyPairId: string,
    toUserId: string,
    type: string,
    message: string
  ): Promise<BuddyEncouragement> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { data: result, error } = await supabase
        .rpc('send_study_buddy_encouragement', {
          p_buddy_pair_id: buddyPairId,
          p_from_user_id: this.userId,
          p_to_user_id: toUserId,
          p_type: type,
          p_message: message,
        });

      if (error) throw error;

      debug.info('Encouragement sent', { buddyPairId, toUserId, type });

      return {
        id: result,
        buddyPairId,
        fromUserId: this.userId,
        toUserId,
        type,
        message,
        createdAt: Date.now(),
        seen: false,
      };
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to send encouragement:', error.message);
      throw error;
    }
  }

  /**
   * Get encouragements for a buddy pair
   */
  async getEncouragements(buddyPairId: string, limit: number = 20): Promise<BuddyEncouragement[]> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { data, error } = await supabase
        .from('study_buddy_encouragements')
        .select('*')
        .eq('buddy_pair_id', buddyPairId)
        .or(`from_user_id.eq.${this.userId}`, `to_user_id.eq.${this.userId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((row: BuddyEncouragementRow) => ({
        id: row.id,
        buddyPairId,
        fromUserId: row.from_user_id,
        toUserId: row.to_user_id,
        type: row.type,
        message: row.message,
        createdAt: new Date(row.created_at).getTime(),
        seen: row.seen,
      }));
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get encouragements:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Check-ins
  // ============================================================================

  /**
   * Submit daily check-in
   */
  async submitCheckIn(
    buddyPairId: string,
    checkInData: {
      completedSession: boolean;
      minutesStudied: number;
      mood: string;
      note?: string;
    }
  ): Promise<BuddyCheckIn> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      const { data: result, error } = await supabase
        .from('study_buddy_check_ins')
        .insert({
          buddy_pair_id: buddyPairId,
          user_id: this.userId,
          date: today,
          completed_session: checkInData.completedSession,
          minutes_studied: checkInData.minutesStudied,
          mood: checkInData.mood,
          note: checkInData.note || null,
        })
        .select()
        .single();

      if (error) throw error;

      debug.info('Check-in submitted', { buddyPairId, mood: checkInData.mood });

      return {
        id: result.id,
        buddyPairId,
        userId: this.userId,
        date: today,
        completedSession: checkInData.completedSession,
        minutesStudied: checkInData.minutesStudied,
        mood: checkInData.mood,
        note: checkInData.note || null,
        createdAt: new Date(result.created_at).getTime(),
      };
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to submit check-in:', error.message);
      throw error;
    }
  }

  /**
   * Get check-ins for a buddy pair
   */
  async getCheckIns(buddyPairId: string, days: number = 7): Promise<BuddyCheckIn[]> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('study_buddy_check_ins')
        .select('*')
        .eq('buddy_pair_id', buddyPairId)
        .or(`user_id.eq.${this.userId}`)
        .gte('date', cutoffDate)
        .order('date', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: BuddyCheckInRow) => ({
        id: row.id,
        buddyPairId,
        userId: row.user_id,
        date: row.date,
        completedSession: row.completed_session,
        minutesStudied: row.minutes_studied,
        mood: row.mood,
        note: row.note,
        createdAt: new Date(row.created_at).getTime(),
      }));
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get check-ins:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Buddy Matching
  // ============================================================================

  /**
   * Find potential buddy matches for user
   */
  async findBuddyMatches(limit: number = 10): Promise<BuddyMatch[]> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      // This would implement matching logic based on:
      // - Study preferences
      // - Time zones
      // - Goals
      // - Complementary schedules
      // For now, return empty array
      const matches: BuddyMatch[] = [];

      debug.info('Buddy matches searched', { userId: this.userId, limit });

      return matches;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to find buddy matches:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private mapRowToBuddy(row: StudyBuddyRow): StudyBuddy {
    return {
      id: row.id,
      userId: row.user_id,
      buddyId: row.buddy_id,
      status: row.status as any,
      initiatedBy: row.initiated_by,
      initiatedAt: new Date(row.initiated_at).getTime(),
      acceptedAt: row.accepted_at ? new Date(row.accepted_at).getTime() : null,
      endedAt: row.ended_at ? new Date(row.ended_at).getTime() : null,
      endReason: row.end_reason as any,
      sharedGoal: null, // Would need to join with shared goals table
      mutualStats: JSON.parse(row.mutual_stats || '{}'),
      encouragementsSent: row.encouragements_sent,
      encouragementsReceived: row.encouragements_received,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let repository: StudyBuddiesRepository | null = null;

export function getStudyBuddiesRepository(): StudyBuddiesRepository {
  if (!repository) {
    repository = new StudyBuddiesRepository();
  }
  return repository;
}

export function resetStudyBuddiesRepository(): void {
  repository = null;
}
