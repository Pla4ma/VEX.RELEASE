import {
  StudySourceSchema,
  StudyBlockSchema,
  StudyOsHomeSurfaceSchema,
  StudyOsUnlockGateSchema,
  StudyOsPremiumGateSchema,
  RecallQuestionSchema,
} from '../schemas';

describe('StudySourceSchema', () => {
  const validSource = {
    createdAt: 1234567890,
    extractedTextStatus: 'ready',
    id: 'src-1',
    title: 'Test Source',
    type: 'paste',
    userId: 'user-1',
  };

  it('validates correct source', () => {
    expect(StudySourceSchema.safeParse(validSource).success).toBe(true);
  });

  it('rejects invalid type', () => {
    expect(StudySourceSchema.safeParse({ ...validSource, type: 'invalid' }).success).toBe(false);
  });

  it('rejects invalid extractedTextStatus', () => {
    expect(StudySourceSchema.safeParse({ ...validSource, extractedTextStatus: 'done' }).success).toBe(false);
  });
});

describe('StudyBlockSchema', () => {
  const validBlock = {
    estimatedMinutes: 30,
    id: 'block-1',
    objective: 'Learn chapter 1',
    priority: 'high',
    status: 'not_started',
    studyPlanId: 'plan-1',
    title: 'Block 1',
  };

  it('validates correct block', () => {
    expect(StudyBlockSchema.safeParse(validBlock).success).toBe(true);
  });

  it('requires estimatedMinutes between 5 and 180', () => {
    expect(StudyBlockSchema.safeParse({ ...validBlock, estimatedMinutes: 4 }).success).toBe(false);
    expect(StudyBlockSchema.safeParse({ ...validBlock, estimatedMinutes: 181 }).success).toBe(false);
  });

  it('rejects invalid priority', () => {
    expect(StudyBlockSchema.safeParse({ ...validBlock, priority: 'urgent' }).success).toBe(false);
  });

  it('rejects invalid status', () => {
    expect(StudyBlockSchema.safeParse({ ...validBlock, status: 'in_progress' }).success).toBe(false);
  });
});

describe('StudyOsHomeSurfaceSchema', () => {
  const validSurface = {
    ctaLabel: 'Start Studying',
    hidden: false,
    offlineFallback: 'Study offline',
    riskLabel: 'Low priority',
    title: 'Study OS',
  };

  it('validates correct surface', () => {
    expect(StudyOsHomeSurfaceSchema.safeParse(validSurface).success).toBe(true);
  });

  it('allows nullable offlineFallback and riskLabel', () => {
    expect(StudyOsHomeSurfaceSchema.safeParse({ ...validSurface, offlineFallback: null }).success).toBe(true);
    expect(StudyOsHomeSurfaceSchema.safeParse({ ...validSurface, riskLabel: null }).success).toBe(true);
  });
});

describe('StudyOsUnlockGateSchema', () => {
  const validGate = {
    isUnlocked: true,
    isDayZero: false,
    completedSessions: 3,
    studyUsageRatio: 0.5,
    unlockReason: 'evidence_sessions',
  };

  it('validates correct gate', () => {
    expect(StudyOsUnlockGateSchema.safeParse(validGate).success).toBe(true);
  });

  it('requires studyUsageRatio between 0 and 1', () => {
    expect(StudyOsUnlockGateSchema.safeParse({ ...validGate, studyUsageRatio: -0.1 }).success).toBe(false);
    expect(StudyOsUnlockGateSchema.safeParse({ ...validGate, studyUsageRatio: 1.1 }).success).toBe(false);
  });

  it('rejects invalid unlockReason', () => {
    expect(StudyOsUnlockGateSchema.safeParse({ ...validGate, unlockReason: 'invalid' }).success).toBe(false);
  });
});

describe('StudyOsPremiumGateSchema', () => {
  const validGate = {
    canAccessPremiumDepth: false,
    revenueCatHealthy: true,
    basicStudyFree: true,
    restrictionReason: null,
  };

  it('validates correct gate', () => {
    expect(StudyOsPremiumGateSchema.safeParse(validGate).success).toBe(true);
  });

  it('allows nullable restrictionReason', () => {
    expect(StudyOsPremiumGateSchema.safeParse({ ...validGate, restrictionReason: 'Premium only' }).success).toBe(true);
  });
});

describe('RecallQuestionSchema', () => {
  const validQuestion = {
    id: 'q-1',
    prompt: 'What is the capital of France?',
    answerHint: 'City of Light',
    kind: 'recall',
    studyBlockId: 'block-1',
    studyPlanId: 'plan-1',
  };

  it('validates correct question', () => {
    expect(RecallQuestionSchema.safeParse(validQuestion).success).toBe(true);
  });

  it('rejects invalid kind', () => {
    expect(RecallQuestionSchema.safeParse({ ...validQuestion, kind: 'quiz' }).success).toBe(false);
  });

  it('allows nullable answerHint', () => {
    expect(RecallQuestionSchema.safeParse({ ...validQuestion, answerHint: null }).success).toBe(true);
  });
});
