import {
  CompletionStatusSchema,
  ReflectionStatusSchema,
  FocusContractSchema,
  FocusContractInputSchema,
} from '../schemas';

describe('CompletionStatusSchema', () => {
  it('accepts valid statuses', () => {
    for (const s of ['done', 'partial', 'not_done', 'skipped']) {
      expect(CompletionStatusSchema.safeParse(s).success).toBe(true);
    }
  });

  it('rejects invalid statuses', () => {
    expect(CompletionStatusSchema.safeParse('in_progress').success).toBe(false);
  });
});

describe('ReflectionStatusSchema', () => {
  it('accepts valid statuses', () => {
    for (const s of ['done', 'partial', 'not_done']) {
      expect(ReflectionStatusSchema.safeParse(s).success).toBe(true);
    }
  });

  it('rejects skipped', () => {
    expect(ReflectionStatusSchema.safeParse('skipped').success).toBe(false);
  });
});

describe('FocusContractSchema', () => {
  const validContract = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    sessionId: '550e8400-e29b-41d4-a716-446655440001',
    userId: '550e8400-e29b-41d4-a716-446655440002',
    taskDescription: 'Complete chapter 5',
    completionStatus: 'done',
    reflectionAt: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  it('validates correct contract', () => {
    expect(FocusContractSchema.safeParse(validContract).success).toBe(true);
  });

  it('requires valid UUIDs', () => {
    expect(FocusContractSchema.safeParse({ ...validContract, id: 'not-uuid' }).success).toBe(false);
  });

  it('requires taskDescription between 3 and 80 chars after trim', () => {
    expect(FocusContractSchema.safeParse({ ...validContract, taskDescription: 'ab' }).success).toBe(false);
    expect(FocusContractSchema.safeParse({ ...validContract, taskDescription: 'a'.repeat(81) }).success).toBe(false);
  });

  it('allows nullable completionStatus and reflectionAt', () => {
    expect(FocusContractSchema.safeParse({ ...validContract, completionStatus: null }).success).toBe(true);
    expect(FocusContractSchema.safeParse({ ...validContract, reflectionAt: null }).success).toBe(true);
  });
});

describe('FocusContractInputSchema', () => {
  it('validates correct input', () => {
    expect(FocusContractInputSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      taskDescription: 'Study for 30 min',
    }).success).toBe(true);
  });

  it('allows optional taskDescription', () => {
    expect(FocusContractInputSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
    }).success).toBe(true);
  });

  it('rejects taskDescription over 80 chars', () => {
    expect(FocusContractInputSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      taskDescription: 'a'.repeat(81),
    }).success).toBe(false);
  });
});
