import * as economyIndex from "../index";

describe("economy index exports", () => {
  it("exports SimpleWalletBadge", () => {
    expect(economyIndex.SimpleWalletBadge).toBeDefined();
  });

  it("exports useWallet", () => {
    expect(typeof economyIndex.useWallet).toBe("function");
  });

  it("exports addCurrency", () => {
    expect(typeof economyIndex.addCurrency).toBe("function");
  });

  it("exports spendCurrency", () => {
    expect(typeof economyIndex.spendCurrency).toBe("function");
  });

  it("exports getInsuranceStatus", () => {
    expect(typeof economyIndex.getInsuranceStatus).toBe("function");
  });
});
