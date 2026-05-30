/**
 * Tests for: smart-system-rules
 */

import { makeSmartCtx } from "./notifications-test-setup";
import {
  NOTIFICATION_RULES,
  STREAK_PROTECTION_RULE,
  BOSS_OPPORTUNITY_RULE,
  STUDY_REMINDER_RULE,
  SQUAD_ACTIVITY_RULE,
  COMEBACK_RULE,
} from "../SmartNotificationSystem.rules";

describe("SmartNotificationSystem Rules", () => {
  it("exports 5 rules", () => {
    expect(NOTIFICATION_RULES).toHaveLength(5);
  });

  describe("STREAK_PROTECTION_RULE", () => {
    it("returns false when no streak", () => {
      const ctx = makeSmartCtx({ streakDays: 0 });
      expect(STREAK_PROTECTION_RULE.condition(ctx)).toBe(false);
    });

    it("returns false when session completed today", () => {
      const ctx = makeSmartCtx({ hasCompletedSessionToday: true });
      expect(STREAK_PROTECTION_RULE.condition(ctx)).toBe(false);
    });

    it("returns false when hoursUntilStreakBreak is null", () => {
      const ctx = makeSmartCtx({ hoursUntilStreakBreak: null });
      expect(STREAK_PROTECTION_RULE.condition(ctx)).toBe(false);
    });

    it("returns false when hoursUntilStreakBreak > 4", () => {
      const ctx = makeSmartCtx({ hoursUntilStreakBreak: 5 });
      expect(STREAK_PROTECTION_RULE.condition(ctx)).toBe(false);
    });

    it("returns true when streak at risk within 4 hours", () => {
      const ctx = makeSmartCtx({ hoursUntilStreakBreak: 2, streakDays: 5 });
      expect(STREAK_PROTECTION_RULE.condition(ctx)).toBe(true);
    });

    it("generates critical message for <= 1 hour", () => {
      const ctx = makeSmartCtx({ hoursUntilStreakBreak: 1, streakDays: 7 });
      const msg = STREAK_PROTECTION_RULE.message(ctx);
      expect(msg.title).toContain("1 hour");
      expect(msg.body).toContain("7-day streak");
    });

    it("generates warning message for > 1 hour", () => {
      const ctx = makeSmartCtx({ hoursUntilStreakBreak: 3, streakDays: 5 });
      const msg = STREAK_PROTECTION_RULE.message(ctx);
      expect(msg.title).toContain("3 hours");
    });

    it("does not respect quiet hours", () => {
      expect(STREAK_PROTECTION_RULE.quietHoursRespected).toBe(false);
    });
  });

  describe("BOSS_OPPORTUNITY_RULE", () => {
    it("returns false when no active boss", () => {
      expect(BOSS_OPPORTUNITY_RULE.condition(makeSmartCtx({ hasActiveBoss: false }))).toBe(false);
    });

    it("returns false when boss health > 30%", () => {
      expect(BOSS_OPPORTUNITY_RULE.condition(makeSmartCtx({
        hasActiveBoss: true, bossHealthPercent: 50, bossTimeRemaining: 5,
      }))).toBe(false);
    });

    it("returns false when boss time remaining <= 0", () => {
      expect(BOSS_OPPORTUNITY_RULE.condition(makeSmartCtx({
        hasActiveBoss: true, bossHealthPercent: 10, bossTimeRemaining: 0,
      }))).toBe(false);
    });

    it("returns true when boss is low health in prime time", () => {
      expect(BOSS_OPPORTUNITY_RULE.condition(makeSmartCtx({
        hasActiveBoss: true, bossHealthPercent: 20, bossTimeRemaining: 3, isPrimeTime: true,
      }))).toBe(true);
    });

    it("returns true when boss health < 15% even without prime time", () => {
      expect(BOSS_OPPORTUNITY_RULE.condition(makeSmartCtx({
        hasActiveBoss: true, bossHealthPercent: 10, bossTimeRemaining: 2, isPrimeTime: false,
      }))).toBe(true);
    });

    it("generates prime time message", () => {
      const ctx = makeSmartCtx({ isPrimeTime: true, bossHealthPercent: 20, bossTimeRemaining: 3 });
      const msg = BOSS_OPPORTUNITY_RULE.message(ctx);
      expect(msg.body).toContain("Prime Time");
    });

    it("generates regular message without prime time", () => {
      const ctx = makeSmartCtx({ isPrimeTime: false, bossHealthPercent: 10, bossTimeRemaining: 2 });
      const msg = BOSS_OPPORTUNITY_RULE.message(ctx);
      expect(msg.body).toContain("focused session");
    });

    it("requires opt-in", () => {
      expect(BOSS_OPPORTUNITY_RULE.requiresOptIn).toBe(true);
    });
  });

  describe("STUDY_REMINDER_RULE", () => {
    it("returns false when no active study plan", () => {
      expect(STUDY_REMINDER_RULE.condition(makeSmartCtx({ hasActiveStudyPlan: false }))).toBe(false);
    });

    it("returns false when progress > 80%", () => {
      expect(STUDY_REMINDER_RULE.condition(makeSmartCtx({
        hasActiveStudyPlan: true, studyPlanProgress: 0.9, studyTasksRemaining: 2,
      }))).toBe(false);
    });

    it("returns false when no tasks remaining", () => {
      expect(STUDY_REMINDER_RULE.condition(makeSmartCtx({
        hasActiveStudyPlan: true, studyPlanProgress: 0.5, studyTasksRemaining: 0,
      }))).toBe(false);
    });

    it("returns false when session completed today", () => {
      expect(STUDY_REMINDER_RULE.condition(makeSmartCtx({
        hasActiveStudyPlan: true, studyPlanProgress: 0.3, studyTasksRemaining: 3,
        hasCompletedSessionToday: true,
      }))).toBe(false);
    });

    it("returns true when study plan needs attention", () => {
      expect(STUDY_REMINDER_RULE.condition(makeSmartCtx({
        hasActiveStudyPlan: true, studyPlanProgress: 0.3, studyTasksRemaining: 5,
        hasCompletedSessionToday: false,
      }))).toBe(true);
    });
  });

  describe("SQUAD_ACTIVITY_RULE", () => {
    it("returns false when squad < 2 members", () => {
      expect(SQUAD_ACTIVITY_RULE.condition(makeSmartCtx({ squadMemberCount: 1 }))).toBe(false);
    });

    it("returns false when weekly progress > 90%", () => {
      expect(SQUAD_ACTIVITY_RULE.condition(makeSmartCtx({
        squadMemberCount: 5, squadWeeklyProgress: 0.95,
      }))).toBe(false);
    });

    it("returns true when squad needs contribution", () => {
      expect(SQUAD_ACTIVITY_RULE.condition(makeSmartCtx({
        squadMemberCount: 4, squadWeeklyProgress: 0.5,
      }))).toBe(true);
    });
  });

  describe("COMEBACK_RULE", () => {
    it("returns false when no lastSessionAt", () => {
      expect(COMEBACK_RULE.condition(makeSmartCtx({ lastSessionAt: null }))).toBe(false);
    });

    it("returns false when daysSinceLastSession < 3", () => {
      expect(COMEBACK_RULE.condition(makeSmartCtx({ daysSinceLastSession: 1 }))).toBe(false);
    });

    it("returns false when daysSinceLastSession > 14", () => {
      expect(COMEBACK_RULE.condition(makeSmartCtx({ daysSinceLastSession: 20 }))).toBe(false);
    });

    it("returns true when 3 days away", () => {
      expect(COMEBACK_RULE.condition(makeSmartCtx({ daysSinceLastSession: 3 }))).toBe(true);
    });

    it("generates 3-day message", () => {
      const msg = COMEBACK_RULE.message(makeSmartCtx({ daysSinceLastSession: 3 }));
      expect(msg.title).toContain("miss you");
    });

    it("generates 7-day message", () => {
      const msg = COMEBACK_RULE.message(makeSmartCtx({ daysSinceLastSession: 7 }));
      expect(msg.title).toContain("progress is waiting");
    });

    it("generates 14-day message", () => {
      const msg = COMEBACK_RULE.message(makeSmartCtx({ daysSinceLastSession: 14 }));
      expect(msg.title).toContain("Fresh start");
    });
  });
});
