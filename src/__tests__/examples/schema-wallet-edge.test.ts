import { TransactionSchema, WalletSchema } from './schema-test-schemas';

describe('Zod Schema Example Tests', () => {
  describe('wallet schema validation', () => {
    it('should validate wallet with all currencies', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user-123',
        coins: 5000,
        gems: 100,
        seasonal: { 'season-1': 50, 'season-2': 25 },
      };
      const result = WalletSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.seasonal['season-1']).toBe(50);
      }
    });
    it('should apply default values for missing fields', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user-123',
      };
      const result = WalletSchema.parse(data);
      expect(result.coins).toBe(0);
      expect(result.gems).toBe(0);
      expect(result.seasonal).toEqual({});
    });
    it('should reject negative balances', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user-123',
        coins: -100,
      };
      const result = WalletSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
    it('should validate seasonal currency amounts are integers', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user-123',
        seasonal: { 'season-1': 50.5 },
      };
      const result = WalletSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: '',
        type: 'EARN',
        currency: 'COINS',
        amount: 100,
      };
      const result = TransactionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
    it('should handle very large numbers', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user-123',
        type: 'EARN',
        currency: 'COINS',
        amount: Number.MAX_SAFE_INTEGER,
      };
      const result = TransactionSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(Number.MAX_SAFE_INTEGER);
      }
    });
    it('should handle description max length', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user-123',
        type: 'EARN',
        currency: 'COINS',
        amount: 100,
        description: 'a'.repeat(256),
      };
      const result = TransactionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
    it('should strip unknown fields', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user-123',
        type: 'EARN',
        currency: 'COINS',
        amount: 100,
        unknownField: 'should be stripped',
        anotherUnknown: 123,
      };
      const StrictSchema = TransactionSchema.strict();
      const result = StrictSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.message.includes('Unrecognized')),
        ).toBe(true);
      }
    });
  });
});
