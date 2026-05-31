/**
 * Tests for repository.ts (mapActivePlanToLearningTarget).
 */

import { mapActivePlanToLearningTarget } from '../repository';

describe('repository – mapActivePlanToLearningTarget', () => {
  it('returns null when plan is null', () => {
    const result = mapActivePlanToLearningTarget({
      plan: null,
      persona: 'student',
    });
    expect(result).toBeNull();
  });

  it('maps a full active plan to a LearningSessionTarget', () => {
    const plan = {
      contentId: 'content-abc',
      generationId: 'gen-123',
      nextTask: { id: 'task-42', content: 'Chapter 3: Photosynthesis' },
      remainingMinutes: 25,
      title: 'Biology Study Plan',
    };
    const result = mapActivePlanToLearningTarget({
      plan,
      persona: 'student',
    });
    expect(result).not.toBeNull();
    expect(result!.contentId).toBe('content-abc');
    expect(result!.generationId).toBe('gen-123');
    expect(result!.nextTaskId).toBe('task-42');
    expect(result!.focusAreas).toEqual(['Chapter 3: Photosynthesis']);
    expect(result!.persona).toBe('student');
    expect(result!.remainingMinutes).toBe(25);
    expect(result!.title).toBe('Biology Study Plan');
  });

  it('sets nextTaskId to null and focusAreas to empty when nextTask is missing', () => {
    const plan = {
      contentId: 'content-xyz',
      generationId: 'gen-456',
      nextTask: null,
      remainingMinutes: 10,
      title: 'Quick Focus',
    };
    const result = mapActivePlanToLearningTarget({
      plan,
      persona: 'work',
    });
    expect(result).not.toBeNull();
    expect(result!.nextTaskId).toBeNull();
    expect(result!.focusAreas).toEqual([]);
    expect(result!.persona).toBe('work');
  });

  it('clamps remainingMinutes to at least 1', () => {
    const plan = {
      contentId: 'c1',
      generationId: 'g1',
      nextTask: null,
      remainingMinutes: 0,
      title: 'Zero min',
    };
    const result = mapActivePlanToLearningTarget({
      plan,
      persona: 'growth',
    });
    expect(result!.remainingMinutes).toBe(1);
  });

  it('passes through all persona values correctly', () => {
    const plan = {
      contentId: 'c1',
      generationId: 'g1',
      nextTask: null,
      remainingMinutes: 15,
      title: 'Test',
    };
    const personae = ['student', 'work', 'creative', 'growth', 'learning'] as const;
    for (const persona of personae) {
      const result = mapActivePlanToLearningTarget({ plan, persona });
      expect(result!.persona).toBe(persona);
    }
  });
});
