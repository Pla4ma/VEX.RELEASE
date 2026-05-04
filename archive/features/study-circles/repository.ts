/**
 * Study Circles Repository
 *
 * Data access layer for async accountability groups.
 * Replaces Squads with simplified, non-real-time features.
 *
 * @phase 3
 */

import { supabase } from '../../supabase/client';
import { createDebugger } from '../../utils/debug';
import type {
  StudyCircle,
  CircleMember,
  CircleMemberDetail,
  WeeklyCheck,
  ActivityFeed,
  CircleInvite,
} from './types';

const debug = createDebugger('study-circles:repository');

// ============================================================================
// Types
// ============================================================================

interface StudyCircleRow {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  member_count: number;
  max_members: number;
  total_focus_time: number;
  completed_sessions: number;
  weekly_goal_minutes: number;
  current_week_progress: number;
  is_public: boolean;
  join_requirements: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

interface CircleMemberRow {
  id: string;
  circle_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  last_active_at: string;
  is_active: boolean;
  sessions_completed: number;
  total_focus_time: number;
  weekly_contribution: number;
  streak_days: number;
  permissions: string[];
}

interface WeeklyCheckRow {
  id: string;
  circle_id: string;
  week_start: string;
  week_end: string;
  member_goals: string;
  total_goal_minutes: number;
  total_actual_minutes: number;
  percent_complete: number;
  all_members_met_goal: boolean;
  created_at: string;
  updated_at: string;
}

interface CircleActivityRow {
  id: string;
  circle_id: string;
  user_id: string;
  type: string;
  data: string;
  created_at: string;
}

interface CircleInviteRow {
  id: string;
  circle_id: string;
  invited_by_user_id: string;
  invited_user_id: string;
  status: string;
  created_at: string;
  expires_at: string;
}

// ============================================================================
// Repository
// ============================================================================

export class StudyCirclesRepository {
  private userId: string | null = null;

  setUserId(userId: string): void {
    this.userId = userId;
  }

  // ============================================================================
  // Circle Management
  // ============================================================================

  /**
   * Create a new study circle
   */
  async createCircle(data: {
    name: string;
    description?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    maxMembers?: number;
    weeklyGoalMinutes?: number;
    isPublic?: boolean;
    joinRequirements?: string;
  }): Promise<StudyCircle> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { data: result, error } = await supabase
        .from('study_circles')
        .insert({
          name: data.name,
          description: data.description || null,
          avatar_url: data.avatarUrl || null,
          banner_url: data.bannerUrl || null,
          max_members: data.maxMembers || 6,
          weekly_goal_minutes: data.weeklyGoalMinutes || 120,
          is_public: data.isPublic || false,
          join_requirements: data.joinRequirements || 'APPROVAL',
          created_by: this.userId,
        })
        .select()
        .single();

      if (error) throw error;

      debug.info('Study circle created', { name: data.name, id: result.id });

