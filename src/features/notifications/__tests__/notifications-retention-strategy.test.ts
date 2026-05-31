/**
 * Tests for: retention-strategy
 */

jest.mock("../repository/retention");
import * as retentionRepo from "../repository/retention";
import {
  scheduleOnboardingNotifications,
  scheduleStreakProtectionNotification,
  scheduleReEngagementNotification,
} from "../retention-strategy";

describe("Retention Strategy", () => {
  describe("scheduleOnboardingNotifications", () => {
    it("schedules 3 onboarding reminders", async () => {
      (retentionRepo.fetchRetentionUserProfile as jest.Mock).mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        firstName: "TestUser",
      });
      (retentionRepo.upsertReminderPlan as jest.Mock).mockResolvedValue({});

      await scheduleOnboardingNotifications("550e8400-e29b-41d4-a716-446655440000");

      expect(retentionRepo.upsertReminderPlan).toHaveBeenCalledTimes(3);
      // Verify the types scheduled
      const calls = (retentionRepo.upsertReminderPlan as jest.Mock).mock.calls;
      const types = calls.map((c: any[]) => c[0].type);
      expect(types).toContain("RETENTION_ONBOARDING_DAY_1");
      expect(types).toContain("RETENTION_ONBOARDING_DAY_3");
      expect(types).toContain("RETENTION_ONBOARDING_DAY_7");
    });

    it("handles null firstName gracefully", async () => {
      (retentionRepo.fetchRetentionUserProfile as jest.Mock).mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        firstName: null,
      });
      (retentionRepo.upsertReminderPlan as jest.Mock).mockResolvedValue({});

      await scheduleOnboardingNotifications("550e8400-e29b-41d4-a716-446655440000");

      // Should still schedule 3 reminders
      expect(retentionRepo.upsertReminderPlan).toHaveBeenCalledTimes(3);
    });

    it("handles errors without throwing", async () => {
      (retentionRepo.fetchRetentionUserProfile as jest.Mock).mockRejectedValue(
        new Error("DB error"),
      );

      await expect(
        scheduleOnboardingNotifications("550e8400-e29b-41d4-a716-446655440000"),
      ).resolves.toBeUndefined();
    });
  });

  describe("scheduleStreakProtectionNotification", () => {
    it("does nothing for streak < 1", async () => {
      await scheduleStreakProtectionNotification(
        "550e8400-e29b-41d4-a716-446655440000", 0, Date.now(),
      );
      expect(retentionRepo.upsertReminderPlan).not.toHaveBeenCalled();
    });

    it("does nothing when scheduled reminder exists within window", async () => {
      (retentionRepo.hasScheduledReminderWithin as jest.Mock).mockResolvedValue(true);
      await scheduleStreakProtectionNotification(
        "550e8400-e29b-41d4-a716-446655440000", 5, Date.now(),
      );
      expect(retentionRepo.upsertReminderPlan).not.toHaveBeenCalled();
    });

    it("schedules protection for high streak", async () => {
      (retentionRepo.hasScheduledReminderWithin as jest.Mock).mockResolvedValue(false);
      (retentionRepo.upsertReminderPlan as jest.Mock).mockResolvedValue({});

      await scheduleStreakProtectionNotification(
        "550e8400-e29b-41d4-a716-446655440000", 10, Date.now(),
      );
      expect(retentionRepo.upsertReminderPlan).toHaveBeenCalledTimes(1);
    });

    it("schedules protection for low streak", async () => {
      (retentionRepo.hasScheduledReminderWithin as jest.Mock).mockResolvedValue(false);
      (retentionRepo.upsertReminderPlan as jest.Mock).mockResolvedValue({});

      await scheduleStreakProtectionNotification(
        "550e8400-e29b-41d4-a716-446655440000", 1, Date.now(),
      );
      expect(retentionRepo.upsertReminderPlan).toHaveBeenCalledTimes(1);
    });
  });

  describe("scheduleReEngagementNotification", () => {
    it("schedules re-engagement for 1 day inactive", async () => {
      (retentionRepo.upsertReminderPlan as jest.Mock).mockResolvedValue({});

      await scheduleReEngagementNotification(
        "550e8400-e29b-41d4-a716-446655440000", 1, 5,
      );
      expect(retentionRepo.upsertReminderPlan).toHaveBeenCalledTimes(1);
    });

    it("schedules re-engagement for 2 days inactive", async () => {
      (retentionRepo.upsertReminderPlan as jest.Mock).mockResolvedValue({});

      await scheduleReEngagementNotification(
        "550e8400-e29b-41d4-a716-446655440000", 2, 7,
      );
      expect(retentionRepo.upsertReminderPlan).toHaveBeenCalledTimes(1);
    });

    it("schedules re-engagement for 3 days inactive", async () => {
      (retentionRepo.upsertReminderPlan as jest.Mock).mockResolvedValue({});

      await scheduleReEngagementNotification(
        "550e8400-e29b-41d4-a716-446655440000", 3, 10,
      );
      expect(retentionRepo.upsertReminderPlan).toHaveBeenCalledTimes(1);
    });

    it("does nothing for 4+ days inactive (no matching message)", async () => {
      await scheduleReEngagementNotification(
        "550e8400-e29b-41d4-a716-446655440000", 4, 10,
      );
      expect(retentionRepo.upsertReminderPlan).not.toHaveBeenCalled();
    });
  });
});
