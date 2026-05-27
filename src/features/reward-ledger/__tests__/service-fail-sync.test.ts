import { failReward, expireReward, syncPendingRewards } from "../service";
import { repository, captureException, mockRecord } from "./service.helpers";

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
      (repository.updateRewardLedgerStatus as jest.Mock).mockResolvedValue(failed);
      const result = await failReward("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "inventory_full");
      expect(result.status).toBe("failed");
      expect(result.failedReason).toBe("inventory_full");
    });

    it("captures Sentry on error", async () => {
      (repository.updateRewardLedgerStatus as jest.Mock).mockRejectedValue(new Error("db down"));
      await expect(
        failReward("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "reason"),
      ).rejects.toThrow("RewardLedgerService failReward failed");
      expect(captureException).toHaveBeenCalled();
    });
  });

  describe("expireReward", () => {
    it("marks reward as expired", async () => {
      const expired = { ...mockRecord, status: "expired" as const };
      (repository.updateRewardLedgerStatus as jest.Mock).mockResolvedValue(expired);
      const result = await expireReward("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
      expect(result.status).toBe("expired");
    });

    it("captures Sentry on error", async () => {
      (repository.updateRewardLedgerStatus as jest.Mock).mockRejectedValue(new Error("db error"));
      await expect(
        expireReward("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
      ).rejects.toThrow("RewardLedgerService expireReward failed");
      expect(captureException).toHaveBeenCalled();
    });
  });

  describe("syncPendingRewards", () => {
    const userId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

    it("syncs all pending rewards for a user", async () => {
      (repository.fetchPendingRewards as jest.Mock).mockResolvedValue([mockRecord]);
      (repository.getRewardLedgerById as jest.Mock).mockResolvedValue(mockRecord);
      (repository.updateRewardLedgerStatus as jest.Mock).mockResolvedValue({
        ...mockRecord,
        status: "delivered" as const,
        deliveredAt: "2026-01-01T00:05:00.000Z",
      });
      const results = await syncPendingRewards(userId);
      expect(results).toHaveLength(1);
      expect(results[0]!.status).toBe("delivered");
    });

    it("continues syncing after individual delivery failure", async () => {
      const secondRecord = {
        ...mockRecord,
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        idempotencyKey: "evt_002",
      };
      (repository.fetchPendingRewards as jest.Mock).mockResolvedValue([mockRecord, secondRecord]);
      const getByIdMock = repository.getRewardLedgerById as jest.Mock;
      getByIdMock
        .mockRejectedValueOnce(new Error("delivery failed"))
        .mockResolvedValueOnce(secondRecord);
      (repository.updateRewardLedgerStatus as jest.Mock).mockResolvedValue({
        ...secondRecord,
        status: "delivered" as const,
        deliveredAt: "2026-01-01T00:05:00.000Z",
      });
      const results = await syncPendingRewards(userId);
      expect(results).toHaveLength(1);
      expect(results[0]!.id).toBe("cccccccc-cccc-cccc-cccc-cccccccccccc");
    });

    it("returns empty array when no pending rewards", async () => {
      (repository.fetchPendingRewards as jest.Mock).mockResolvedValue([]);
      const results = await syncPendingRewards(userId);
      expect(results).toHaveLength(0);
    });

    it("captures Sentry on fetch failure", async () => {
      (repository.fetchPendingRewards as jest.Mock).mockRejectedValue(new Error("fetch failed"));
      await expect(syncPendingRewards(userId)).rejects.toThrow(
        "RewardLedgerService syncPendingRewards failed",
      );
      expect(captureException).toHaveBeenCalled();
    });
  });
});
