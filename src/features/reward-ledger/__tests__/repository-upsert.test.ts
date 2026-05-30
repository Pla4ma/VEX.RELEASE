import { describe, it, expect, beforeEach } from "@jest/globals";
import { mockFrom, mockSingle } from "./repository-test-setup";

import {
  upsertRewardLedger,
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

  describe("upsertRewardLedger", () => {
    it("creates a new pending reward ledger entry", async () => {
      mockSingle.mockResolvedValue({ data: mockDbRecord, error: null });
      const selectMock = jest.fn().mockReturnValue({ single: mockSingle });
      const upsertMock = jest.fn().mockReturnValue({ select: selectMock });
      mockFrom.mockReturnValue({ upsert: upsertMock });

      const result = await upsertRewardLedger(validInput);
      expect(result.status).toBe("pending");
      expect(result.idempotencyKey).toBe(validInput.idempotencyKey);
      expect(result.currency).toBe("XP");
    });

    it("handles idempotency key conflict by returning existing record", async () => {
      const existingDb = {
        ...mockDbRecord,
        status: "delivered",
        delivered_at: "2026-01-01T00:01:00.000Z",
      };
      mockSingle.mockResolvedValue({ data: existingDb, error: null });
      const selectMock = jest.fn().mockReturnValue({ single: mockSingle });
      const upsertMock = jest.fn().mockReturnValue({ select: selectMock });
      mockFrom.mockReturnValue({ upsert: upsertMock });

      const result = await upsertRewardLedger(validInput);
      expect(result.status).toBe("delivered");
    });

    it("throws RepositoryError on Supabase error", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: "connection refused", code: "PGRST000" },
      });
      const selectMock = jest.fn().mockReturnValue({ single: mockSingle });
      const upsertMock = jest.fn().mockReturnValue({ select: selectMock });
      mockFrom.mockReturnValue({ upsert: upsertMock });

      await expect(upsertRewardLedger(validInput)).rejects.toThrow(
        RewardLedgerRepositoryError,
      );
      await expect(upsertRewardLedger(validInput)).rejects.toThrow("upsert");
    });
  });
});
