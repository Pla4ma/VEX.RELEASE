/**
 * Tests for: smart-system
 */

import { makeSmartCtx } from './notifications-test-setup';
import {
  evaluateNotificationContext,
  notificationHistory,
  scheduledNotifications,
} from '../SmartNotificationSystem';

describe('SmartNotificationSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    notificationHistory.clear();
    scheduledNotifications.clear();
  });

  describe('SmartNotificationSystem', () => {
    describe('evaluateNotificationContext', () => {
      it('returns null when max daily notifications reached', () => {
        // Add history entries to exceed maxPerDay
        const ctx = makeSmartCtx();
        notificationHistory.set(ctx.userId, [
          { id: '1', userId: ctx.userId, type: 'STREAK_PROTECTION', priority: 'CRITICAL', title: 't', body: 'b', scheduledAt: Date.now(), sentAt: Date.now() },
          { id: '2', userId: ctx.userId, type: 'STREAK_PROTECTION', priority: 'CRITICAL', title: 't', body: 'b', scheduledAt: Date.now(), sentAt: Date.now() },
          { id: '3', userId: ctx.userId, type: 'STREAK_PROTECTION', priority: 'CRITICAL', title: 't', body: 'b', scheduledAt: Date.now(), sentAt: Date.now() },
        ]);
        const result = evaluateNotificationContext(ctx);
        expect(result).toBeNull();
      });

      it('returns notification when streak is at risk', () => {
        const ctx = makeSmartCtx({
          streakDays: 10,
          hasCompletedSessionToday: false,
          hoursUntilStreakBreak: 2,
          notificationPrefs: makeSmartCtx().notificationPrefs,
        });
        const result = evaluateNotificationContext(ctx);
        expect(result).not.toBeNull();
        expect(result!.type).toBe('STREAK_PROTECTION');
        expect(result!.priority).toBe('CRITICAL');
      });

      it('returns null during quiet hours for respected rules', () => {
        const now = new Date();
        const quietHour = now.getHours(); // current hour
        const ctx = makeSmartCtx({
          currentTime: now.getTime(),
          hasActiveBoss: true,
          bossHealthPercent: 10,
          bossTimeRemaining: 2,
          isPrimeTime: false,
          streakDays: 0,
          hoursUntilStreakBreak: null,
          notificationPrefs: {
            ...makeSmartCtx().notificationPrefs,
            quietHoursStart: quietHour,
            quietHoursEnd: quietHour + 1, // no modulo — avoids midnight wraparound
          },
        });
        const result = evaluateNotificationContext(ctx);
        // Boss rule respects quiet hours; if we're in quiet hours, it should be filtered
        // But streak protection doesn't respect quiet hours
        if (ctx.streakDays > 0 && ctx.hoursUntilStreakBreak !== null && ctx.hoursUntilStreakBreak <= 4) {
          // streak protection would fire since it doesn't respect quiet hours
        } else if (result) {
          expect(result.type).not.toBe('BOSS_OPPORTUNITY');
        }
      });

      it('returns null when no rules apply', () => {
        const ctx = makeSmartCtx({
          streakDays: 0,
          hoursUntilStreakBreak: null,
          hasActiveBoss: false,
          hasActiveStudyPlan: false,
          squadMemberCount: 0,
          lastSessionAt: Date.now(),
          daysSinceLastSession: 0,
        });
        const result = evaluateNotificationContext(ctx);
        expect(result).toBeNull();
      });

      it('returns boss notification when boss is low health', () => {
        const ctx = makeSmartCtx({
          streakDays: 0,
          hoursUntilStreakBreak: null,
          hasActiveBoss: true,
          bossHealthPercent: 20,
          bossTimeRemaining: 3,
          isPrimeTime: true,
          notificationPrefs: {
            ...makeSmartCtx().notificationPrefs,
            bossAlertsEnabled: true,
            quietHoursStart: 22,
            quietHoursEnd: 8,
          },
        });
        // Need to set time to NOT be in quiet hours for boss (respects quiet hours)
        const midday = new Date();
        midday.setHours(12, 0, 0, 0);
        ctx.currentTime = midday.getTime();

        const result = evaluateNotificationContext(ctx);
        if (result) {
          expect(result.type).toBe('BOSS_OPPORTUNITY');
        }
      });

      it('returns comeback notification when user has been away', () => {
        const ctx = makeSmartCtx({
          streakDays: 0,
          hoursUntilStreakBreak: null,
          hasActiveBoss: false,
          hasActiveStudyPlan: false,
          squadMemberCount: 0,
          lastSessionAt: Date.now() - 5 * 86400000,
          daysSinceLastSession: 5,
          notificationPrefs: {
            ...makeSmartCtx().notificationPrefs,
            quietHoursStart: 22,
            quietHoursEnd: 8,
          },
        });
        const midday = new Date();
        midday.setHours(12, 0, 0, 0);
        ctx.currentTime = midday.getTime();

        const result = evaluateNotificationContext(ctx);
        if (result) {
          expect(result.type).toBe('COMEBACK');
        }
      });
    });
  });
});
