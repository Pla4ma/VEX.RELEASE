/**
 * Tests for wallet-service exports and types
 */

import {
  addCurrency as walletAddCurrency,
  spendCurrency as walletSpendCurrency,
} from "../wallet-service";
import type { CurrencyGrant, SpendRequest } from "../wallet-service";

const VALID_UUID2 = "550e8400-e29b-41d4-a716-446655440001";

describe("wallet-service exports", () => {
  it("exports addCurrency function", () => {
    expect(typeof walletAddCurrency).toBe("function");
  });

  it("exports spendCurrency function", () => {
    expect(typeof walletSpendCurrency).toBe("function");
  });

  it("CurrencyGrant interface has expected shape", () => {
    const grant: CurrencyGrant = {
      userId: VALID_UUID2,
      amount: 100,
      currency: "COINS",
      source: "test",
    };
    expect(grant.userId).toBe(VALID_UUID2);
    expect(grant.amount).toBe(100);
  });

  it("SpendRequest interface has expected shape", () => {
    const req: SpendRequest = {
      userId: VALID_UUID2,
      currency: "COINS",
      amount: 50,
      sink: "shop",
    };
    expect(req.sink).toBe("shop");
  });
});
