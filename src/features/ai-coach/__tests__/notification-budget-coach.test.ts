import { beforeEach, describe, expect, it, vi } from "@jest/globals";
import {
  canSendNotification,
  clearBudgetStore,
  createMockNotificationBudget,
  createMockNotificationRequest,
  getNotificationBudgetStatus,
  sendCoachNotification,
  sendNotificationWithBudget,
} from "../notification-budget";

function mockCurrentHour(hour: number): void {
  const date = new Date("2026-05-07T00:00:00.000Z");
  date.setHours(hour, 0, 0, 0);
  jest.useFakeTimers();
  jest.setSystemTime(date);
}

describe("Notification budget coach and integration flows", () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    clearBudgetStore();
  });

  it("sends specific coach notifications and suppresses generic login reminders", async () => {
    await expect(
      sendCoachNotification(
        "user-123",
        "SESSION_SUGGESTION",
        "Your strongest sessions start after 8 PM. Try a 25-minute session tonight.",
        "COACH_NEXT_ACTION",
      ),
    ).resolves.toMatchObject({ success: true });

    for (const message of [
      "We haven't seen you today! Come back and play.",
      "Time for your daily session!",
      "We miss you! Login now.",
      "Daily login reminder - don't miss out!",
    ]) {
      await expect(
        sendCoachNotification(
          "user-123",
          "SESSION_SUGGESTION",
          message,
          "COACH_NEXT_ACTION",
        ),
      ).resolves.toMatchObject({
        success: false,
        reason: "Generic login reminder suppressed",
      });
    }
  });

  it("returns budget status with quiet hour context", async () => {
    mockCurrentHour(14);
    await expect(
      getNotificationBudgetStatus("user-123"),
    ).resolves.toMatchObject({
      sent: 1,
      maxDaily: 2,
      remaining: 1,
      inQuietHours: false,
    });

    mockCurrentHour(23);
    await expect(
      getNotificationBudgetStatus("user-123"),
    ).resolves.toMatchObject({
      inQuietHours: true,
    });
  });

  it("handles edge-case request and budget values", async () => {
    await expect(
      canSendNotification(
        createMockNotificationRequest("user-123", {
          content: "",
        }),
        createMockNotificationBudget("user-123"),
      ),
    ).resolves.toMatchObject({ allowed: true });
    await expect(
      canSendNotification(
        createMockNotificationRequest("user-123", {
          content: "A".repeat(500),
        }),
        createMockNotificationBudget("user-123"),
      ),
    ).resolves.toMatchObject({ allowed: true });
    await expect(
      canSendNotification(
        createMockNotificationRequest("user-123"),
        createMockNotificationBudget("user-123", {
          quietHoursStart: 25,
          quietHoursEnd: -5,
        }),
      ),
    ).resolves.toHaveProperty("allowed");
    await expect(
      canSendNotification(
        createMockNotificationRequest("user-123"),
        createMockNotificationBudget("user-123", {
          maxDaily: 0,
        }),
      ),
    ).resolves.toMatchObject({
      allowed: false,
      reason: "Daily notification limit reached",
    });
  });

  it("handles typical daily flow with critical override", async () => {
    let budget = createMockNotificationBudget("user-123");

    const result1 = await sendNotificationWithBudget(
      createMockNotificationRequest("user-123"),
      budget,
    );
    expect(result1.success).toBe(true);
    budget = result1.updatedBudget;

    const result2 = await sendNotificationWithBudget(
      createMockNotificationRequest("user-123"),
      budget,
    );
    expect(result2.success).toBe(true);
    budget = result2.updatedBudget;

    await expect(
      sendNotificationWithBudget(
        createMockNotificationRequest("user-123"),
        budget,
      ),
    ).resolves.toMatchObject({ success: false });
    await expect(
      sendNotificationWithBudget(
        createMockNotificationRequest("user-123", {
          priority: "STREAK_CRITICAL",
        }),
        budget,
      ),
    ).resolves.toMatchObject({ success: true });
  });
});
