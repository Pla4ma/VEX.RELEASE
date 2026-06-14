import {
  PlanItemSchema,
  PlanProjectSchema,
  PlanStudyPlanSchema,
  PlanItemStatusSchema,
  PlanItemPrioritySchema,
} from '../schemas';

describe('Plan schemas', () => {
  describe('PlanItemStatusSchema', () => {
    it('accepts valid statuses', () => {
      expect(PlanItemStatusSchema.safeParse('todo').success).toBe(true);
      expect(PlanItemStatusSchema.safeParse('in_progress').success).toBe(true);
      expect(PlanItemStatusSchema.safeParse('done').success).toBe(true);
      expect(PlanItemStatusSchema.safeParse('blocked').success).toBe(true);
    });

    it('rejects invalid statuses', () => {
      expect(PlanItemStatusSchema.safeParse('invalid').success).toBe(false);
      expect(PlanItemStatusSchema.safeParse('').success).toBe(false);
    });
  });

  describe('PlanItemPrioritySchema', () => {
    it('accepts valid priorities', () => {
      expect(PlanItemPrioritySchema.safeParse('low').success).toBe(true);
      expect(PlanItemPrioritySchema.safeParse('medium').success).toBe(true);
      expect(PlanItemPrioritySchema.safeParse('high').success).toBe(true);
      expect(PlanItemPrioritySchema.safeParse('urgent').success).toBe(true);
    });

    it('rejects invalid priorities', () => {
      expect(PlanItemPrioritySchema.safeParse('critical').success).toBe(false);
    });
  });

  describe('PlanItemSchema', () => {
    const validItem = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      title: 'Test task',
      description: 'Description',
      status: 'todo',
      priority: 'medium',
      projectId: null,
      studyPlanId: null,
      dueDate: null,
      estimatedMinutes: 30,
      completedAt: null,
      createdAt: '2026-06-14T10:00:00.000Z',
      updatedAt: '2026-06-14T10:00:00.000Z',
      tags: [],
      lane: 'study',
    };

    it('accepts valid item', () => {
      const result = PlanItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('todo');
        expect(result.data.priority).toBe('medium');
        expect(result.data.tags).toEqual([]);
      }
    });

    it('applies default status and priority', () => {
      const { status, priority, tags, ...item } = validItem;
      const result = PlanItemSchema.safeParse(item);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('todo');
        expect(result.data.priority).toBe('medium');
        expect(result.data.tags).toEqual([]);
      }
    });

    it('rejects empty title', () => {
      const result = PlanItemSchema.safeParse({ ...validItem, title: '' });
      expect(result.success).toBe(false);
    });

    it('rejects title over 200 chars', () => {
      const result = PlanItemSchema.safeParse({ ...validItem, title: 'a'.repeat(201) });
      expect(result.success).toBe(false);
    });

    it('rejects estimatedMinutes out of range', () => {
      expect(PlanItemSchema.safeParse({ ...validItem, estimatedMinutes: 0 }).success).toBe(false);
      expect(PlanItemSchema.safeParse({ ...validItem, estimatedMinutes: 481 }).success).toBe(false);
    });
  });

  describe('PlanProjectSchema', () => {
    const validProject = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Test Project',
      description: 'Desc',
      color: '#ff0000',
      icon: 'folder',
      status: 'active',
      progress: 50,
      itemCount: 10,
      completedItemCount: 5,
      createdAt: '2026-06-14T10:00:00.000Z',
      updatedAt: '2026-06-14T10:00:00.000Z',
      lane: 'project',
    };

    it('accepts valid project', () => {
      const result = PlanProjectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it('applies default status and progress', () => {
      const { status, progress, itemCount, completedItemCount, ...project } = validProject;
      const result = PlanProjectSchema.safeParse(project);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('active');
        expect(result.data.progress).toBe(0);
        expect(result.data.itemCount).toBe(0);
        expect(result.data.completedItemCount).toBe(0);
      }
    });

    it('rejects progress out of range', () => {
      expect(PlanProjectSchema.safeParse({ ...validProject, progress: -1 }).success).toBe(false);
      expect(PlanProjectSchema.safeParse({ ...validProject, progress: 101 }).success).toBe(false);
    });
  });

  describe('PlanStudyPlanSchema', () => {
    const validStudyPlan = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Study Plan',
      subject: 'Math',
      description: 'Desc',
      status: 'active',
      progress: 25,
      targetDate: null,
      itemCount: 20,
      completedItemCount: 5,
      createdAt: '2026-06-14T10:00:00.000Z',
      updatedAt: '2026-06-14T10:00:00.000Z',
      lane: 'study',
    };

    it('accepts valid study plan', () => {
      const result = PlanStudyPlanSchema.safeParse(validStudyPlan);
      expect(result.success).toBe(true);
    });

    it('requires subject', () => {
      const { subject, ...plan } = validStudyPlan;
      const result = PlanStudyPlanSchema.safeParse(plan);
      expect(result.success).toBe(false);
    });
  });
});