import {
  AccountDeletionInputSchema,
  AccountDeletionResultSchema,
} from '../schemas';

describe('AccountDeletionInputSchema', () => {
  it('validates correct input', () => {
    const result = AccountDeletionInputSchema.safeParse({
      userId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID', () => {
    expect(AccountDeletionInputSchema.safeParse({ userId: 'not-uuid' }).success).toBe(false);
  });

  it('rejects missing userId', () => {
    expect(AccountDeletionInputSchema.safeParse({}).success).toBe(false);
  });
});

describe('AccountDeletionResultSchema', () => {
  const validResult = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    deletedAt: 1234567890,
    localStorageCleared: true,
    secureStorageCleared: true,
    monetizationSignedOut: false,
  };

  it('validates correct result', () => {
    expect(AccountDeletionResultSchema.safeParse(validResult).success).toBe(true);
  });

  it('requires positive deletedAt', () => {
    expect(AccountDeletionResultSchema.safeParse({ ...validResult, deletedAt: 0 }).success).toBe(false);
    expect(AccountDeletionResultSchema.safeParse({ ...validResult, deletedAt: -1 }).success).toBe(false);
  });

  it('requires boolean flags', () => {
    expect(AccountDeletionResultSchema.safeParse({ ...validResult, localStorageCleared: 'yes' }).success).toBe(false);
  });

  it('rejects extra properties (strict)', () => {
    expect(AccountDeletionResultSchema.safeParse({ ...validResult, extra: 'field' }).success).toBe(false);
  });
});
