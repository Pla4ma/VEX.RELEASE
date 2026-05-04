/**
 * Study Buddies Service
 *
 * Business logic for non-competitive accountability pairs.
 * Handles buddy matching, mutual support, and encouragement.
 *
 * @phase 3
 */

import { createDebugger } from '../../../utils/debug';
import { getStudyBuddiesRepository } from './repository';
import { getAnalyticsService } from '../analytics';
import { getNotificationService } from '../notifications';
import { getUserService } from '../users';
import type {
  StudyBuddy,
  SharedGoal,
  BuddyEncouragement,
  BuddyCheckIn,
  BuddyMatch,
  BuddyPreferences,
} from './types';

const debug = createDebugger('study-buddies:service');

// ============================================================================
// Service
// ============================================================================

export class StudyBuddiesService {
  private repository = getStudyBuddiesRepository();
  private analyticsService = getAnalyticsService();
  private notificationService = getNotificationService();
  private userService = getUserService();
  private userId: string | null = null;

  setUserId(userId: string): void {
    this.userId = userId;
    this.repository.setUserId(userId);
  }

  // ============================================================================
  // Buddy Management
  // ============================================================================

  /**
   * Create a new buddy request
   */
  async createBuddyRequest(
    buddyId: string,
    sharedGoalId?: string
  ): Promise<{
    success: boolean;
    error?: string;
    buddy?: StudyBuddy;
  }> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      // Check if user already has active buddy
      const existingBuddies = await this.repository.getUserBuddies();
      const activeBuddy = existingBuddies.find(b => b.status === 'ACTIVE');
      
      if (activeBuddy) {
        return { 
          success: false, 
          error: 'You already have an active buddy relationship' 
        };
      }

      // Check if request already exists
      const existingRequest = existingBuddies.find(
        b => (b.buddyId === buddyId && b.status === 'PENDING')
      );
      
      if (existingRequest) {
        return { 
          success: false, 
          error: 'A buddy request already exists' 
        };
      }

      const buddy = await this.repository.createBuddyRequest(buddyId, sharedGoalId);

      // Track analytics
      this.analyticsService.track('buddy_request_created', {
        buddyId,
        sharedGoalId,
      });

      // Send notification to potential buddy
      await this.notificationService.sendUserNotification(buddyId, {
        type: 'BUDDY_REQUEST',
        data: {
          requesterId: this.userId,
          requesterName: 'User', // Would get from profile
          sharedGoalId,
        },
      });

      debug.info('Buddy request created', { 
        userId: this.userId, 
        buddyId,
        sharedGoalId 
      });

      return { success: true, buddy };
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to create buddy request:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Accept a buddy request
   */
  async acceptBuddyRequest(buddyPairId: string): Promise<boolean> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const success = await this.repository.acceptBuddyRequest(buddyPairId);

      if (success) {
        // Track analytics
        this.analyticsService.track('buddy_request_accepted', {
          buddyPairId,
        });

        // Get buddy info for notification
        const buddies = await this.repository.getUserBuddies();
        const buddy = buddies.find(b => b.id === buddyPairId);

        if (buddy) {
          // Send notification to requester
          await this.notificationService.sendUserNotification(buddy.initiatedBy, {
            type: 'BUDDY_REQUEST_ACCEPTED',
            data: {
              buddyId: this.userId,
              buddyName: 'User', // Would get from profile
            },
          });

          // Send welcome encouragement
          await this.repository.sendEncouragement(
            buddyPairId,
            buddy.buddyId,
            'GREAT_JOB',
            "Looking forward to studying together! 🎯"
          );
        }

        debug.info('Buddy request accepted', { 
          userId: this.userId, 
          buddyPairId 
        });
      }

      return success;
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
      const success = await this.repository.declineBuddyRequest(buddyPairId);

      if (success) {
        // Track analytics
        this.analyticsService.track('buddy_request_declined', {
          buddyPairId,
        });

        debug.info('Buddy request declined', { 
          userId: this.userId, 
          buddyPairId 
        });
      }

