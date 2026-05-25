import {
  buildFailedGenerationFallbackPlan,
  buildStudyOsHomeSurface,
  buildStudySessionFromBlock,
  completeStudyBlock,
  createPasteStudyPlan,
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
    const plan = await createPasteStudyPlan({ now: 10, pastedText: 'Read chapter three.', title: 'History', userId: 'student-1' });
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
