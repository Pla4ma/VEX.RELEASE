/**
 * Tests for: retention-challenge-expiry
 */

jest.mock("../repository/retention");
import * as retentionRepo from "../repository/retention";
import { scheduleChallengeExpiryNotifications } from "../retention-challenge-expiry";

describe("Retention Challenge Expiry", () => {
  it("schedules reminders for each candidate", async () => {
    (retentionRepo.fetchChallengeExpiryCandidates as jest.Mock).mockResolvedValue([
      {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        challengeId: "ch-1",
        title: "Speed Challenge",
        currentValue: 5,
        targetValue: 10,
        expiresAt: Date.now() + 3600000,
      },
      {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        challengeId: "ch-2",
        title: "Focus Challenge",
        currentValue: 8,
        targetValue: 10,
        expiresAt: Date.now() + 7200000,
      },
    ]);
    (retentionRepo.upsertReminderPlan as jest.Mock).mockResolvedValue({});

    await scheduleChallengeExpiryNotifications("550e8400-e29b-41d4-a716-446655440000");

    expect(retentionRepo.upsertReminderPlan).toHaveBeenCalledTimes(2);
  });

  it("handles empty candidates", async () => {
    (retentionRepo.fetchChallengeExpiryCandidates as jest.Mock).mockResolvedValue([]);
    (retentionRepo.upsertReminderPlan as jest.Mock).mockResolvedValue({});

    await scheduleChallengeExpiryNotifications("550e8400-e29b-41d4-a716-446655440000");

    expect(retentionRepo.upsertReminderPlan).not.toHaveBeenCalled();
  });

  it("handles scheduling errors gracefully", async () => {
    (retentionRepo.fetchChallengeExpiryCandidates as jest.Mock).mockResolvedValue([
      {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        challengeId: "ch-1",
        title: "Speed Challenge",
        currentValue: 5,
        targetValue: 10,
        expiresAt: Date.now() + 3600000,
      },
    ]);
    (retentionRepo.upsertReminderPlan as jest.Mock).mockRejectedValue(
      new Error("DB error"),
    );

    // Should not throw
    await expect(
      scheduleChallengeExpiryNotifications("550e8400-e29b-41d4-a716-446655440000"),
    ).resolves.toBeUndefined();
  });
});
