/**
 * Tests for economy index exports
 */

import * as economyIndex from "../index";

describe("economy index exports", () => {
  it("exports SimpleWalletBadge component", () => {
    expect(economyIndex.SimpleWalletBadge).toBeDefined();
  });

  it("exports useWallet hook", () => {
    expect(typeof economyIndex.useWallet).toBe("function");
  });

  it("exports addCurrency from wallet-service", () => {
    expect(typeof economyIndex.addCurrency).toBe("function");
  });

  it("exports spendCurrency from wallet-service", () => {
    expect(typeof economyIndex.spendCurrency).toBe("function");
  });

  it("exports getInsuranceStatus from StreakInsurance", () => {
    expect(typeof economyIndex.getInsuranceStatus).toBe("function");
  });
});
