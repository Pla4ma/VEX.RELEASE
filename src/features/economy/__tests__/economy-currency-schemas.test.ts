/**
 * Tests for CurrencyTypeSchema, SpendInputSchema, and CurrencyGrantSchema
 */

import {
  CurrencyTypeSchema,
  SpendInputSchema,
  CurrencyGrantSchema,
} from "../schemas";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID2 = "550e8400-e29b-41d4-a716-446655440001";

describe("CurrencyTypeSchema", () => {
  it.each(["COINS", "GEMS", "XP", "SEASONAL", "FOCUS_POINTS"])(
    "accepts '%s'",
    (currency) => {
      expect(CurrencyTypeSchema.parse(currency)).toBe(currency);
    },
  );

  it("rejects unknown currency types", () => {
    expect(() => CurrencyTypeSchema.parse("DIAMONDS")).toThrow();
    expect(() => CurrencyTypeSchema.parse("")).toThrow();
    expect(() => CurrencyTypeSchema.parse("coins")).toThrow();
  });
});

describe("SpendInputSchema", () => {
  const validInput = {
    userId: VALID_UUID,
    currency: "COINS" as const,
    amount: 50,
    sink: "shop_purchase",
  };

  it("validates a minimal spend input", () => {
    const result = SpendInputSchema.parse(validInput);
    expect(result.amount).toBe(50);
    expect(result.sink).toBe("shop_purchase");
    expect(result.currency).toBe("COINS");
  });

  it("accepts optional description and metadata", () => {
    const result = SpendInputSchema.parse({
      ...validInput,
      description: "Bought sword",
      metadata: { itemId: "sword-1", rarity: "epic" },
    });
    expect(result.description).toBe("Bought sword");
    expect(result.metadata).toEqual({ itemId: "sword-1", rarity: "epic" });
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

  it("rejects non-UUID userId", () => {
    expect(() =>
      SpendInputSchema.parse({ ...validInput, userId: "bad" }),
    ).toThrow();
  });

  it("rejects invalid currency", () => {
    expect(() =>
      SpendInputSchema.parse({ ...validInput, currency: "INVALID" }),
    ).toThrow();
  });
});

describe("CurrencyGrantSchema", () => {
  const validGrant = {
    userId: VALID_UUID,
    amount: 100,
    currency: "COINS" as const,
    source: "session_complete",
  };

  it("validates a minimal grant", () => {
    const result = CurrencyGrantSchema.parse(validGrant);
    expect(result.amount).toBe(100);
    expect(result.source).toBe("session_complete");
  });

  it("accepts all optional fields", () => {
    const result = CurrencyGrantSchema.parse({
      ...validGrant,
      sourceId: "session-123",
      description: "Session reward",
      skipEvents: true,
      metadata: { bonus: true },
    });
    expect(result.sourceId).toBe("session-123");
    expect(result.description).toBe("Session reward");
    expect(result.skipEvents).toBe(true);
    expect(result.metadata).toEqual({ bonus: true });
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

  it("rejects empty source", () => {
    expect(() =>
      CurrencyGrantSchema.parse({ ...validGrant, source: "" }),
    ).toThrow();
  });

  it("rejects non-UUID userId", () => {
    expect(() =>
      CurrencyGrantSchema.parse({ ...validGrant, userId: "bad" }),
    ).toThrow();
  });
});
