import {
  buildDayZeroStudyPreview,
  buildFailedGenerationFallbackPlan,
  buildStudyOsHomeSurface,
  buildStudySessionFromBlock,
  completeStudyBlock,
  completeStudyBlockEnhanced,
  computeStudyOsPremiumGate,
  computeStudyOsUnlockGate,
  createPasteStudyPlan,
  generateRecallQuestion,
  getEmptyRecallFallback,
  getManualStudyFallbackMessage,
  getPlannedBlocksFromPlan,
  isContentStudyBackendAvailable,
  shouldGenerateRecall,
} from '../service';

const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined { return mockStore.get(key); }
    set(key: string, value: string | number | boolean): void { mockStore.set(key, String(value)); }
    delete(key: string): void { mockStore.delete(key); }
    contains(key: string): boolean { return mockStore.has(key); }
    getAllKeys(): string[] { return Array.from(mockStore.keys()); }
  },
}));

describe('study-os service', () => {
  beforeEach(() => mockStore.clear());

  it('paste source creates study plan with review item', async () => {
    const plan = await createPasteStudyPlan({
      now: 10,
      pastedText: 'Photosynthesis converts light into energy. Chlorophyll matters.',
      title: 'Biology notes',
      userId: 'student-1',
    });

    expect(plan.source.type).toBe('paste');
    expect(plan.blocks).toHaveLength(1);
    expect(plan.reviewItems[0]?.prompt).toContain('Photosynthesis');
  });

  it('failed generation returns manual fallback', () => {
    const plan = buildFailedGenerationFallbackPlan({ now: 10, sourceTitle: 'Long PDF', userId: 'student-1' });

    expect(plan.status).toBe('failed_generation');
    expect(plan.blocks[0]?.objective).toContain('Long PDF');
  });

  it('study block starts a student session with context', async () => {
    const plan = await createPasteStudyPlan({ now: 10, pastedText: 'Limits need practice.', title: 'Calc', userId: 'student-1' });
    const brief = buildStudySessionFromBlock(plan.blocks[0]);

    expect(brief.sessionMode).toBe('STUDY');
    expect(brief.successCondition).toContain('Limits');
  });

  it('completion updates review queue', async () => {
    const plan = await createPasteStudyPlan({
      now: 10,
      pastedText: 'Read chapter three.',
      title: 'History',
      userId: 'student-1',
    });
    const updated = await completeStudyBlock({
      blockId: plan.blocks[0]?.id ?? '',
      now: 20,
      reflection: 'Outline worked',
      studyPlanId: plan.id,
      userId: 'student-1',
    });

    expect(updated.blocks[0]?.status).toBe('completed');
    expect(updated.reviewItems).toHaveLength(2);
  });

  it('student lane sees Study OS and non-student hides without plan', () => {
    expect(buildStudyOsHomeSurface({ lane: 'student', plan: null }).hidden).toBe(false);
    expect(buildStudyOsHomeSurface({ lane: 'minimal_normal', plan: null }).hidden).toBe(true);
  });
});

// ─── Phase 10: Day 0 / Unlock Gate ─────────────────────────────────

describe('Study OS unlock gate', () => {
  it('Day 0 blocks full unlock, shows day_zero reason', () => {
    const gate = computeStudyOsUnlockGate({ completedSessions: 0, studyUsageRatio: 0 });
    expect(gate.isUnlocked).toBe(false);
    expect(gate.isDayZero).toBe(true);
    expect(gate.unlockReason).toBe('day_zero');
  });

  it('5 sessions with low ratio still unlocks via evidence_sessions', () => {
    const gate = computeStudyOsUnlockGate({ completedSessions: 5, studyUsageRatio: 0.1 });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe('evidence_sessions');
  });

  it('2 sessions with high study ratio unlocks via evidence_usage', () => {
    const gate = computeStudyOsUnlockGate({ completedSessions: 2, studyUsageRatio: 0.4 });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe('evidence_usage');
  });

  it('3 sessions with low ratio stays locked', () => {
    const gate = computeStudyOsUnlockGate({ completedSessions: 3, studyUsageRatio: 0.1 });
    expect(gate.isUnlocked).toBe(false);
    expect(gate.unlockReason).toBe('first_week');
  });

  it('7+ sessions becomes full unlock', () => {
    const gate = computeStudyOsUnlockGate({ completedSessions: 7, studyUsageRatio: 0.1 });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe('full');
  });

  it('firstWeekPhase 7+ forces full unlock', () => {
    const gate = computeStudyOsUnlockGate({ completedSessions: 2, studyUsageRatio: 0, firstWeekPhase: 7 });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe('full');
  });
});

// ─── Premium Gate ──────────────────────────────────────────────────

describe('Study OS premium gate', () => {
  it('blocks premium depth when RevenueCat unhealthy', () => {
    const gate = computeStudyOsPremiumGate({ hasPremiumEntitlement: true, revenueCatHealthy: false });
    expect(gate.canAccessPremiumDepth).toBe(false);
    expect(gate.basicStudyFree).toBe(true);
    expect(gate.restrictionReason).toContain('degraded');
  });

  it('blocks premium depth when no entitlement', () => {
    const gate = computeStudyOsPremiumGate({ hasPremiumEntitlement: false, revenueCatHealthy: true });
    expect(gate.canAccessPremiumDepth).toBe(false);
    expect(gate.basicStudyFree).toBe(true);
  });

  it('allows premium depth with entitlement and healthy RC', () => {
    const gate = computeStudyOsPremiumGate({ hasPremiumEntitlement: true, revenueCatHealthy: true });
    expect(gate.canAccessPremiumDepth).toBe(true);
    expect(gate.restrictionReason).toBeNull();
  });
});

