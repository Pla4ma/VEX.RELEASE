import { TransactionSchema } from "./schema-test-schemas";

describe("Zod Schema Example Tests", () => {
  describe("validation success", () => {
    it("should validate a valid transaction", () => {
      const data = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "user-123",
        type: "EARN",
        currency: "COINS",
        amount: 100,
        description: "Test transaction",
      };
      const result = TransactionSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(100);
        expect(result.data.type).toBe("EARN");
      }
    });
    it("should apply default values", () => {
      const data = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "user-123",
        type: "SPEND",
        currency: "GEMS",
        amount: 50,
      };
      const result = TransactionSchema.parse(data);
      expect(result.metadata).toBeUndefined();
      expect(result.createdAt).toBeDefined();
    });
    it("should handle optional fields", () => {
      const data = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "user-123",
        type: "CONVERT",
        currency: "COINS",
        amount: 1000,
      };
      const result = TransactionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
  describe("validation failures", () => {
    it("should reject invalid currency type", () => {
      const data = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "user-123",
        type: "EARN",
        currency: "INVALID_CURRENCY",
        amount: 100,
      };
      const result = TransactionSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("currency");
      }
    });
    it("should reject negative amounts", () => {
      const data = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "user-123",
        type: "EARN",
        currency: "COINS",
        amount: -100,
      };
      const result = TransactionSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("greater than 0");
      }
    });
    it("should reject zero amounts", () => {
      const data = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "user-123",
        type: "EARN",
        currency: "COINS",
        amount: 0,
      };
      const result = TransactionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
    it("should reject missing required fields", () => {
      const data = { id: "550e8400-e29b-41d4-a716-446655440000" };
      const result = TransactionSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });
    it("should reject invalid UUID format", () => {
      const data = {
        id: "not-a-uuid",
        userId: "user-123",
        type: "EARN",
        currency: "COINS",
        amount: 100,
      };
      const result = TransactionSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("id");
      }
    });
  });
});
