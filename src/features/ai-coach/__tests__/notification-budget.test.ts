/**
 * AI Coach Notification Budget Tests
 * Phase 7 - P7-04 Verification
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  canSendNotification,
  sendNotificationWithBudget,
  getOrCreateNotificationBudget,
  resetDailyBudget,
  sendCoachNotification,
  getNotificationBudgetStatus,
  isInQuietHours,
  createMockNotificationBudget,
  createMockNotificationRequest,
  type NotificationBudget,
  type NotificationRequest,
} from '../notification-budget';

describe('Notification Budget', () => {
  let mockBudget: NotificationBudget;
  let mockRequest: NotificationRequest;

  beforeEach(() => {
    mockBudget = createMockNotificationBudget('user-123');
    mockRequest = createMockNotificationRequest('user-123');
  });

  describe('Daily Budget Limit', () => {
    it('should allow notifications under daily limit', async () => {
      const result = await canSendNotification(mockRequest, mockBudget);
      
      expect(result.allowed).toBe(true);
    });

    it('should block notifications when daily limit reached', async () => {
      const fullBudget = createMockNotificationBudget('user-123', {
        sentCount: 2,
        maxDaily: 2,
      });

      const result = await canSendNotification(mockRequest, fullBudget);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Daily notification limit reached');
    });

    it('should track sent notifications correctly', async () => {
      const result = await sendNotificationWithBudget(mockRequest, mockBudget);
      
      expect(result.success).toBe(true);
      expect(result.updatedBudget.sentCount).toBe(1);
      expect(result.updatedBudget.notificationsSent).toHaveLength(1);
      expect(result.notificationId).toBeDefined();
    });

    it('should not update budget when notification blocked', async () => {
      const fullBudget = createMockNotificationBudget('user-123', {
        sentCount: 2,
        maxDaily: 2,
      });

      const result = await sendNotificationWithBudget(mockRequest, fullBudget);
      
      expect(result.success).toBe(false);
      expect(result.updatedBudget.sentCount).toBe(2); // Unchanged
    });
  });

  describe('Priority Rules', () => {
    it('should always allow streak critical notifications', async () => {
      const criticalRequest = createMockNotificationRequest('user-123', {
        priority: 'STREAK_CRITICAL',
      });

      const fullBudget = createMockNotificationBudget('user-123', {
        sentCount: 2,
        maxDaily: 2,
      });

      const result = await canSendNotification(criticalRequest, fullBudget);
      
      expect(result.allowed).toBe(true);
    });

    it('should always allow pending sync notifications', async () => {
      const syncRequest = createMockNotificationRequest('user-123', {
        priority: 'PENDING_SYNC',
      });

      const fullBudget = createMockNotificationBudget('user-123', {
        sentCount: 2,
        maxDaily: 2,
      });

      const result = await canSendNotification(syncRequest, fullBudget);
      
      expect(result.allowed).toBe(true);
    });

    it('should reserve budget for higher priority notifications', async () => {
      const missionRequest = createMockNotificationRequest('user-123', {
        priority: 'DAILY_MISSION',
      });

      const nearLimitBudget = createMockNotificationBudget('user-123', {
        sentCount: 1,
        maxDaily: 2,
      });

      const result = await canSendNotification(missionRequest, nearLimitBudget);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Reserving budget for higher priority notifications');
    });

    it('should allow coach notifications with remaining budget', async () => {
      const coachRequest = createMockNotificationRequest('user-123', {
        priority: 'COACH_NEXT_ACTION',
      });

      const budget = createMockNotificationBudget('user-123', {
        sentCount: 0,
        maxDaily: 2,
      });

      const result = await canSendNotification(coachRequest, budget);
      
      expect(result.allowed).toBe(true);
    });

    it('should block squad help as lowest priority', async () => {
      const squadRequest = createMockNotificationRequest('user-123', {
        priority: 'SQUAD_HELP',
      });

      const budget = createMockNotificationBudget('user-123', {
        sentCount: 1,
        maxDaily: 2,
      });

      const result = await canSendNotification(squadRequest, budget);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Squad help is lowest priority');
    });
  });

  describe('Quiet Hours', () => {
    it('should block notifications during quiet hours', async () => {
      const quietHoursBudget = createMockNotificationBudget('user-123', {
        quietHoursStart: 22,
        quietHoursEnd: 7,
      });

      // Mock current time as 11 PM (23:00)
      vi.spyOn(Date, 'prototype', 'getHours').mockReturnValue(23);

      const result = await canSendNotification(mockRequest, quietHoursBudget);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Quiet hours in effect');
      expect(result.rescheduleAt).toBeDefined();
    });

    it('should allow notifications outside quiet hours', async () => {
      const quietHoursBudget = createMockNotificationBudget('user-123', {
        quietHoursStart: 22,
        quietHoursEnd: 7,
      });

      // Mock current time as 9 AM (9:00)
      vi.spyOn(Date, 'prototype', 'getHours').mockReturnValue(9);

      const result = await canSendNotification(mockRequest, quietHoursBudget);
      
      expect(result.allowed).toBe(true);
    });

    it('should handle overnight quiet hours correctly', async () => {
      const overnightBudget = createMockNotificationBudget('user-123', {
        quietHoursStart: 23,
        quietHoursEnd: 6,
      });

      // Mock current time as 2 AM (2:00) - should be in quiet hours
      vi.spyOn(Date, 'prototype', 'getHours').mockReturnValue(2);

      const result = await canSendNotification(mockRequest, overnightBudget);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Quiet hours in effect');
    });

    it('should calculate next active time correctly', async () => {
      const quietHoursBudget = createMockNotificationBudget('user-123', {
        quietHoursStart: 22,
        quietHoursEnd: 7,
      });

      // Mock current time as 11 PM (23:00)
      vi.spyOn(Date, 'prototype', 'getHours').mockReturnValue(23);
      vi.spyOn(Date, 'prototype', 'getDate').mockReturnValue(15);

      const result = await canSendNotification(mockRequest, quietHoursBudget);
      
      expect(result.rescheduleAt).toBeDefined();
      // Should schedule for next day at 7 AM
      expect(result.rescheduleAt).toBeGreaterThan(Date.now());
    });
  });

  describe('User Opt-Out', () => {
    it('should block all notifications when user opted out', async () => {
      const optedOutBudget = createMockNotificationBudget('user-123', {
        optOut: true,
      });

      const result = await canSendNotification(mockRequest, optedOutBudget);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('User has opted out of notifications');
    });

    it('should respect opt-out even for high priority notifications', async () => {
      const optedOutBudget = createMockNotificationBudget('user-123', {
        optOut: true,
      });

      const criticalRequest = createMockNotificationRequest('user-123', {
        priority: 'STREAK_CRITICAL',
      });

      const result = await canSendNotification(criticalRequest, optedOutBudget);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('User has opted out of notifications');
    });
  });

  describe('Duplicate Suppression', () => {
    it('should suppress duplicate notifications within 4 hours', async () => {
      const now = Date.now();
      const duplicateBudget = createMockNotificationBudget('user-123', {
        notificationsSent: [
          {
            id: 'notif-1',
            priority: 'COACH_NEXT_ACTION',
            sentAt: now - (2 * 60 * 60 * 1000), // 2 hours ago
            type: 'coach_session_suggestion',
            content: 'Try a 25-minute session today.',
          },
        ],
      });

      const duplicateRequest = createMockNotificationRequest('user-123', {
        type: 'coach_session_suggestion',
        priority: 'COACH_NEXT_ACTION',
      });

      const result = await canSendNotification(duplicateRequest, duplicateBudget);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Duplicate notification suppressed');
    });

    it('should allow similar notifications after 4 hours', async () => {
      const now = Date.now();
      const oldNotificationBudget = createMockNotificationBudget('user-123', {
        notificationsSent: [
          {
            id: 'notif-1',
            priority: 'COACH_NEXT_ACTION',
            sentAt: now - (5 * 60 * 60 * 1000), // 5 hours ago
            type: 'coach_session_suggestion',
            content: 'Try a 25-minute session today.',
          },
        ],
      });

      const result = await canSendNotification(mockRequest, oldNotificationBudget);
      
      expect(result.allowed).toBe(true);
    });
  });

  describe('Coach-Specific Notifications', () => {
    it('should send coach notifications with budget enforcement', async () => {
      const result = await sendCoachNotification(
        'user-123',
        'SESSION_SUGGESTION',
        'Your strongest sessions start after 8 PM. Try a 25-minute session tonight.',
        'COACH_NEXT_ACTION'
      );

      expect(result.success).toBe(true);
    });

    it('should suppress generic login reminders', async () => {
      const result = await sendCoachNotification(
        'user-123',
        'SESSION_SUGGESTION',
        "We haven't seen you today! Come back and play.",
        'COACH_NEXT_ACTION'
      );

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Generic login reminder suppressed');
    });

    it('should suppress multiple generic patterns', async () => {
      const genericMessages = [
        "Time for your daily session!",
        "We miss you! Login now.",
        "Come back and complete your mission.",
        "Daily login reminder - don't miss out!",
      ];

      for (const message of genericMessages) {
        const result = await sendCoachNotification(
          'user-123',
          'SESSION_SUGGESTION',
          message,
          'COACH_NEXT_ACTION'
        );

        expect(result.success).toBe(false);
        expect(result.reason).toBe('Generic login reminder suppressed');
      }
    });

    it('should allow specific coach messages', async () => {
      const specificMessages = [
        'Your 5-day streak is at risk! Try a 25-minute session tonight.',
        'Based on your recent performance, a challenging session would be ideal.',
        'Your evening sessions show 92% quality. Try 30 minutes tonight.',
      ];

      for (const message of specificMessages) {
        const result = await sendCoachNotification(
          'user-123',
          'SESSION_SUGGESTION',
          message,
          'COACH_NEXT_ACTION'
        );

        expect(result.success).toBe(true);
      }
    });
  });

  describe('Budget Status', () => {
    it('should return correct budget status', async () => {
      const budget = createMockNotificationBudget('user-123', {
        sentCount: 1,
        maxDaily: 2,
        quietHoursStart: 22,
        quietHoursEnd: 7,
      });

      vi.spyOn(Date, 'prototype', 'getHours').mockReturnValue(14); // 2 PM

      const status = await getNotificationBudgetStatus('user-123');

      expect(status.sent).toBe(1);
      expect(status.maxDaily).toBe(2);
      expect(status.remaining).toBe(1);
      expect(status.inQuietHours).toBe(false);
    });

    it('should show quiet hours status correctly', async () => {
      vi.spyOn(Date, 'prototype', 'getHours').mockReturnValue(23); // 11 PM

      const status = await getNotificationBudgetStatus('user-123');

      expect(status.inQuietHours).toBe(true);
      expect(status.nextActiveTime).toBeDefined();
    });
  });

  describe('Daily Reset', () => {
    it('should reset budget at midnight', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      const oldBudget = createMockNotificationBudget('user-123', {
        date: yesterdayString,
        sentCount: 2,
        notificationsSent: [
          {
            id: 'notif-1',
            priority: 'COACH_NEXT_ACTION',
            sentAt: Date.now() - (24 * 60 * 60 * 1000),
            type: 'coach_session_suggestion',
            content: 'Test notification',
          },
        ],
      });

      const resetBudget = resetDailyBudget(oldBudget);

      expect(resetBudget.sentCount).toBe(0);
      expect(resetBudget.notificationsSent).toHaveLength(0);
      expect(resetBudget.date).toBe(new Date().toISOString().split('T')[0]);
    });

    it('should not reset if already reset today', () => {
      const today = new Date().toISOString().split('T')[0];
      const currentBudget = createMockNotificationBudget('user-123', {
        date: today,
        sentCount: 1,
      });

      const resetBudget = resetDailyBudget(currentBudget);

      expect(resetBudget.sentCount).toBe(1); // Unchanged
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty notification content', async () => {
      const emptyRequest = createMockNotificationRequest('user-123', {
        content: '',
      });

      const result = await canSendNotification(emptyRequest, mockBudget);
      
      expect(result.allowed).toBe(true); // Content validation is handled elsewhere
    });

    it('should handle maximum content length', async () => {
      const longContent = 'A'.repeat(500);
      const longRequest = createMockNotificationRequest('user-123', {
        content: longContent,
      });

      const result = await canSendNotification(longRequest, mockBudget);
      
      expect(result.allowed).toBe(true);
    });

    it('should handle invalid quiet hours gracefully', async () => {
      const invalidBudget = createMockNotificationBudget('user-123', {
        quietHoursStart: 25, // Invalid hour
        quietHoursEnd: -5,   // Invalid hour
      });

      // Should not throw and should handle gracefully
      const result = await canSendNotification(mockRequest, invalidBudget);
      
      expect(result.allowed).toBeDefined();
    });

    it('should handle zero daily budget', async () => {
      const zeroBudget = createMockNotificationBudget('user-123', {
        maxDaily: 0,
      });

      const result = await canSendNotification(mockRequest, zeroBudget);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Daily notification limit reached');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle typical daily notification flow', async () => {
      let budget = createMockNotificationBudget('user-123');
      
      // Send first notification
      const result1 = await sendNotificationWithBudget(mockRequest, budget);
      expect(result1.success).toBe(true);
      budget = result1.updatedBudget;

      // Send second notification
      const result2 = await sendNotificationWithBudget(mockRequest, budget);
      expect(result2.success).toBe(true);
      budget = result2.updatedBudget;

      // Try to send third (should be blocked)
      const result3 = await sendNotificationWithBudget(mockRequest, budget);
      expect(result3.success).toBe(false);

      // But streak critical should still work
      const criticalRequest = createMockNotificationRequest('user-123', {
        priority: 'STREAK_CRITICAL',
      });
      const result4 = await sendNotificationWithBudget(criticalRequest, budget);
      expect(result4.success).toBe(true);
    });

    it('should respect all rules together', async () => {
      const budget = createMockNotificationBudget('user-123', {
        sentCount: 1,
        maxDaily: 2,
        quietHoursStart: 22,
        quietHoursEnd: 7,
      });

      // Mock current time as 11 PM (during quiet hours)
      vi.spyOn(Date, 'prototype', 'getHours').mockReturnValue(23);

      const lowPriorityRequest = createMockNotificationRequest('user-123', {
        priority: 'DAILY_MISSION',
      });

      const result = await canSendNotification(lowPriorityRequest, budget);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Quiet hours in effect');
    });
  });
});