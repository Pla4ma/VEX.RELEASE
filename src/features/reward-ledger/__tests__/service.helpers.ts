import * as repository from "../repository";
import { addCurrency } from "../../economy/wallet-service";
import { captureException } from "../../../config/sentry";
import type { CreateRewardLedgerInput, RewardLedgerRecord } from "../types";

export { repository, addCurrency, captureException };

export const mockRecord: RewardLedgerRecord = {
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

export const validInput: CreateRewardLedgerInput = {
  userId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  idempotencyKey: "evt_session_complete_001",
  rewardType: "session_bonus",
  amount: 50,
  currency: "XP",
  sourceEvent: "session:completed",
};

export function setupMocks(): void {
  jest.mock("../repository");
  jest.mock("../../economy/wallet-service", () => ({
    addCurrency: jest.fn().mockResolvedValue({
      newBalance: 1100,
      earnedAmount: 50,
      transaction: { id: "tx-1", type: "EARN", amount: 50, currency: "COINS" },
    }),
  }));
  jest.mock("../../../config/sentry", () => ({
    captureException: jest.fn(),
    addBreadcrumb: jest.fn(),
  }));
}

setupMocks();