      return success;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to decline buddy request:', error.message);
      throw error;
    }
  }

  /**
   * End buddy relationship
   */
  async endBuddyRelationship(
    buddyPairId: string,
    reason: string
  ): Promise<boolean> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const success = await this.repository.endBuddyRelationship(buddyPairId, reason);

      if (success) {
        // Track analytics
        this.analyticsService.track('buddy_relationship_ended', {
          buddyPairId,
          reason,
        });

        debug.info('Buddy relationship ended', { 
          userId: this.userId, 
          buddyPairId,
          reason 
        });
      }

      return success;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to end buddy relationship:', error.message);
      throw error;
    }
  }

  /**
   * Get user's buddy relationships
   */
  async getUserBuddies(): Promise<StudyBuddy[]> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const buddies = await this.repository.getUserBuddies();
      
      // Enrich with additional data
      const enrichedBuddies = await Promise.all(
        buddies.map(async (buddy) => {
          // Get recent check-ins
          const checkIns = await this.repository.getCheckIns(buddy.id, 7);
          
          return {
            ...buddy,
            recentCheckIns: checkIns,
          };
        })
      );

      return enrichedBuddies;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get user buddies:', error.message);
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
      const goals = await this.repository.getSharedGoals();

      debug.info('Shared goals retrieved', { count: goals.length });

      return goals;
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
    message?: string
  ): Promise<BuddyEncouragement> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const encouragement = await this.repository.sendEncouragement(
        buddyPairId,
        toUserId,
        type,
        message || ''
      );

      // Track analytics
      this.analyticsService.track('buddy_encouragement_sent', {
        buddyPairId,
        toUserId,
        type,
      });

      // Send notification to buddy
      await this.notificationService.sendUserNotification(toUserId, {
        type: 'BUDDY_ENCOURAGEMENT',
        data: {
          fromUserId: this.userId,
          fromName: 'User', // Would get from profile
          type,
          message,
        },
      });

      debug.info('Encouragement sent', { 
        userId: this.userId, 
        buddyPairId,
        toUserId,
        type 
      });

      return encouragement;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to send encouragement:', error.message);
      throw error;
    }
  }

  /**
   * Get encouragements for buddy pair
   */
  async getEncouragements(buddyPairId: string, limit: number = 20): Promise<BuddyEncouragement[]> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const encouragements = await this.repository.getEncouragements(buddyPairId, limit);

      debug.info('Encouragements retrieved', { 
        buddyPairId, 
        count: encouragements.length 
      });

      return encouragements;
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
      const checkIn = await this.repository.submitCheckIn(buddyPairId, checkInData);

      // Track analytics
      this.analyticsService.track('buddy_check_in_submitted', {
        buddyPairId,
        completedSession: checkInData.completedSession,
        minutesStudied: checkInData.minutesStudied,
        mood: checkInData.mood,
      });

      // Send automatic encouragement based on mood
      if (checkInData.mood === 'STRUGGLING') {
        const buddies = await this.repository.getUserBuddies();
        const buddy = buddies.find(b => b.id === buddyPairId);
        
        if (buddy && buddy.canSendEncouragement) {
          await this.sendEncouragement(
            buddyPairId,
            buddy.buddyId,
            'KEEP_GOING',
            "I see you're struggling. You've got this! 💪"
          );
        }
      }

      debug.info('Check-in submitted', { 
        userId: this.userId, 
        buddyPairId,
        mood: checkInData.mood 
      });

      return checkIn;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to submit check-in:', error.message);
      throw error;
    }
  }

  /**
   * Get check-ins for buddy pair
   */
  async getCheckIns(buddyPairId: string, days: number = 7): Promise<BuddyCheckIn[]> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const checkIns = await this.repository.getCheckIns(buddyPairId, days);

      debug.info('Check-ins retrieved', { 
        buddyPairId, 
        count: checkIns.length 
      });

      return checkIns;
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
  async findBuddyMatches(
    preferences?: BuddyPreferences,
    limit: number = 10
  ): Promise<BuddyMatch[]> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const matches = await this.repository.findBuddyMatches(limit);

      // Track analytics
      this.analyticsService.track('buddy_matches_searched', {
        preferences,
        limit,
        resultCount: matches.length,
      });

      debug.info('Buddy matches found', { 
        userId: this.userId, 
        count: matches.length 
      });

      return matches;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to find buddy matches:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Buddy Statistics
  // ============================================================================

  /**
   * Get buddy relationship statistics
   */
  async getBuddyStats(buddyPairId: string): Promise<{
    totalDaysTogether: number;
    totalSessionsTogether: number;
    combinedFocusTime: number;
    currentStreak: number;
    longestStreak: number;
    encouragementsExchanged: number;
    checkInCompletion: number;
  }> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const buddies = await this.repository.getUserBuddies();
      const buddy = buddies.find(b => b.id === buddyPairId);
      
      if (!buddy) {
        throw new Error('Buddy relationship not found');
      }

      const checkIns = await this.repository.getCheckIns(buddyPairId, 30);
      const completedCheckIns = checkIns.filter(ci => ci.completedSession).length;
      const completionRate = checkIns.length > 0 ? (completedCheckIns / checkIns.length) * 100 : 0;

      const stats = {
        totalDaysTogether: Math.floor((Date.now() - buddy.initiatedAt) / (1000 * 60 * 60 * 24)),
        totalSessionsTogether: buddy.mutualStats.totalSessionsTogether || 0,
        combinedFocusTime: buddy.mutualStats.combinedFocusTime || 0,
        currentStreak: buddy.mutualStats.streakDaysTogether || 0,
        longestStreak: buddy.mutualStats.longestStreak || 0,
        encouragementsExchanged: buddy.encouragementsSent + buddy.encouragementsReceived,
        checkInCompletion: completionRate,
      };

      debug.info('Buddy stats calculated', { 
        userId: this.userId, 
        buddyPairId,
        stats 
      });

      return stats;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get buddy stats:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Smart Encouragement Suggestions
  // ============================================================================

  /**
   * Get suggested encouragement messages based on buddy's recent activity
   */
  async getEncouragementSuggestions(buddyPairId: string): Promise<{
    type: string;
    message: string;
    reason: string;
  }[]> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const checkIns = await this.repository.getCheckIns(buddyPairId, 7);
      const lastCheckIn = checkIns[0];

      if (!lastCheckIn) {
        return [{
          type: 'MISSED_YOU',
          message: "Haven't seen you around. Hope everything's okay! 🤗",
          reason: 'No recent check-ins'
        }];
      }

      const suggestions = [];

      // Based on mood
      if (lastCheckIn.mood === 'STRUGGLING') {
        suggestions.push({
          type: 'KEEP_GOING',
          message: "I know it's tough, but you're doing great! Keep pushing forward 🌟",
          reason: 'Buddy is struggling'
        });
      }

      // Based on streak
      if (lastCheckIn.completedSession && checkIns.length >= 3) {
        const recentStreak = checkIns
          .slice(0, 3)
          .every(ci => ci.completedSession);
        
        if (recentStreak) {
          suggestions.push({
            type: 'GREAT_JOB',
            message: "Amazing consistency! You're on fire! 🔥",
            reason: '3+ day streak'
          });
        }
      }

      // Based on focus time
      if (lastCheckIn.minutesStudied >= 60) {
        suggestions.push({
          type: 'GREAT_JOB',
          message: "That's some serious focus time! Impressive! ⏰",
          reason: 'Long focus session'
        });
      }

      return suggestions;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get encouragement suggestions:', error.message);
      throw error;
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let service: StudyBuddiesService | null = null;

export function getStudyBuddiesService(): StudyBuddiesService {
  if (!service) {
    service = new StudyBuddiesService();
  }
  return service;
}

export function resetStudyBuddiesService(): void {
  service = null;
}
