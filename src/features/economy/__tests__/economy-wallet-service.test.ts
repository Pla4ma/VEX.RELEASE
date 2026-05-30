jest.mock("../wallet-service", () => {
  const actual = jest.requireActual("../wallet-service");
  return actual;
});

import {
  addCurrency as walletAddCurrency,
  spendCurrency as walletSpendCurrency,
} from "../wallet-service";

describe("wallet-service exports", () => {
  it("exports addCurrency function", () => {
    expect(typeof walletAddCurrency).toBe("function");
  });

  it("exports spendCurrency function", () => {
    expect(typeof walletSpendCurrency).toBe("function");
  });
});
