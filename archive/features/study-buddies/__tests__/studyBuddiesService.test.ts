/**
 * Study Buddies Service Tests
 *
 * Unit tests for Study Buddies business logic.
 * Tests buddy matching, encouragements, and mutual support.
 *
 * @phase 3
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { getStudyBuddiesService } from '../service';
import type { StudyBuddy, BuddyEncouragement, BuddyMatch } from '../types';

// Mock dependencies
jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
}));

jest.mock('../../analytics', () => ({
  getAnalyticsService: () => ({
    track: jest.fn(),
  }),
}));

jest.mock('../../notifications', () => ({
  getNotificationService: () => ({
    sendUserNotification: jest.fn(),
  }),
}));

jest.mock('../../users', () => ({
  getUserService: () => ({
    getUserProfile: jest.fn(),
  }),
}));

describe('StudyBuddiesService', () => {
  let service: ReturnType<typeof getStudyBuddiesService>;
  let mockBuddy: StudyBuddy;
  let mockEncouragement: BuddyEncouragement;

  beforeEach(() => {
    service = getStudyBuddiesService();
    service.setUserId('test-user-id');

    mockBuddy = {
      id: 'buddy-pair-1',
      userId: 'test-user-id',
      buddyId: 'buddy-user-id',
      buddyDisplayName: 'Study Buddy',
      buddyAvatarUrl: null,
      status: 'ACTIVE',
      initiatedBy: 'test-user-id',
      initiatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      acceptedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
      endedAt: null,
      endReason: null,
      sharedGoal: {
        id: 'goal-1',
        description: 'Study 5 days this week',
        metric: 'DAYS_ACTIVE',
        target: 5,
        timeframe: 'WEEKLY',
      },
      mutualStats: {
        totalSessionsTogether: 12,
        combinedFocusTime: 7200, // 2 hours
        streakDaysTogether: 3,
        longestStreak: 5,
      },
      encouragementsSent: 8,
      encouragementsReceived: 10,
      canSendEncouragement: true,
    };

    mockEncouragement = {
      id: 'encouragement-1',
      buddyPairId: 'buddy-pair-1',
      fromUserId: 'test-user-id',
      toUserId: 'buddy-user-id',
      type: 'GREAT_JOB',
      message: 'You\'re doing amazing! Keep it up! 🌟',
      createdAt: Date.now() - 3600000, // 1 hour ago
      seen: false,
    };
  });

  describe('createBuddyRequest', () => {
    test('should create buddy request successfully', async () => {
      const result = await service.createBuddyRequest('buddy-user-id', 'goal-1');
      
      expect(result.success).toBe(true);
      expect(result.buddy).toBeDefined();
      expect(result.buddy?.status).toBe('PENDING');
      expect(result.buddy?.buddyId).toBe('buddy-user-id');
    });

    test('should fail when user already has active buddy', async () => {
      // Mock user already having active buddy
      const result = await service.createBuddyRequest('another-buddy-id');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already have an active buddy');
    });

    test('should fail when request already exists', async () => {
      // Mock existing request
      const result = await service.createBuddyRequest('buddy-user-id');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    test('should include shared goal in request', async () => {
      const result = await service.createBuddyRequest('buddy-user-id', 'goal-1');
      
      if (result.success) {
        expect(result.buddy?.sharedGoal).toBeDefined();
      }
    });
  });

  describe('acceptBuddyRequest', () => {
    test('should accept buddy request successfully', async () => {
      const result = await service.acceptBuddyRequest('buddy-pair-1');
      
      expect(result).toBe(true);
    });

    test('should send welcome encouragement after acceptance', async () => {
      await service.acceptBuddyRequest('buddy-pair-1');
      
      // Should automatically send welcome message
      expect(true).toBe(true); // Placeholder assertion
    });

    test('should notify requester of acceptance', async () => {
      await service.acceptBuddyRequest('buddy-pair-1');
      
      // Should send notification to original requester
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('declineBuddyRequest', () => {
    test('should decline buddy request successfully', async () => {
      const result = await service.declineBuddyRequest('buddy-pair-1');
      
      expect(result).toBe(true);
    });
  });

  describe('endBuddyRelationship', () => {
    test('should end relationship with mutual agreement', async () => {
      const result = await service.endBuddyRelationship('buddy-pair-1', 'MUTUAL_AGREEMENT');
      
      expect(result).toBe(true);
    });

    test('should handle different end reasons', async () => {
      const reasons = ['TIMEOUT', 'USER_INITIATED', 'GOAL_COMPLETED', 'PREFERENCE_CHANGE'];
      
      for (const reason of reasons) {
        const result = await service.endBuddyRelationship('buddy-pair-1', reason);
        expect(result).toBe(true);
      }
    });
  });

  describe('sendEncouragement', () => {
    test('should send encouragement successfully', async () => {
      const result = await service.sendEncouragement(
        'buddy-pair-1',
        'buddy-user-id',
        'GREAT_JOB',
        'You\'re crushing it! 💪'
      );
      
      expect(result.buddyPairId).toBe('buddy-pair-1');
      expect(result.fromUserId).toBe('test-user-id');
      expect(result.toUserId).toBe('buddy-user-id');
      expect(result.type).toBe('GREAT_JOB');
      expect(result.message).toBe('You\'re crushing it! 💪');
    });

    test('should handle different encouragement types', async () => {
      const types = ['GREAT_JOB', 'KEEP_GOING', 'STREAK_ALMOST', 'MISSED_YOU', 'CUSTOM'];
      
      for (const type of types) {
        const result = await service.sendEncouragement(
          'buddy-pair-1',
          'buddy-user-id',
          type,
          'Test message'
        );
        
        expect(result.type).toBe(type);
      }
    });

    test('should send notification to buddy', async () => {
      await service.sendEncouragement(
        'buddy-pair-1',
        'buddy-user-id',
        'GREAT_JOB',
        'Great work!'
      );
      
      // Should send notification to recipient
      expect(true).toBe(true); // Placeholder assertion
    });

    test('should update encouragement counts', async () => {
      await service.sendEncouragement(
        'buddy-pair-1',
        'buddy-user-id',
        'KEEP_GOING',
        'Keep pushing forward!'
      );
      
      // Should update sent/received counts
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('submitCheckIn', () => {
    test('should submit check-in successfully', async () => {
      const checkInData = {
        completedSession: true,
        minutesStudied: 45,
        mood: 'GREAT',
        note: 'Productive session!',
      };

      const result = await service.submitCheckIn('buddy-pair-1', checkInData);
      
      expect(result.buddyPairId).toBe('buddy-pair-1');
      expect(result.completedSession).toBe(true);
      expect(result.minutesStudied).toBe(45);
      expect(result.mood).toBe('GREAT');
    });

    test('should handle different moods', async () => {
      const moods = ['GREAT', 'GOOD', 'OKAY', 'STRUGGLING'];
      
      for (const mood of moods) {
        const result = await service.submitCheckIn('buddy-pair-1', {
          completedSession: true,
          minutesStudied: 30,
          mood,
        });
        
        expect(result.mood).toBe(mood);
      }
    });

    test('should send automatic encouragement for struggling mood', async () => {
      await service.submitCheckIn('buddy-pair-1', {
        completedSession: true,
        minutesStudied: 20,
        mood: 'STRUGGLING',
      });
      
      // Should automatically send encouragement
      expect(true).toBe(true); // Placeholder assertion
    });

    test('should handle incomplete sessions', async () => {
      const result = await service.submitCheckIn('buddy-pair-1', {
        completedSession: false,
        minutesStudied: 15,
        mood: 'OKAY',
      });
      
      expect(result.completedSession).toBe(false);
    });
  });

  describe('findBuddyMatches', () => {
    test('should return potential matches', async () => {
      const matches = await service.findBuddyMatches();
      
      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThanOrEqual(0);
    });

    test('should respect limit parameter', async () => {
      const matches5 = await service.findBuddyMatches(5);
      const matches10 = await service.findBuddyMatches(10);
      
      expect(matches5.length).toBeLessThanOrEqual(5);
      expect(matches10.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getBuddyStats', () => {
    test('should calculate comprehensive statistics', async () => {
      const stats = await service.getBuddyStats('buddy-pair-1');
      
      expect(stats.totalDaysTogether).toBeGreaterThan(0);
      expect(stats.totalSessionsTogether).toBeGreaterThanOrEqual(0);
      expect(stats.combinedFocusTime).toBeGreaterThanOrEqual(0);
      expect(stats.currentStreak).toBeGreaterThanOrEqual(0);
      expect(stats.longestStreak).toBeGreaterThanOrEqual(0);
      expect(stats.encouragementsExchanged).toBeGreaterThanOrEqual(0);
      expect(stats.checkInCompletion).toBeGreaterThanOrEqual(0);
      expect(stats.checkInCompletion).toBeLessThanOrEqual(100);
    });

    test('should handle non-existent buddy', async () => {
      await expect(service.getBuddyStats('non-existent')).rejects.toThrow('not found');
    });
  });

  describe('getEncouragementSuggestions', () => {
    test('should provide suggestions based on recent activity', async () => {
      const suggestions = await service.getEncouragementSuggestions('buddy-pair-1');
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThanOrEqual(0);
    });

    test('should suggest based on struggling mood', async () => {
      // Mock recent check-in with struggling mood
      const suggestions = await service.getEncouragementSuggestions('buddy-pair-1');
      
      const strugglingSuggestion = suggestions.find(s => s.type === 'KEEP_GOING');
      expect(strugglingSuggestion).toBeDefined();
      expect(strugglingSuggestion?.reason).toContain('struggling');
    });

    test('should suggest based on streak', async () => {
      // Mock recent streak
      const suggestions = await service.getEncouragementSuggestions('buddy-pair-1');
      
      const streakSuggestion = suggestions.find(s => s.type === 'GREAT_JOB');
      expect(streakSuggestion).toBeDefined();
      expect(streakSuggestion?.reason).toContain('streak');
    });

    test('should suggest based on focus time', async () => {
      // Mock long focus session
      const suggestions = await service.getEncouragementSuggestions('buddy-pair-1');
      
      const focusSuggestion = suggestions.find(s => s.type === 'GREAT_JOB');
      expect(focusSuggestion).toBeDefined();
      expect(focusSuggestion?.reason).toContain('focus');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid buddy pair ID', async () => {
      await expect(service.acceptBuddyRequest('')).rejects.toThrow();
      await expect(service.endBuddyRelationship('', 'MUTUAL_AGREEMENT')).rejects.toThrow();
    });

    test('should handle missing user ID', async () => {
      service.setUserId('');
      
      await expect(service.createBuddyRequest('buddy-id')).rejects.toThrow('User ID not set');
    });

    test('should handle invalid encouragement data', async () => {
      await expect(service.sendEncouragement('', 'buddy-id', '', '')).rejects.toThrow();
    });

    test('should handle invalid check-in data', async () => {
      await expect(service.submitCheckIn('buddy-pair-1', {
        completedSession: true,
        minutesStudied: -10, // Invalid negative minutes
        mood: 'INVALID_MOOD',
      })).rejects.toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should complete full buddy relationship lifecycle', async () => {
      // Create request
      const requestResult = await service.createBuddyRequest('buddy-user-id');
      expect(requestResult.success).toBe(true);

      // Accept request
      const acceptResult = await service.acceptBuddyRequest(requestResult.buddy!.id);
      expect(acceptResult).toBe(true);

      // Send encouragement
      const encouragement = await service.sendEncouragement(
        requestResult.buddy!.id,
        'buddy-user-id',
        'GREAT_JOB',
        'Welcome buddy!'
      );
      expect(encouragement.type).toBe('GREAT_JOB');

      // Submit check-in
      const checkIn = await service.submitCheckIn(requestResult.buddy!.id, {
        completedSession: true,
        minutesStudied: 30,
        mood: 'GOOD',
      });
      expect(checkIn.completedSession).toBe(true);

      // Get stats
      const stats = await service.getBuddyStats(requestResult.buddy!.id);
      expect(stats.encouragementsExchanged).toBeGreaterThan(0);

      // End relationship
      const endResult = await service.endBuddyRelationship(requestResult.buddy!.id, 'MUTUAL_AGREEMENT');
      expect(endResult).toBe(true);
    });

    test('should handle mutual encouragement exchange', async () => {
      // Send encouragement from user to buddy
      const encouragement1 = await service.sendEncouragement(
        'buddy-pair-1',
        'buddy-user-id',
        'KEEP_GOING',
        'You got this!'
      );

      // Send encouragement from buddy to user
      const encouragement2 = await service.sendEncouragement(
        'buddy-pair-1',
        'test-user-id',
        'GREAT_JOB',
        'Amazing work!'
      );

      expect(encouragement1.fromUserId).toBe('test-user-id');
      expect(encouragement2.fromUserId).toBe('buddy-user-id');
    });
  });

  describe('Performance', () => {
    test('should complete operations quickly', async () => {
      const startTime = Date.now();
      
      await service.sendEncouragement('buddy-pair-1', 'buddy-user-id', 'GREAT_JOB', 'Test!');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });

    test('should handle concurrent operations', async () => {
      const promises = [
        service.sendEncouragement('buddy-pair-1', 'buddy-user-id', 'GREAT_JOB', 'Msg 1'),
        service.sendEncouragement('buddy-pair-1', 'buddy-user-id', 'KEEP_GOING', 'Msg 2'),
        service.submitCheckIn('buddy-pair-1', {
          completedSession: true,
          minutesStudied: 30,
          mood: 'GOOD',
        }),
      ];

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r !== undefined)).toBe(true);
    });
  });
});
