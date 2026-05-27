import { createReward, deliverReward } from "../service";
import {
  repository,
  addCurrency,
  mockRecord,
  validInput,
} from "./service.helpers";

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
      const { captureException } = require("./service.helpers");
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
      const { captureException } = require("./service.helpers");
      (repository.getRewardLedgerById as jest.Mock).mockRejectedValue(
        new Error("network timeout"),
      );
      await expect(deliverReward(ledgerId)).rejects.toThrow(
        "RewardLedgerService deliverReward failed",
      );
      expect(captureException).toHaveBeenCalled();
    });
  });
});