      return this.mapRowToCircle(result as StudyCircleRow);
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to create study circle:', error.message);
      throw error;
    }
  }

  /**
   * Get user's circle memberships
   */
  async getUserCircles(): Promise<CircleMemberDetail[]> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { data, error } = await supabase
        .rpc('get_user_study_circles', {
          p_user_id: this.userId,
        });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        circleId: row.circle_id,
        circleName: row.circle_name,
        role: row.role,
        memberCount: row.member_count,
        weeklyGoalMinutes: row.weekly_goal_minutes,
        currentWeekProgress: row.current_week_progress,
        isMember: row.is_member,
        canPost: row.can_post,
      }));
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get user circles:', error.message);
      throw error;
    }
  }

  /**
   * Get circle details
   */
  async getCircle(circleId: string): Promise<StudyCircle | null> {
    try {
      const { data, error } = await supabase
        .from('study_circles')
        .select('*')
        .eq('id', circleId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapRowToCircle(data as StudyCircleRow);
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get circle:', error.message);
      throw error;
    }
  }

  /**
   * Join a study circle
   */
  async joinCircle(circleId: string): Promise<boolean> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { data, error } = await supabase
        .rpc('join_study_circle', {
          p_circle_id: circleId,
          p_user_id: this.userId,
        });

      if (error) throw error;

      const success = data as boolean;
      if (success) {
        debug.info('Joined study circle', { circleId, userId: this.userId });
      }

      return success;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to join circle:', error.message);
      throw error;
    }
  }

  /**
   * Leave a study circle
   */
  async leaveCircle(circleId: string): Promise<boolean> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { data, error } = await supabase
        .rpc('leave_study_circle', {
          p_circle_id: circleId,
          p_user_id: this.userId,
        });

      if (error) throw error;

      const success = data as boolean;
      if (success) {
        debug.info('Left study circle', { circleId, userId: this.userId });
      }

      return success;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to leave circle:', error.message);
      throw error;
    }
  }

  /**
   * Get circle members
   */
  async getCircleMembers(circleId: string): Promise<CircleMember[]> {
    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select(`
          *,
          auth.users!inner(
            raw_user_meta_data
          )
        `)
        .eq('circle_id', circleId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        circleId: row.circle_id,
        userId: row.user_id,
        role: row.role,
        joinedAt: new Date(row.joined_at).getTime(),
        lastActiveAt: new Date(row.last_active_at).getTime(),
        isActive: row.is_active,
        sessionsCompleted: row.sessions_completed,
        totalFocusTime: row.total_focus_time,
        weeklyContribution: row.weekly_contribution,
        streakDays: row.streak_days,
        permissions: row.permissions || [],
      }));
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get circle members:', error.message);
      throw error;
    }
  }

  /**
   * Update circle member contribution
   */
  async updateMemberContribution(
    circleId: string,
    contribution: {
      sessionsCompleted?: number;
      focusTimeMinutes?: number;
      weeklyContribution?: number;
    }
  ): Promise<void> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const updateData: Record<string, unknown> = {
        last_active_at: new Date().toISOString(),
      };

      if (contribution.sessionsCompleted !== undefined) {
        updateData.sessions_completed = contribution.sessionsCompleted;
      }
      if (contribution.focusTimeMinutes !== undefined) {
        updateData.total_focus_time = contribution.focusTimeMinutes;
      }
      if (contribution.weeklyContribution !== undefined) {
        updateData.weekly_contribution = contribution.weeklyContribution;
      }

      const { error } = await supabase
        .from('circle_members')
        .update(updateData)
        .eq('circle_id', circleId)
        .eq('user_id', this.userId);

      if (error) throw error;

      debug.info('Member contribution updated', { circleId, contribution });
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to update contribution:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Activity Feed
  // ============================================================================

  /**
   * Get circle activity feed
   */
  async getActivityFeed(circleId: string, limit: number = 20): Promise<ActivityFeed> {
    try {
      const { data, error } = await supabase
        .rpc('get_circle_activity_feed', {
          p_circle_id: circleId,
          p_limit: limit,
        });

      if (error) throw error;

      const activities = (data || []).map((row: any) => ({
        id: row.id,
        circleId,
        userId: row.user_id,
        type: row.type,
        data: row.data,
        createdAt: new Date(row.created_at).getTime(),
        userDisplayName: row.user_display_name,
        userAvatarUrl: row.user_avatar_url,
      }));

      return {
        circleId,
        activities,
        hasMore: activities.length === limit,
        lastReadAt: Date.now(), // Would be stored in user preferences
        unreadCount: 0, // Would calculate based on lastReadAt
      };
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get activity feed:', error.message);
      throw error;
    }
  }

  /**
   * Add activity to circle
   */
  async addActivity(
    circleId: string,
    type: string,
    data: Record<string, unknown>
  ): Promise<void> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { error } = await supabase
        .from('circle_activities')
        .insert({
          circle_id: circleId,
          user_id: this.userId,
          type,
          data,
        });

      if (error) throw error;

      debug.info('Activity added to circle', { circleId, type });
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to add activity:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Weekly Checks
  // ============================================================================

  /**
   * Create or update weekly check
   */
  async upsertWeeklyCheck(
    circleId: string,
    weekStart: Date,
    memberGoals: Array<{
      userId: string;
      goalMinutes: number;
      actualMinutes: number;
      completed: boolean;
    }>
  ): Promise<WeeklyCheck> {
    try {
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      const totalGoal = memberGoals.reduce((sum, goal) => sum + goal.goalMinutes, 0);
      const totalActual = memberGoals.reduce((sum, goal) => sum + goal.actualMinutes, 0);
      const allCompleted = memberGoals.every(goal => goal.completed);

      const { data: result, error } = await supabase
        .from('circle_weekly_checks')
        .upsert({
          circle_id: circleId,
          week_start: weekStart.toISOString(),
          week_end: weekEnd.toISOString(),
          member_goals: JSON.stringify(memberGoals),
          total_goal_minutes: totalGoal,
          total_actual_minutes: totalActual,
          percent_complete: totalGoal > 0 ? (totalActual / totalGoal) * 100 : 0,
          all_members_met_goal: allCompleted,
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to upsert weekly check: ${error.message}`);

      debug.info('Weekly check upserted', { circleId, weekStart, allCompleted });

      return {
        id: result.id,
        circleId,
        weekStart: weekStart.getTime(),
        weekEnd: weekEnd.getTime(),
        memberGoals,
        totalGoalMinutes: totalGoal,
        totalActualMinutes: totalActual,
        percentComplete: totalGoal > 0 ? (totalActual / totalGoal) * 100 : 0,
        allMembersMetGoal: allCompleted,
      };
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to upsert weekly check:', error.message);
      throw error;
    }
  }

  /**
   * Get current week check
   */
  async getCurrentWeekCheck(circleId: string): Promise<WeeklyCheck | null> {
    try {
      // Get current week start (Monday)
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      monday.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('circle_weekly_checks')
        .select('*')
        .eq('circle_id', circleId)
        .gte('week_start', monday.toISOString())
        .order('week_start', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) return null;

      const row = data as WeeklyCheckRow;

      return {
        id: row.id,
        circleId,
        weekStart: new Date(row.week_start).getTime(),
        weekEnd: new Date(row.week_end).getTime(),
        memberGoals: JSON.parse(row.member_goals),
        totalGoalMinutes: row.total_goal_minutes,
        totalActualMinutes: row.total_actual_minutes,
        percentComplete: row.percent_complete,
        allMembersMetGoal: row.all_members_met_goal,
      };
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get current week check:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Invites
  // ============================================================================

  /**
   * Create circle invite
   */
  async createInvite(
    circleId: string,
    invitedUserId: string
  ): Promise<CircleInvite> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { data: result, error } = await supabase
        .from('circle_invites')
        .insert({
          circle_id: circleId,
          invited_by_user_id: this.userId,
          invited_user_id: invitedUserId,
          status: 'PENDING',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      debug.info('Circle invite created', { circleId, invitedUserId });

      return this.mapRowToInvite(result as CircleInviteRow);
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to create invite:', error.message);
      throw error;
    }
  }

  /**
   * Get user's circle invites
   */
  async getUserInvites(): Promise<CircleInvite[]> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { data, error } = await supabase
        .from('circle_invites')
        .select(`
          *,
          study_circles!inner(
            name,
            description
          )
        `)
        .or(`invited_user_id.eq.${this.userId},invited_by_user_id.eq.${this.userId}`)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        circleId: row.circle_id,
        invitedByUserId: row.invited_by_user_id,
        invitedUserId: row.invited_user_id,
        status: row.status,
        createdAt: new Date(row.created_at).getTime(),
        expiresAt: new Date(row.expires_at).getTime(),
        circleName: row.name,
        circleDescription: row.description,
      }));
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get user invites:', error.message);
      throw error;
    }
  }

  /**
   * Respond to invite
   */
  async respondToInvite(
    inviteId: string,
    accept: boolean
  ): Promise<boolean> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { error } = await supabase
        .from('circle_invites')
        .update({
          status: accept ? 'ACCEPTED' : 'DECLINED',
        })
        .eq('id', inviteId)
        .eq('invited_user_id', this.userId);

      if (error) throw error;

      debug.info('Invite responded', { inviteId, accept });

      return true;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to respond to invite:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private mapRowToCircle(row: StudyCircleRow): StudyCircle {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      avatarUrl: row.avatar_url,
      bannerUrl: row.banner_url,
      memberCount: row.member_count,
      maxMembers: row.max_members,
      totalFocusTime: row.total_focus_time,
      completedSessions: row.completed_sessions,
      weeklyGoalMinutes: row.weekly_goal_minutes,
      currentWeekProgress: row.current_week_progress,
      isPublic: row.is_public,
      joinRequirements: row.join_requirements as any,
      createdAt: new Date(row.created_at).getTime(),
      updatedAt: new Date(row.updated_at).getTime(),
      createdBy: row.created_by,
    };
  }

  private mapRowToInvite(row: CircleInviteRow): CircleInvite {
    return {
      id: row.id,
      circleId: row.circle_id,
      invitedByUserId: row.invited_by_user_id,
      invitedUserId: row.invited_user_id,
      status: row.status as any,
      createdAt: new Date(row.created_at).getTime(),
      expiresAt: new Date(row.expires_at).getTime(),
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let repository: StudyCirclesRepository | null = null;

export function getStudyCirclesRepository(): StudyCirclesRepository {
  if (!repository) {
    repository = new StudyCirclesRepository();
  }
  return repository;
}

export function resetStudyCirclesRepository(): void {
  repository = null;
}
