/**
 * Tests for WalletSchema
 */

import { WalletSchema } from "../schemas";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID2 = "550e8400-e29b-41d4-a716-446655440001";

describe("WalletSchema", () => {
  it("validates a complete wallet object", () => {
    const result = WalletSchema.parse({
      id: VALID_UUID,
      user_id: VALID_UUID2,
      coins: 100,
      gems: 10,
      created_at: 1000,
      updated_at: 2000,
    });
    expect(result.coins).toBe(100);
    expect(result.gems).toBe(10);
  });

  it("accepts zero coins and gems", () => {
    const result = WalletSchema.parse({
      id: VALID_UUID,
      user_id: VALID_UUID2,
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
        id: VALID_UUID,
        user_id: VALID_UUID2,
        coins: -1,
        gems: 0,
        created_at: 1000,
        updated_at: 1000,
      }),
    ).toThrow();
  });

  it("rejects negative gems", () => {
    expect(() =>
      WalletSchema.parse({
        id: VALID_UUID,
        user_id: VALID_UUID2,
        coins: 0,
        gems: -5,
        created_at: 1000,
        updated_at: 1000,
      }),
    ).toThrow();
  });

  it("rejects non-UUID id", () => {
    expect(() =>
      WalletSchema.parse({
        id: "not-a-uuid",
        user_id: VALID_UUID2,
        coins: 0,
        gems: 0,
        created_at: 1000,
        updated_at: 1000,
      }),
    ).toThrow();
  });

  it("rejects non-UUID user_id", () => {
    expect(() =>
      WalletSchema.parse({
        id: VALID_UUID,
        user_id: "bad-uuid",
        coins: 0,
        gems: 0,
        created_at: 1000,
        updated_at: 1000,
      }),
    ).toThrow();
  });

  it("rejects non-integer coins", () => {
    expect(() =>
      WalletSchema.parse({
        id: VALID_UUID,
        user_id: VALID_UUID2,
        coins: 1.5,
        gems: 0,
        created_at: 1000,
        updated_at: 1000,
      }),
    ).toThrow();
  });
});