// ─── Recall Questions ──────────────────────────────────────────────

describe('Recall questions', () => {
  it('generates recall question from block data', () => {
    const recall = generateRecallQuestion({
      blockObjective: 'Understand limits',
      blockTitle: 'Calculus Limits',
      studyBlockId: 'block-1',
      studyPlanId: 'plan-1',
    });

    expect(recall.kind).toBe('recall');
    expect(recall.prompt).toContain('Calculus Limits');
    expect(recall.answerHint).toBeNull();
  });

  it('generates reflection question when reflection given', () => {
    const recall = generateRecallQuestion({
      blockObjective: 'Understand limits',
      blockTitle: 'Calculus Limits',
      reflection: 'I focused on the epsilon-delta definition',
      studyBlockId: 'block-1',
      studyPlanId: 'plan-1',
    });

    expect(recall.kind).toBe('reflection');
    expect(recall.prompt).toContain('Reflect');
    expect(recall.answerHint).toBe('I focused on the epsilon-delta definition');
  });

  it('empty recall fallback returns placeholder', () => {
    const fallback = getEmptyRecallFallback();
    expect(fallback.id).toBe('no-recall');
    expect(fallback.kind).toBe('reflection');
  });

  it('shouldGenerateRecall false when no completed blocks', () => {
    expect(shouldGenerateRecall(null)).toBe(false);
  });

  it('shouldGenerateRecall true when completed blocks exist', async () => {
    const plan = await createPasteStudyPlan({
      now: 10,
      pastedText: 'Read chapter 1.',
      title: 'History',
      userId: 's-1',
    });
    // Mark block completed
    const updated = await completeStudyBlock({
      blockId: plan.blocks[0]?.id ?? '',
      studyPlanId: plan.id,
      userId: 's-1',
      now: 20,
    });
    expect(shouldGenerateRecall(updated)).toBe(true);
  });
});

// ─── Enhanced Completion ───────────────────────────────────────────

describe('Enhanced completion', () => {
  it('returns recall question with completed plan', async () => {
    const plan = await createPasteStudyPlan({
      now: 10,
      pastedText: 'Review cell structure.',
      title: 'Biology',
      userId: 's-1',
    });
    const result = await completeStudyBlockEnhanced({
      blockId: plan.blocks[0]?.id ?? '',
      reflection: 'Memorized organelles',
      studyPlanId: plan.id,
      userId: 's-1',
      now: 20,
    });

    expect(result.plan.blocks[0]?.status).toBe('completed');
    expect(result.recallQuestion).not.toBeNull();
    expect(result.recallQuestion?.kind).toBe('reflection');
    expect(result.recallQuestion?.answerHint).toBe('Memorized organelles');
    expect(result.memoryContent).toContain('Memorized organelles');
    expect(result.memoryTags).toContain('study-block');
  });

  it('returns null suggested next when all blocks complete', async () => {
    const plan = await createPasteStudyPlan({
      now: 10,
      pastedText: 'Chapter one.',
      title: 'Reading',
      userId: 's-1',
    });
    const result = await completeStudyBlockEnhanced({
      blockId: plan.blocks[0]?.id ?? '',
      studyPlanId: plan.id,
      userId: 's-1',
      now: 20,
    });
    // Only one block in paste plan, all completed
    expect(result.suggestedNextBlock).toBeNull();
  });

  it('getPlannedBlocksFromPlan returns not-started blocks', async () => {
    const plan = await createPasteStudyPlan({
      now: 10,
      pastedText: 'Study math.',
      title: 'Math',
      userId: 's-1',
    });
    expect(getPlannedBlocksFromPlan(plan)).toHaveLength(1);
  });
});

// ─── Day 0 Student Preview ─────────────────────────────────────────

describe('Day 0 student preview', () => {
  it('Day 0 preview shows "Start first study block" CTA', () => {
    const preview = buildDayZeroStudyPreview();
    expect(preview.hidden).toBe(false);
    expect(preview.ctaLabel).toContain('Start first study block');
    expect(preview.title).toContain('preview');
    expect(preview.riskLabel).toBeNull();
    expect(preview.offlineFallback).toBeNull();
  });

  it('Day 0 student cannot see upload (no upload CTA on preview)', () => {
    const preview = buildDayZeroStudyPreview();
    expect(preview.ctaLabel).not.toContain('upload');
    expect(preview.ctaLabel).not.toContain('import');
    expect(preview.ctaLabel).not.toContain('paste');
  });
});

// ─── Backend Fallback ──────────────────────────────────────────────

describe('Backend fallback', () => {
  it('isContentStudyBackendAvailable false when degraded', () => {
    expect(isContentStudyBackendAvailable({
      featureHealth: 'degraded',
      aiConfigured: true,
      storageConfigured: true,
    })).toBe(false);
  });

  it('isContentStudyBackendAvailable false when AI not configured', () => {
    expect(isContentStudyBackendAvailable({
      featureHealth: 'healthy',
      aiConfigured: false,
      storageConfigured: true,
    })).toBe(false);
  });

  it('isContentStudyBackendAvailable true when all healthy', () => {
    expect(isContentStudyBackendAvailable({
      featureHealth: 'healthy',
      aiConfigured: true,
      storageConfigured: true,
    })).toBe(true);
  });

  it('manual study fallback offline message', () => {
    expect(getManualStudyFallbackMessage(true)).toContain('offline');
  });

  it('manual study fallback degraded message', () => {
    const msg = getManualStudyFallbackMessage(false);
    expect(msg).toContain('manual study session');
    expect(msg).not.toContain('offline');
  });
});
