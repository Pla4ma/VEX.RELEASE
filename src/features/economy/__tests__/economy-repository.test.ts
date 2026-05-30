import { RepositoryError } from "../repository";

describe("RepositoryError", () => {
  it("constructs with operation and PostgrestError-like cause", () => {
    const cause = new Error("connection failed");
    const error = new RepositoryError("fetchWallet", cause);
    expect(error.name).toBe("RepositoryError");
    expect(error.operation).toBe("fetchWallet");
    expect(error.message).toContain("fetchWallet");
    expect(error.message).toContain("connection failed");
    expect(error.cause).toBe(cause);
  });

  it("is an instance of Error", () => {
    const error = new RepositoryError("op", new Error("fail"));
    expect(error).toBeInstanceOf(Error);
  });

  it("preserves the operation field", () => {
    const error = new RepositoryError("spendCurrency", new Error("db down"));
    expect(error.operation).toBe("spendCurrency");
  });
});
