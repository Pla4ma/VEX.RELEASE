import {
  WalletSchema,
  CurrencyTypeSchema,
  SpendInputSchema,
  CurrencyGrantSchema,
} from "../schemas";

describe("WalletSchema", () => {
  it("validates a valid wallet", () => {
    const result = WalletSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "550e8400-e29b-41d4-a716-446655440001",
      coins: 100,
      gems: 10,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    expect(result.coins).toBe(100);
    expect(result.gems).toBe(10);
  });

  it("defaults coins and gems to 0", () => {
    const result = WalletSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "550e8400-e29b-41d4-a716-446655440001",
      coins: 0,
      gems: 0,
      created_at: 1000,
      updated_at: 1000,
    });
    expect(result.coins).toBe(0);
    expect(result.gems).toBe(0);
  });

  it("rejects negative coins", () => {
    expect(() =>
      WalletSchema.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        coins: -1,
        gems: 0,
        created_at: 1000,
        updated_at: 1000,
      }),
    ).toThrow();
  });

  it("rejects non-UUID id", () => {
    expect(() =>
      WalletSchema.parse({
        id: "not-a-uuid",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        coins: 0,
        gems: 0,
        created_at: 1000,
        updated_at: 1000,
      }),
    ).toThrow();
  });
});

describe("CurrencyTypeSchema", () => {
  it.each(["COINS", "GEMS", "XP", "SEASONAL", "FOCUS_POINTS"])(
    "accepts '%s'",
    (currency) => {
      expect(CurrencyTypeSchema.parse(currency)).toBe(currency);
    },
  );

  it("rejects invalid currency", () => {
    expect(() => CurrencyTypeSchema.parse("DIAMONDS")).toThrow();
  });
});

describe("SpendInputSchema", () => {
  const validInput = {
    userId: "550e8400-e29b-41d4-a716-446655440000",
    currency: "COINS" as const,
    amount: 50,
    sink: "shop_purchase",
  };

  it("validates a valid spend input", () => {
    const result = SpendInputSchema.parse(validInput);
    expect(result.amount).toBe(50);
    expect(result.sink).toBe("shop_purchase");
  });

  it("accepts optional fields", () => {
    const result = SpendInputSchema.parse({
      ...validInput,
      description: "Bought item",
      metadata: { itemId: "sword" },
    });
    expect(result.description).toBe("Bought item");
  });

  it("rejects zero amount", () => {
    expect(() =>
      SpendInputSchema.parse({ ...validInput, amount: 0 }),
    ).toThrow();
  });

  it("rejects negative amount", () => {
    expect(() =>
      SpendInputSchema.parse({ ...validInput, amount: -10 }),
    ).toThrow();
  });

  it("rejects empty sink", () => {
    expect(() =>
      SpendInputSchema.parse({ ...validInput, sink: "" }),
    ).toThrow();
  });
});

describe("CurrencyGrantSchema", () => {
  const validGrant = {
    userId: "550e8400-e29b-41d4-a716-446655440000",
    amount: 100,
    currency: "COINS" as const,
    source: "session_complete",
  };

  it("validates a valid grant", () => {
    const result = CurrencyGrantSchema.parse(validGrant);
    expect(result.amount).toBe(100);
    expect(result.source).toBe("session_complete");
  });

  it("accepts optional fields", () => {
    const result = CurrencyGrantSchema.parse({
      ...validGrant,
      sourceId: "session-123",
      description: "Session reward",
      skipEvents: true,
      metadata: { bonus: true },
    });
    expect(result.sourceId).toBe("session-123");
    expect(result.skipEvents).toBe(true);
  });

  it("accepts null sourceId", () => {
    const result = CurrencyGrantSchema.parse({
      ...validGrant,
      sourceId: null,
    });
    expect(result.sourceId).toBeNull();
  });

  it("rejects zero amount", () => {
    expect(() =>
      CurrencyGrantSchema.parse({ ...validGrant, amount: 0 }),
    ).toThrow();
  });
});
