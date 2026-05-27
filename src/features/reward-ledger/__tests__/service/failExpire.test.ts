import {
  repository,
  captureException,
  failReward,
  expireReward,
  mockRecord,
} from "./helpers";

describe("reward-ledger service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("failReward", () => {
    it("marks reward as failed with reason", async () => {
      const failed = {
        ...mockRecord,
        status: "failed" as const,
        failedReason: "inventory_full",
      };
      (repository.updateRewardLedgerStatus as jest.Mock).mockResolvedValue(
        failed,
      );
      const result = await failReward(
        "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "inventory_full",
      );
      expect(result.status).toBe("failed");
      expect(result.failedReason).toBe("inventory_full");
    });

    it("captures Sentry on error", async () => {
      (repository.updateRewardLedgerStatus as jest.Mock).mockRejectedValue(
        new Error("db down"),
      );
      await expect(
        failReward("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "reason"),
      ).rejects.toThrow("RewardLedgerService failReward failed");
      expect(captureException).toHaveBeenCalled();
    });
  });

  describe("expireReward", () => {
    it("marks reward as expired", async () => {
      const expired = { ...mockRecord, status: "expired" as const };
      (repository.updateRewardLedgerStatus as jest.Mock).mockResolvedValue(
        expired,
      );
      const result = await expireReward("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
      expect(result.status).toBe("expired");
    });

    it("captures Sentry on error", async () => {
      (repository.updateRewardLedgerStatus as jest.Mock).mockRejectedValue(
        new Error("db error"),
      );
      await expect(
        expireReward("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
      ).rejects.toThrow("RewardLedgerService expireReward failed");
      expect(captureException).toHaveBeenCalled();
    });
  });
});
