import {
  computeWeakTopics,
} from '../service';
import type { StudyPlan } from '../../study-os/schemas';

const basePlan: StudyPlan = {
  blocks: [],
  createdAt: 1000,
  deadlineAt: null,
  id: 'plan-1',
  reviewItems: [],
  source: {
    createdAt: 1000,
    extractedTextStatus: 'none',
    id: 'src-1',
    title: 'Biology',
    type: 'manual',
    userId: 'u-1',
  },
  status: 'active',
  title: 'Biology basics',
  userId: 'u-1',
};

describe('computeWeakTopics', () => {
  it('returns empty array when no plans', () => {
    expect(computeWeakTopics([])).toEqual([]);
  });

  it('returns empty array when plans have no blocks or review items', () => {
    expect(computeWeakTopics([basePlan])).toEqual([]);
  });

  it('detects weak topics from weak confidence review items', () => {
    const plan: StudyPlan = {
      ...basePlan,
      blocks: [
        {
          estimatedMinutes: 25,
          id: 'b-1',
          objective: 'Understand how mitochondria produce energy in cells',
          priority: 'medium',
          status: 'completed',
          studyPlanId: 'plan-1',
          title: 'Cellular respiration basics',
        },
      ],
      reviewItems: [
        {
          answerHint: null,
          confidence: 'weak',
          dueAt: 2000,
          id: 'r-1',
          prompt:
            'Explain how mitochondria function in cellular respiration',
          studyPlanId: 'plan-1',
        },
      ],
    };

    const topics = computeWeakTopics([plan]);
    expect(topics.length).toBeGreaterThan(0);
    expect(topics.some((t) => t.confidence === 'weak')).toBe(true);
  });

  it('caps results at 5 weak topics', () => {
    const blocks = Array.from({ length: 10 }, (_, i) => ({
      estimatedMinutes: 25,
      id: `b-${i}`,
      objective: `Unique topic objective number ${i} about science`,
      priority: 'medium' as const,
      status: 'completed' as const,
      studyPlanId: 'plan-1',
      title: `Topic ${i} science biology chemistry physics`,
    }));

    const reviewItems = Array.from({ length: 10 }, (_, i) => ({
      answerHint: null,
      confidence: 'weak' as const,
      dueAt: 2000,
      id: `r-${i}`,
      prompt: `Topic ${i} science biology chemistry physics review question`,
      studyPlanId: 'plan-1',
    }));

    const plan: StudyPlan = {
      ...basePlan,
      blocks,
      reviewItems,
    };

    const topics = computeWeakTopics([plan], 5000);
    expect(topics.length).toBeLessThanOrEqual(5);
  });

  it('generates suggested action text for weak topics', () => {
    const plan: StudyPlan = {
      ...basePlan,
      createdAt: 100,
      blocks: [
        {
          estimatedMinutes: 25,
          id: 'b-1',
          objective: 'understanding neural networks',
          priority: 'medium',
          status: 'completed',
          studyPlanId: 'plan-1',
          title: 'neural',
        },
      ],
      reviewItems: [
        {
          answerHint: null,
          confidence: 'weak',
          dueAt: 200,
          id: 'r-1',
          prompt: 'neural understanding basics',
          studyPlanId: 'plan-1',
        },
      ],
    };

    const topics = computeWeakTopics([plan], 200);
    for (const topic of topics) {
      expect(topic.suggestedAction).toBeTruthy();
      expect(topic.suggestedAction.length).toBeGreaterThan(0);
    }
  });

  it('uses current time when now is not provided', () => {
    const plan: StudyPlan = {
      ...basePlan,
      createdAt: Date.now() - 100,
      blocks: [
        {
          estimatedMinutes: 25,
          id: 'b-1',
          objective: 'understanding quantum physics basics',
          priority: 'medium',
          status: 'completed',
          studyPlanId: 'plan-1',
          title: 'quantum',
        },
      ],
      reviewItems: [
        {
          answerHint: null,
          confidence: 'weak',
          dueAt: Date.now(),
          id: 'r-1',
          prompt: 'quantum physics basics understanding',
          studyPlanId: 'plan-1',
        },
      ],
    };

    expect(() => computeWeakTopics([plan])).not.toThrow();
  });
});
