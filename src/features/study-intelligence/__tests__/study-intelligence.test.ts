import {
  computeWeakTopics,
  computeWeeklyIntelligence,
  hasWeeklyIntelligenceData,
} from '../service';
import type { StudyPlan } from '../../study-os/schemas';
import type {} from '../schemas';

const basePlan = {
  blocks: [],
  createdAt: 1000,
  deadlineAt: null,
  id: 'plan-1',
  reviewItems: [],
  source: {
    createdAt: 1000,
    extractedTextStatus: 'none' as const,
    id: 'src-1',
    title: 'Biology',
    type: 'manual' as const,
    userId: 'u-1',
  },
  status: 'active' as const,
  title: 'Biology basics',
  userId: 'u-1',
};

describe('weekly intelligence', () => {
  describe('computeWeakTopics', () => {
    it('returns empty array when no plans', () => {
      expect(computeWeakTopics([])).toEqual([]);
    });

    it('detects weak topics from uncompleted review items', () => {
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
            prompt: 'Explain how mitochondria function in cellular respiration',
            studyPlanId: 'plan-1',
          },
        ],
      };

      const topics = computeWeakTopics([plan]);
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.some((t) => t.confidence === 'weak')).toBe(true);
    });

    it('computes weak topics without crashing on valid data', () => {
      const nowTs = Date.now();
      const plan: StudyPlan = {
        ...basePlan,
        createdAt: nowTs - 100,
        blocks: [
          {
            estimatedMinutes: 25,
            id: 'b-1',
            objective: 'understanding photosynthesis',
            priority: 'medium',
            status: 'completed',
            studyPlanId: 'plan-1',
            title: 'biology',
          },
        ],
        reviewItems: [
          {
            answerHint: null,
            confidence: 'strong',
            dueAt: nowTs + 100000,
            id: 'r-1',
            prompt: 'biology understanding photosynthesis',
            studyPlanId: 'plan-1',
          },
        ],
      };

      const weakTopics = computeWeakTopics([plan], nowTs);
      expect(Array.isArray(weakTopics)).toBe(true);
      expect(weakTopics.length).toBeLessThanOrEqual(5);
    });
  });

  describe('computeWeeklyIntelligence', () => {
    it('returns zero-state intelligence when no completed blocks', () => {
      const plan: StudyPlan = {
        ...basePlan,
        blocks: [
          {
            estimatedMinutes: 25,
            id: 'b-1',
            objective: 'Study cell structure',
            priority: 'medium',
            status: 'not_started',
            studyPlanId: 'plan-1',
            title: 'Cell Structure',
          },
        ],
      };

      const intel = computeWeeklyIntelligence({ plans: [plan], streakDays: 0 });
      expect(intel.completedBlocks).toBe(0);
      expect(intel.totalStudyMinutes).toBe(25);
      expect(intel.suggestion).toContain('first study block');
    });

    it('computes correct totals', () => {
      const plan: StudyPlan = {
        ...basePlan,
        blocks: [
          {
            estimatedMinutes: 25,
            id: 'b-1',
            objective: 'Learn cell biology',
            priority: 'medium',
            status: 'completed',
            studyPlanId: 'plan-1',
            title: 'Cell Biology',
          },
          {
            estimatedMinutes: 30,
            id: 'b-2',
            objective: 'Review genetics',
            priority: 'high',
            status: 'not_started',
            studyPlanId: 'plan-1',
            title: 'Genetics review',
          },
        ],
        reviewItems: [
          {
            answerHint: null,
            confidence: 'weak',
            dueAt: 100,
            id: 'r-1',
            prompt: 'Explain cell biology basics',
            studyPlanId: 'plan-1',
          },
        ],
      };

      const intel = computeWeeklyIntelligence({
        plans: [plan],
        streakDays: 3,
        now: 5000,
      });
      expect(intel.completedBlocks).toBe(1);
      expect(intel.totalStudyMinutes).toBe(55);
      expect(intel.reviewItemsDue).toBe(1);
      expect(intel.streakDays).toBe(3);
    });

    it('says all strong when no weak topics', () => {
      const intel = computeWeeklyIntelligence({ plans: [], streakDays: 5 });
      expect(intel.suggestion).toContain('Start your first study block');
    });
  });

  describe('hasWeeklyIntelligenceData', () => {
    it('false for empty plans', () => {
      expect(hasWeeklyIntelligenceData([])).toBe(false);
    });

    it('true when completed blocks exist', () => {
      const plan: StudyPlan = {
        ...basePlan,
        blocks: [
          {
            estimatedMinutes: 25,
            id: 'b-1',
            objective: 'Learn X',
            priority: 'medium',
            status: 'completed',
            studyPlanId: 'plan-1',
            title: 'Topic X',
          },
        ],
      };
      expect(hasWeeklyIntelligenceData([plan])).toBe(true);
    });
  });
});
