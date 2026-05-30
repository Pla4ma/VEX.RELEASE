/**
 * Tests for economy feature types
 */

import type { WalletSummary, SpendError, SpendErrorCode } from "../types";

describe("economy types", () => {
  it("WalletSummary has coins and gems", () => {
    const wallet: WalletSummary = { coins: 100, gems: 5 };
    expect(wallet.coins).toBe(100);
    expect(wallet.gems).toBe(5);
  });

  it("WalletSummary allows zero values", () => {
    const wallet: WalletSummary = { coins: 0, gems: 0 };
    expect(wallet.coins).toBe(0);
    expect(wallet.gems).toBe(0);
  });

  it("SpendError has code and message", () => {
    const error: SpendError = {
      code: "INSUFFICIENT_BALANCE",
      message: "Not enough coins",
    };
    expect(error.code).toBe("INSUFFICIENT_BALANCE");
    expect(error.message).toBe("Not enough coins");
  });

  it("SpendErrorCode covers all expected values", () => {
    const codes: SpendErrorCode[] = [
      "INSUFFICIENT_BALANCE",
      "INVALID_CURRENCY",
      "DB_ERROR",
    ];
    expect(codes).toHaveLength(3);
  });

  it("SpendError accepts all SpendErrorCode values", () => {
    const errors: SpendError[] = [
      { code: "INSUFFICIENT_BALANCE", message: "m1" },
      { code: "INVALID_CURRENCY", message: "m2" },
      { code: "DB_ERROR", message: "m3" },
    ];
    expect(errors).toHaveLength(3);
  });
});
