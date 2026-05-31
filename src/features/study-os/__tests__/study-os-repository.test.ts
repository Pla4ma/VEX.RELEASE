/**
 * Study OS — Repository Tests
 *
 * Covers: listStoredStudyPlans, upsertStoredStudyPlan
 */

import { StudyPlanSchema } from '../schemas';
import { listStoredStudyPlans, upsertStoredStudyPlan } from '../repository';

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

// ─── Repository ──────────────────────────────────────────────────

describe('Repository', () => {
  beforeEach(() => mockStore.clear());

  it('listStoredStudyPlans returns empty array for new user', async () => {
    const plans = await listStoredStudyPlans('new-user');
    expect(plans).toEqual([]);
  });

  it('upsertStoredStudyPlan stores and retrieves plan', async () => {
    const plan = StudyPlanSchema.parse({
      blocks: [
        { estimatedMinutes: 25, id: 'b1', objective: 'Learn X', priority: 'medium', status: 'not_started', studyPlanId: 'p1', title: 'Block 1' },
      ],
      createdAt: 100,
      deadlineAt: null,
      id: 'p1',
      reviewItems: [],
      source: { createdAt: 100, extractedTextStatus: 'none', id: 's1', title: 'Test', type: 'manual', userId: 'user-1' },
      status: 'active',
      title: 'Test Plan',
      userId: 'user-1',
    });
    await upsertStoredStudyPlan(plan);
    const plans = await listStoredStudyPlans('user-1');
    expect(plans).toHaveLength(1);
    expect(plans[0]!.id).toBe('p1');
    expect(plans[0]!.title).toBe('Test Plan');
  });

  it('upsert updates existing plan with same id', async () => {
    const plan1 = StudyPlanSchema.parse({
      blocks: [],
      createdAt: 100,
      deadlineAt: null,
      id: 'p1',
      reviewItems: [],
      source: { createdAt: 100, extractedTextStatus: 'none', id: 's1', title: 'T', type: 'manual', userId: 'user-2' },
      status: 'active',
      title: 'Original',
      userId: 'user-2',
    });
    await upsertStoredStudyPlan(plan1);

    const plan2 = StudyPlanSchema.parse({
      ...plan1,
      title: 'Updated',
    });
    await upsertStoredStudyPlan(plan2);

    const plans = await listStoredStudyPlans('user-2');
    expect(plans).toHaveLength(1);
    expect(plans[0]!.title).toBe('Updated');
  });
});
