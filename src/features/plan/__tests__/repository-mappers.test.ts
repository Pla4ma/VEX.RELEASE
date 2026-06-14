import { mapPlanItem, mapPlanProject, mapPlanStudyPlan } from '../repository-mappers';

describe('plan repository mappers', () => {
  describe('mapPlanItem', () => {
    const validRow = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      title: 'Test task',
      description: 'Description',
      status: 'todo',
      priority: 'medium',
      project_id: '123e4567-e89b-12d3-a456-426614174002',
      study_plan_id: null,
      due_date: '2026-06-14T10:00:00.000Z',
      estimated_minutes: 30,
      completed_at: null,
      created_at: '2026-06-14T08:00:00.000Z',
      updated_at: '2026-06-14T08:00:00.000Z',
      tags: ['tag1', 'tag2'],
      lane: 'study',
    };

    it('maps all fields correctly', () => {
      const result = mapPlanItem(validRow);
      expect(result.id).toBe(validRow.id);
      expect(result.userId).toBe(validRow.user_id);
      expect(result.title).toBe(validRow.title);
      expect(result.description).toBe(validRow.description);
      expect(result.status).toBe(validRow.status);
      expect(result.priority).toBe(validRow.priority);
      expect(result.projectId).toBe(validRow.project_id);
      expect(result.studyPlanId).toBeNull();
      expect(result.dueDate).toBe(validRow.due_date);
      expect(result.estimatedMinutes).toBe(validRow.estimated_minutes);
      expect(result.completedAt).toBeNull();
      expect(result.tags).toEqual(validRow.tags);
      expect(result.lane).toBe(validRow.lane);
    });

    it('handles null/undefined optional fields', () => {
      const row = {
        ...validRow,
        description: null,
        project_id: null,
        study_plan_id: null,
        due_date: null,
        estimated_minutes: null,
        completed_at: null,
        tags: null,
        lane: null,
      };
      const result = mapPlanItem(row);
      expect(result.description).toBeUndefined();
      expect(result.projectId).toBeNull();
      expect(result.studyPlanId).toBeNull();
      expect(result.dueDate).toBeNull();
      expect(result.estimatedMinutes).toBeNull();
      expect(result.completedAt).toBeNull();
      expect(result.tags).toEqual([]);
      expect(result.lane).toBeUndefined();
    });
  });

  describe('mapPlanProject', () => {
    const validRow = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Test Project',
      description: 'Description',
      color: '#ff0000',
      icon: 'folder',
      status: 'active',
      progress: 50,
      item_count: 10,
      completed_item_count: 5,
      created_at: '2026-06-14T08:00:00.000Z',
      updated_at: '2026-06-14T08:00:00.000Z',
      lane: 'project',
    };

    it('maps all fields correctly', () => {
      const result = mapPlanProject(validRow);
      expect(result.id).toBe(validRow.id);
      expect(result.userId).toBe(validRow.user_id);
      expect(result.name).toBe(validRow.name);
      expect(result.description).toBe(validRow.description);
      expect(result.color).toBe(validRow.color);
      expect(result.icon).toBe(validRow.icon);
      expect(result.status).toBe(validRow.status);
      expect(result.progress).toBe(validRow.progress);
      expect(result.itemCount).toBe(validRow.item_count);
      expect(result.completedItemCount).toBe(validRow.completed_item_count);
      expect(result.lane).toBe(validRow.lane);
    });

    it('handles null optional fields', () => {
      const row = {
        ...validRow,
        description: null,
        color: null,
        icon: null,
        progress: null,
        item_count: null,
        completed_item_count: null,
        lane: null,
      };
      const result = mapPlanProject(row);
      expect(result.description).toBeUndefined();
      expect(result.color).toBeUndefined();
      expect(result.icon).toBeUndefined();
      expect(result.progress).toBe(0); // Zod default for number
      expect(result.itemCount).toBe(0); // Zod default for number
      expect(result.completedItemCount).toBe(0); // Zod default for number
      expect(result.lane).toBeUndefined();
    });
  });

  describe('mapPlanStudyPlan', () => {
    const validRow = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Study Plan',
      description: 'Description',
      subject: 'Math',
      color: '#00ff00',
      icon: 'book',
      status: 'active',
      progress: 25,
      target_date: '2026-07-01T00:00:00.000Z',
      item_count: 20,
      completed_item_count: 5,
      created_at: '2026-06-14T08:00:00.000Z',
      updated_at: '2026-06-14T08:00:00.000Z',
      lane: 'study',
    };

    it('maps all fields including subject and target_date', () => {
      const result = mapPlanStudyPlan(validRow);
      expect(result.id).toBe(validRow.id);
      expect(result.subject).toBe(validRow.subject);
      expect(result.targetDate).toBe(validRow.target_date);
      expect(result.progress).toBe(validRow.progress);
    });

    it('handles null target_date', () => {
      const row = { ...validRow, target_date: null };
      const result = mapPlanStudyPlan(row);
      expect(result.targetDate).toBeNull();
    });
  });
});