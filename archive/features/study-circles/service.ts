/**
 * Study Circles Service
 *
 * Business logic for async accountability groups.
 * Handles circle management, weekly goals, and member contributions.
 *
 * @phase 3
 */

import { createDebugger } from '../../utils/debug';
import { getStudyCirclesRepository } from './repository';
import { getAnalyticsService } from '../analytics';
import { getNotificationService } from '../notifications';
import type {
  StudyCircle,
  CircleMember,
  WeeklyCheck,
  ActivityFeed,
  CircleInvite,
  CircleJoinRequirement,
} from './types';

const debug = createDebugger('study-circles:service');

// ============================================================================
// Service
// ============================================================================

export class StudyCirclesService {
  private repository = getStudyCirclesRepository();
  private analyticsService = getAnalyticsService();
  private notificationService = getNotificationService();
  private userId: string | null = null;

  setUserId(userId: string): void {
    this.userId = userId;
    this.repository.setUserId(userId);
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
    joinRequirements?: CircleJoinRequirement;
  }): Promise<StudyCircle> {
    if (!this.userId) throw new Error('User ID not set');

    const circle = await this.repository.createCircle({
      name: data.name,
      description: data.description,
      avatarUrl: data.avatarUrl,
      bannerUrl: data.bannerUrl,
      maxMembers: data.maxMembers || 6,
      weeklyGoalMinutes: data.weeklyGoalMinutes || 120,
      isPublic: data.isPublic || false,
      joinRequirements: data.joinRequirements || 'APPROVAL',
    });

    // Track analytics
    this.analyticsService.track('circle_created', {
      circleId: circle.id,
      name: circle.name,
      maxMembers: circle.maxMembers,
      weeklyGoalMinutes: circle.weeklyGoalMinutes,
    });

    debug.info('Study circle created', { 
      userId: this.userId, 
      circleId: circle.id,
      name: circle.name 
    });

    return circle;
  }

  /**
   * Join a study circle
   */
  async joinCircle(circleId: string): Promise<{
    success: boolean;
    error?: string;
    circle?: StudyCircle;
  }> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const success = await this.repository.joinCircle(circleId);
      
      if (success) {
        const circle = await this.repository.getCircle(circleId);
        
        // Track analytics
        this.analyticsService.track('circle_joined', {
          circleId,
          name: circle?.name,
        });

        // Notify circle members
        if (circle) {
          await this.notificationService.sendCircleNotification(circleId, {
            type: 'MEMBER_JOINED',
            userId: this.userId,
            data: { memberName: 'New member' }, // Would get from user profile
          });
        }

        debug.info('Joined study circle', { 
          userId: this.userId, 
          circleId,
          name: circle?.name 
        });

        return { success: true, circle };
      }

      return { success: false, error: 'Failed to join circle' };
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to join circle:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Leave a study circle
   */
  async leaveCircle(circleId: string): Promise<boolean> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const circle = await this.repository.getCircle(circleId);
      const success = await this.repository.leaveCircle(circleId);

      if (success && circle) {
        // Track analytics
        this.analyticsService.track('circle_left', {
          circleId,
          name: circle.name,
        });

        // Notify circle members
        await this.notificationService.sendCircleNotification(circleId, {
          type: 'MEMBER_LEFT',
          userId: this.userId,
          data: { memberName: 'Member left' },
        });

        debug.info('Left study circle', { 
          userId: this.userId, 
          circleId,
          name: circle.name 
        });
      }

      return success;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to leave circle:', error.message);
      throw error;
    }
  }

  /**
   * Get user's circle memberships
   */
  async getUserCircles(): Promise<CircleMemberDetail[]> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const memberships = await this.repository.getUserCircles();
      
      // Enrich with additional data
      const enrichedMemberships = await Promise.all(
        memberships.map(async (membership) => {
          const circle = await this.repository.getCircle(membership.circleId);
          const members = circle ? await this.repository.getCircleMembers(membership.circleId) : [];
          
          return {
            ...membership,
            circleName: circle?.name || 'Unknown Circle',
            memberCount: members.length,
            // Would add user display name, avatar, etc.
          };
        })
      );

      return enrichedMemberships;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get user circles:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Member Contributions
  // ============================================================================

  /**
   * Update member contribution after session
   */
  async updateMemberContribution(
    circleId: string,
    sessionData: {
      durationMinutes: number;
      completed: boolean;
    }
  ): Promise<void> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      await this.repository.updateMemberContribution(circleId, {
        sessionsCompleted: sessionData.completed ? 1 : 0,
        focusTimeMinutes: sessionData.durationMinutes,
        weeklyContribution: sessionData.durationMinutes,
      });

      // Add activity to feed
      if (sessionData.completed) {
        await this.repository.addActivity(circleId, 'SESSION_COMPLETED', {
          duration: sessionData.durationMinutes,
        });
      }

      // Check weekly goal progress
      await this.checkWeeklyProgress(circleId);

      debug.info('Member contribution updated', { 
        userId: this.userId, 
        circleId,
        duration: sessionData.durationMinutes,
        completed: sessionData.completed 
      });
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to update contribution:', error.message);
      throw error;
    }
  }

  /**
   * Check and update weekly goal progress
   */
  private async checkWeeklyProgress(circleId: string): Promise<void> {
    try {
      const circle = await this.repository.getCircle(circleId);
      if (!circle) return;

      const members = await this.repository.getCircleMembers(circleId);
      const currentWeek = await this.repository.getCurrentWeekCheck(circleId);

      // Calculate current week progress
      const memberGoals = members.map(member => ({
        userId: member.userId,
        goalMinutes: circle.weeklyGoalMinutes,
        actualMinutes: member.weeklyContribution,
        completed: member.weeklyContribution >= circle.weeklyGoalMinutes,
      }));

      const totalGoal = memberGoals.reduce((sum, goal) => sum + goal.goalMinutes, 0);
      const totalActual = memberGoals.reduce((sum, goal) => sum + goal.actualMinutes, 0);
      const allCompleted = memberGoals.every(goal => goal.completed);

      // Create/update weekly check
      await this.repository.upsertWeeklyCheck(circleId, new Date(), memberGoals);

      // Update circle progress
      if (circle.currentWeekProgress !== totalActual) {
        // This would update the circle's current_week_progress field
        // For now, we'll track it in the weekly check
      }

      // Send notification if goal is met
      if (allCompleted && !currentWeek?.allMembersMetGoal) {
        await this.notificationService.sendCircleNotification(circleId, {
          type: 'WEEKLY_GOAL_MET',
          data: {
            totalMinutes: totalActual,
            goalMinutes: totalGoal,
            memberCount: members.length,
          },
        });

        // Track analytics
        this.analyticsService.track('weekly_goal_met', {
          circleId,
          totalMinutes: totalActual,
          goalMinutes: totalGoal,
          memberCount: members.length,
        });
      }

      debug.info('Weekly progress checked', { 
        circleId,
        totalActual,
        totalGoal,
        allCompleted 
      });
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to check weekly progress:', error.message);
    }
  }

  // ============================================================================
  // Activity Feed
  // ============================================================================

  /**
   * Get circle activity feed
   */
  async getActivityFeed(
    circleId: string,
    limit: number = 20
  ): Promise<ActivityFeed> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const feed = await this.repository.getActivityFeed(circleId, limit);
      
      // Mark activities as read (would update user preferences)
      // For now, just return the feed

      debug.info('Activity feed retrieved', { 
        circleId, 
        activityCount: feed.activities.length 
      });

      return feed;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get activity feed:', error.message);
      throw error;
    }
  }

  /**
   * Add activity to circle feed
   */
  async addActivity(
    circleId: string,
    type: string,
    data: Record<string, unknown>
  ): Promise<void> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      await this.repository.addActivity(circleId, type, data);

      debug.info('Activity added', { 
        userId: this.userId, 
        circleId, 
        type,
        data 
      });
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to add activity:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Invites
  // ============================================================================

  /**
   * Create circle invite
   */
  async createInvite(circleId: string, invitedUserId: string): Promise<CircleInvite> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const invite = await this.repository.createInvite(circleId, invitedUserId);

      // Send notification to invited user
      await this.notificationService.sendUserNotification(invitedUserId, {
        type: 'CIRCLE_INVITE',
        data: {
          circleId,
          inviterName: 'User', // Would get from profile
        },
      });

      // Track analytics
      this.analyticsService.track('circle_invite_sent', {
        circleId,
        invitedUserId,
      });

      debug.info('Circle invite created', { 
        userId: this.userId, 
        circleId,
        invitedUserId 
      });

      return invite;
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
      const invites = await this.repository.getUserInvites();

      debug.info('User invites retrieved', { 
        userId: this.userId, 
        inviteCount: invites.length 
      });

      return invites;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get user invites:', error.message);
      throw error;
    }
  }

  /**
   * Respond to circle invite
   */
  async respondToInvite(
    inviteId: string,
    accept: boolean
  ): Promise<boolean> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const success = await this.repository.respondToInvite(inviteId, accept);

      if (success) {
        // Track analytics
        this.analyticsService.track('circle_invite_responded', {
          inviteId,
          accepted: accept,
        });

        debug.info('Invite responded', { 
          userId: this.userId, 
          inviteId,
          accept 
        });
      }

      return success;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to respond to invite:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Circle Discovery
  // ============================================================================

  /**
   * Get public circles for discovery
   */
  async getPublicCircles(limit: number = 20): Promise<StudyCircle[]> {
    try {
      // This would query study_circles table where is_public = true
      // For now, return empty array
      const publicCircles: StudyCircle[] = [];

      debug.info('Public circles retrieved', { 
        count: publicCircles.length 
      });

      return publicCircles;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get public circles:', error.message);
      throw error;
    }
  }

  /**
   * Search circles by name
   */
  async searchCircles(query: string, limit: number = 10): Promise<StudyCircle[]> {
    try {
      // This would implement search functionality
      // For now, return empty array
      const searchResults: StudyCircle[] = [];

      debug.info('Circle search performed', { 
        query, 
        resultCount: searchResults.length 
      });

      return searchResults;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to search circles:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Circle Management (Admin)
  // ============================================================================

  /**
   * Update circle settings
   */
  async updateCircleSettings(
    circleId: string,
    settings: {
      name?: string;
      description?: string;
      weeklyGoalMinutes?: number;
      isPublic?: boolean;
      joinRequirements?: CircleJoinRequirement;
    }
  ): Promise<StudyCircle> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      // This would update the circle record
      // For now, just return the existing circle
      const circle = await this.repository.getCircle(circleId);
      if (!circle) throw new Error('Circle not found');

      const updatedCircle = {
        ...circle,
        ...settings,
      };

      debug.info('Circle settings updated', { 
        userId: this.userId, 
        circleId,
        settings 
      });

      return updatedCircle;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to update circle settings:', error.message);
      throw error;
    }
  }

  /**
   * Remove member from circle (admin action)
   */
  async removeMember(circleId: string, memberUserId: string): Promise<boolean> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      // Check if user is circle founder
      const membership = await this.repository.getUserCircles();
      const userMembership = membership.find(m => m.circleId === circleId);
      
      if (!userMembership || userMembership.role !== 'FOUNDER') {
        throw new Error('Only circle founders can remove members');
      }

      // Remove member
      const success = await this.repository.leaveCircle(circleId);

      if (success) {
        // Track analytics
        this.analyticsService.track('circle_member_removed', {
          circleId,
          removedUserId: memberUserId,
          removedByUserId: this.userId,
        });

        debug.info('Member removed from circle', { 
          circleId,
          removedUserId: memberUserId,
          removedByUserId: this.userId 
        });
      }

      return success;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to remove member:', error.message);
      throw error;
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let service: StudyCirclesService | null = null;

export function getStudyCirclesService(): StudyCirclesService {
  if (!service) {
    service = new StudyCirclesService();
  }
  return service;
}

export function resetStudyCirclesService(): void {
  service = null;
}
