import {
  RewardLedgerStatusSchema,
  RewardLedgerRecordSchema,
  CreateRewardLedgerInputSchema,
} from '../schemas';

describe('RewardLedgerStatusSchema', () => {
  it('accepts valid statuses', () => {
    for (const s of ['pending', 'delivered', 'failed', 'expired']) {
      expect(RewardLedgerStatusSchema.safeParse(s).success).toBe(true);
    }
  });

  it('rejects invalid statuses', () => {
    expect(RewardLedgerStatusSchema.safeParse('unknown').success).toBe(false);
  });
});

describe('RewardLedgerRecordSchema', () => {
  const validRecord = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    idempotencyKey: 'key-1',
    rewardType: 'session_complete',
    amount: 100,
    currency: 'XP',
    status: 'delivered',
    sourceEvent: 'session.complete',
    createdAt: '2024-01-01T00:00:00.000Z',
    deliveredAt: '2024-01-01T00:01:00.000Z',
    failedReason: null,
    expiresAt: null,
  };

  it('validates correct record', () => {
    expect(RewardLedgerRecordSchema.safeParse(validRecord).success).toBe(true);
  });

  it('requires valid UUIDs', () => {
    expect(RewardLedgerRecordSchema.safeParse({ ...validRecord, id: 'not-uuid' }).success).toBe(false);
    expect(RewardLedgerRecordSchema.safeParse({ ...validRecord, userId: 'not-uuid' }).success).toBe(false);
  });

  it('requires valid currency', () => {
    expect(RewardLedgerRecordSchema.safeParse({ ...validRecord, currency: 'USD' }).success).toBe(false);
  });

  it('allows nullable deliveredAt and failedReason', () => {
    expect(RewardLedgerRecordSchema.safeParse({ ...validRecord, deliveredAt: null }).success).toBe(true);
    expect(RewardLedgerRecordSchema.safeParse({ ...validRecord, failedReason: 'error' }).success).toBe(true);
  });
});

describe('CreateRewardLedgerInputSchema', () => {
  const validInput = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    idempotencyKey: 'key-1',
    rewardType: 'session_complete',
    amount: 100,
    currency: 'XP',
    sourceEvent: 'session.complete',
  };

  it('validates correct input', () => {
    expect(CreateRewardLedgerInputSchema.safeParse(validInput).success).toBe(true);
  });

  it('requires positive amount', () => {
    expect(CreateRewardLedgerInputSchema.safeParse({ ...validInput, amount: 0 }).success).toBe(false);
    expect(CreateRewardLedgerInputSchema.safeParse({ ...validInput, amount: -1 }).success).toBe(false);
  });

  it('allows optional expiresAt', () => {
    expect(CreateRewardLedgerInputSchema.safeParse({ ...validInput, expiresAt: '2024-12-31T00:00:00.000Z' }).success).toBe(true);
  });
});
