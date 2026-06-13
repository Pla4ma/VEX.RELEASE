import { ChallengeSchema } from '../EventSchemas';

describe('ChallengeSchema', () => {
  const validChallenge = {
    id: 'chl-1',
    title: 'Complete 5 Sessions',
    description: 'Finish 5 focus sessions',
    type: 'SESSION_COUNT',
    status: 'ACTIVE',
    requirement: { target: 5, metric: 'sessions' },
    rewards: [{ type: 'xp', amount: 50 }],
    startAt: Date.now(),
    endAt: Date.now() + 86400000,
    difficulty: 'EASY',
  };

  it('accepts a valid challenge object', () => {
    const result = ChallengeSchema.safeParse(validChallenge);
    expect(result.success).toBe(true);
  });

  it('requires id', () => {
    const { id: _id, ...rest } = validChallenge;
    const result = ChallengeSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('requires difficulty to be a valid enum value', () => {
    const result = ChallengeSchema.safeParse({ ...validChallenge, difficulty: 'IMPOSSIBLE' });
    expect(result.success).toBe(false);
  });

  it('defaults progress to 0', () => {
    const result = ChallengeSchema.safeParse(validChallenge);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.progress).toBe(0);
    }
  });

  it('defaults progressHistory to empty array', () => {
    const result = ChallengeSchema.safeParse(validChallenge);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.progressHistory).toEqual([]);
    }
  });

  it('defaults participants to empty array', () => {
    const result = ChallengeSchema.safeParse(validChallenge);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.participants).toEqual([]);
    }
  });

  it('defaults completedBy to empty array', () => {
    const result = ChallengeSchema.safeParse(validChallenge);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completedBy).toEqual([]);
    }
  });

  it('defaults claimedBy to empty array', () => {
    const result = ChallengeSchema.safeParse(validChallenge);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.claimedBy).toEqual([]);
    }
  });

  it('accepts optional eventId and prerequisites', () => {
    const withOptional = {
      ...validChallenge,
      eventId: 'evt-1',
      prerequisites: ['chl-prev-1'],
    };
    const result = ChallengeSchema.safeParse(withOptional);
    expect(result.success).toBe(true);
  });

  it('accepts optional timeframe in requirement', () => {
    const withTimeframe = {
      ...validChallenge,
      requirement: { target: 5, metric: 'sessions', timeframe: 'daily' },
    };
    const result = ChallengeSchema.safeParse(withTimeframe);
    expect(result.success).toBe(true);
  });
});