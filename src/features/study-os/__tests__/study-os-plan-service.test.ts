/**
 * Study OS — Plan Service Tests
 *
 * Covers: createManualStudyPlan, createPasteStudyPlan,
 *         buildFailedGenerationFallbackPlan, completeStudyBlock
 */

import {
  createManualStudyPlan,
  createPasteStudyPlan,
  buildFailedGenerationFallbackPlan,
  completeStudyBlock,
} from '../service';

// ─── Mock external dependencies ──────────────────────────────────

const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    }
    set(key: string, value: string | number | boolean): void {
      mockStore.set(key, String(value));
    }
    delete(key: string): void {
      mockStore.delete(key);
    }
    contains(key: string): boolean {
      return mockStore.has(key);
    }
    getAllKeys(): string[] {
      return Array.from(mockStore.keys());
    }
  },
}));

jest.mock('../../../session/modes', () => ({
  SessionMode: {
    STUDY: 'STUDY',
    FOCUS: 'FOCUS',
  },
}));

jest.mock('../../session-start/service', () => ({
  buildLaneSessionBrief: jest.fn((input: { durationSeconds: number; lane: string }) => ({
    durationSeconds: input.durationSeconds,
    lane: input.lane,
    mode: 'study',
  })),
}));

// ─── Study Plan Service ──────────────────────────────────────────

describe('Study Plan Service', () => {
  beforeEach(() => mockStore.clear());

  it('createManualStudyPlan creates plan with manual source', async () => {
    const plan = await createManualStudyPlan({
      objective: 'Learn algebra basics',
      title: 'Algebra 101',
      userId: 'student-1',
      now: 1000,
    });
    expect(plan.source.type).toBe('manual');
    expect(plan.status).toBe('active');
    expect(plan.blocks).toHaveLength(1);
    expect(plan.blocks[0]!.objective).toBe('Learn algebra basics');
    expect(plan.reviewItems).toHaveLength(0);
    expect(plan.userId).toBe('student-1');
  });

  it('createPasteStudyPlan creates plan with paste source and review item', async () => {
    const plan = await createPasteStudyPlan({
      pastedText: 'Photosynthesis converts light into energy. It is essential for life.',
      title: 'Biology',
      userId: 'student-2',
      now: 2000,
    });
    expect(plan.source.type).toBe('paste');
    expect(plan.source.extractedTextStatus).toBe('ready');
    expect(plan.blocks).toHaveLength(1);
    expect(plan.reviewItems).toHaveLength(1);
    expect(plan.reviewItems[0]!.confidence).toBe('unknown');
  });

  it('createPasteStudyPlan uses firstSentence as objective', async () => {
    const plan = await createPasteStudyPlan({
      pastedText: "Newton's laws govern motion. F=ma is key.",
      title: 'Physics',
      userId: 'student-3',
      now: 3000,
    });
    expect(plan.blocks[0]!.objective).toBe("Newton's laws govern motion");
  });

  it('buildFailedGenerationFallbackPlan returns failed_generation status', () => {
    const plan = buildFailedGenerationFallbackPlan({
      sourceTitle: 'Complex PDF',
      userId: 'student-4',
      now: 4000,
    });
    expect(plan.status).toBe('failed_generation');
    expect(plan.source.extractedTextStatus).toBe('failed');
    expect(plan.blocks[0]!.objective).toContain('Complex PDF');
  });

  it('completeStudyBlock marks block as completed and adds review item', async () => {
    const plan = await createManualStudyPlan({
      objective: 'Learn geometry',
      title: 'Geometry',
      userId: 'student-5',
      now: 5000,
    });
    const updated = await completeStudyBlock({
      blockId: plan.blocks[0]!.id,
      studyPlanId: plan.id,
      userId: 'student-5',
      reflection: 'Shapes are interesting',
      now: 6000,
    });
    expect(updated.blocks[0]!.status).toBe('completed');
    expect(updated.reviewItems.length).toBeGreaterThanOrEqual(1);
  });

  it('completeStudyBlock throws if plan not found', async () => {
    await expect(
      completeStudyBlock({
        blockId: 'b1',
        studyPlanId: 'nonexistent',
        userId: 'student-x',
        now: 9000,
      }),
    ).rejects.toThrow('Study plan could not be found');
  });

  it('completeStudyBlock sets plan status to completed when all blocks done', async () => {
    const plan = await createManualStudyPlan({
      objective: 'Learn calculus',
      title: 'Calculus',
      userId: 'student-6',
      now: 10000,
    });
    const updated = await completeStudyBlock({
      blockId: plan.blocks[0]!.id,
      studyPlanId: plan.id,
      userId: 'student-6',
      now: 11000,
    });
    expect(updated.status).toBe('completed');
  });
});
