import { describe, it, expect,  beforeEach } from "@jest/globals";
jest.mock("../repository");
jest.mock("../../economy/wallet-service", () => ({
  addCurrency: jest
    .fn()
    .mockResolvedValue({
      newBalance: 1100,
      earnedAmount: 50,
      transaction: { id: "tx-1", type: "EARN", amount: 50, currency: "COINS" },
    }),
}));
jest.mock("../../../config/sentry", () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));
import * as repository from "../repository";
import { addCurrency } from "../../economy/wallet-service";
import { captureException } from "../../../config/sentry";
import {
  createReward,
  deliverReward,
  failReward,
  expireReward,
  syncPendingRewards,
} from "../service";
import type { CreateRewardLedgerInput, RewardLedgerRecord } from "../types";
const mockRecord: RewardLedgerRecord = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  userId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  idempotencyKey: "evt_session_complete_001",
  rewardType: "session_bonus",
  amount: 50,
  currency: "XP",
  status: "pending",
  sourceEvent: "session:completed",
  createdAt: "2026-01-01T00:00:00.000Z",
  deliveredAt: null,
  failedReason: null,
  expiresAt: null,
};
const validInput: CreateRewardLedgerInput = {
  userId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  idempotencyKey: "evt_session_complete_001",
  rewardType: "session_bonus",
  amount: 50,
  currency: "XP",
  sourceEvent: "session:completed",
};
describe("reward-ledger service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("createReward", () => {
    it("creates a reward via repository", async () => {
      (repository.upsertRewardLedger as jest.Mock).mockResolvedValue(
        mockRecord,
      );
      const result = await createReward(validInput);
      expect(result.status).toBe("pending");
      expect(result.idempotencyKey).toBe(validInput.idempotencyKey);
      expect(repository.upsertRewardLedger).toHaveBeenCalledTimes(1);
    });
    it("preserves idempotency - duplicate event does not create duplicate reward", async () => {
      const alreadyDelivered = {
        ...mockRecord,
        status: "delivered" as const,
        deliveredAt: "2026-01-01T00:01:00.000Z",
      };
      (repository.upsertRewardLedger as jest.Mock).mockResolvedValue(
        alreadyDelivered,
      );
      const result = await createReward(validInput);
      expect(result.status).toBe("delivered");
      expect(repository.upsertRewardLedger).toHaveBeenCalledTimes(1);
    });
    it("captures Sentry on repository error", async () => {
      (repository.upsertRewardLedger as jest.Mock).mockRejectedValue(
        new Error("DB error"),
      );
      await expect(createReward(validInput)).rejects.toThrow(
        "RewardLedgerService createReward failed",
      );
      expect(captureException).toHaveBeenCalled();
    });
  });
  describe("deliverReward", () => {
    const ledgerId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    it("fetches ledger, credits economy, updates status to delivered", async () => {
      (repository.getRewardLedgerById as jest.Mock).mockResolvedValue(
        mockRecord,
      );
      const delivered = {
        ...mockRecord,
        status: "delivered" as const,
        deliveredAt: "2026-01-01T00:05:00.000Z",
      };
      (repository.updateRewardLedgerStatus as jest.Mock).mockResolvedValue(
        delivered,
      );
      const result = await deliverReward(ledgerId);
      expect(result.status).toBe("delivered");
      expect(addCurrency).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockRecord.userId,
          currency: "FOCUS_POINTS",
          amount: 50,
          source: "REWARD",
        }),
      );
      expect(repository.updateRewardLedgerStatus).toHaveBeenCalledWith(
        ledgerId,
        "delivered",
      );
    });
    it("skips crediting if already not pending", async () => {
      const alreadyDelivered = { ...mockRecord, status: "delivered" as const };
      (repository.getRewardLedgerById as jest.Mock).mockResolvedValue(
        alreadyDelivered,
      );
      const result = await deliverReward(ledgerId);
      expect(result.status).toBe("delivered");
      expect(addCurrency).not.toHaveBeenCalled();
    });
    it("captures Sentry on error", async () => {
      (repository.getRewardLedgerById as jest.Mock).mockRejectedValue(
        new Error("network timeout"),
      );
      await expect(deliverReward(ledgerId)).rejects.toThrow(
        "RewardLedgerService deliverReward failed",
      );
      expect(captureException).toHaveBeenCalled();
    });
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
  describe("syncPendingRewards", () => {
    const userId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
    it("syncs all pending rewards for a user", async () => {
      (repository.fetchPendingRewards as jest.Mock).mockResolvedValue([
        mockRecord,
      ]);
      (repository.getRewardLedgerById as jest.Mock).mockResolvedValue(
        mockRecord,
      );
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
      (repository.fetchPendingRewards as jest.Mock).mockResolvedValue([
        mockRecord,
        secondRecord,
      ]);
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
      (repository.fetchPendingRewards as jest.Mock).mockRejectedValue(
        new Error("fetch failed"),
      );
      await expect(syncPendingRewards(userId)).rejects.toThrow(
        "RewardLedgerService syncPendingRewards failed",
      );
      expect(captureException).toHaveBeenCalled();
    });
  });
});
