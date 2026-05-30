import { describe, it, expect, beforeEach } from "@jest/globals";
import { mockFrom, mockSingle } from "./repository-test-setup";

import {
  updateRewardLedgerStatus,
  fetchPendingRewards,
  RewardLedgerRepositoryError,
} from "../repository";
import type { CreateRewardLedgerInput } from "../types";

const validInput: CreateRewardLedgerInput = {
  userId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  idempotencyKey: "evt_session_complete_001",
  rewardType: "session_bonus",
  amount: 50,
  currency: "XP",
  sourceEvent: "session:completed",
};

const mockDbRecord = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  user_id: validInput.userId,
  idempotency_key: validInput.idempotencyKey,
  reward_type: validInput.rewardType,
  amount: 50,
  currency: "XP",
  status: "pending",
  source_event: validInput.sourceEvent,
  created_at: "2026-01-01T00:00:00.000Z",
  delivered_at: null,
  failed_reason: null,
  expires_at: null,
};

describe("reward-ledger repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("updateRewardLedgerStatus", () => {
    const ledgerId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

    it("transitions to delivered", async () => {
      const deliveredDb = {
        ...mockDbRecord,
        status: "delivered",
        delivered_at: "2026-01-01T00:05:00.000Z",
      };
      mockSingle.mockResolvedValue({ data: deliveredDb, error: null });
      const eqMock = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({ single: mockSingle }),
        });
      const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockFrom.mockReturnValue({ update: updateMock });

      const result = await updateRewardLedgerStatus(ledgerId, "delivered");
      expect(result.status).toBe("delivered");
    });

    it("transitions to failed with reason", async () => {
      const failedDb = {
        ...mockDbRecord,
        status: "failed",
        failed_reason: "insufficient_permissions",
      };
      mockSingle.mockResolvedValue({ data: failedDb, error: null });
      const eqMock = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({ single: mockSingle }),
        });
      const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockFrom.mockReturnValue({ update: updateMock });

      const result = await updateRewardLedgerStatus(
        ledgerId,
        "failed",
        "insufficient_permissions",
      );
      expect(result.status).toBe("failed");
      expect(result.failedReason).toBe("insufficient_permissions");
    });

    it("transitions to expired", async () => {
      const expiredDb = { ...mockDbRecord, status: "expired" };
      mockSingle.mockResolvedValue({ data: expiredDb, error: null });
      const eqMock = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({ single: mockSingle }),
        });
      const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockFrom.mockReturnValue({ update: updateMock });

      const result = await updateRewardLedgerStatus(ledgerId, "expired");
      expect(result.status).toBe("expired");
    });

    it("throws on Supabase error", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: "not found", code: "PGRST116" },
      });
      const eqMock = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({ single: mockSingle }),
        });
      const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockFrom.mockReturnValue({ update: updateMock });

      await expect(
        updateRewardLedgerStatus(ledgerId, "delivered"),
      ).rejects.toThrow(RewardLedgerRepositoryError);
    });
  });

  describe("fetchPendingRewards", () => {
    const userId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

    it("fetches pending rewards for user", async () => {
      const pendingRewards = [
        mockDbRecord,
        { ...mockDbRecord, id: "cccccccc-cccc-cccc-cccc-cccccccccccc" },
      ];
      const eqStatus = jest
        .fn()
        .mockReturnValue({ data: pendingRewards, error: null });
      const eqUserId = jest.fn().mockReturnValue({ eq: eqStatus });
      const selectMock = jest.fn().mockReturnValue({ eq: eqUserId });
      mockFrom.mockReturnValue({ select: selectMock });

      const result = await fetchPendingRewards(userId);
      expect(result).toHaveLength(2);
      expect(result[0]!.status).toBe("pending");
    });

    it("returns empty array when no pending rewards", async () => {
      const eqStatus = jest.fn().mockReturnValue({ data: [], error: null });
      const eqUserId = jest.fn().mockReturnValue({ eq: eqStatus });
      const selectMock = jest.fn().mockReturnValue({ eq: eqUserId });
      mockFrom.mockReturnValue({ select: selectMock });

      const result = await fetchPendingRewards(userId);
      expect(result).toHaveLength(0);
    });

    it("throws on Supabase error", async () => {
      const eqStatus = jest
        .fn()
        .mockReturnValue({
          data: null,
          error: { message: "timeout", code: "PGRST999" },
        });
      const eqUserId = jest.fn().mockReturnValue({ eq: eqStatus });
      const selectMock = jest.fn().mockReturnValue({ eq: eqUserId });
      mockFrom.mockReturnValue({ select: selectMock });

      await expect(fetchPendingRewards(userId)).rejects.toThrow(
        RewardLedgerRepositoryError,
      );
    });
  });
});
