import { getTodayItems, getWeekItems, calculateProjectProgress, getPriorityColor, getStatusLabel } from '../service';

import { fetchPlanItems } from '../repository';
jest.mocked(fetchPlanItems);
jest.mock('../repository', () => ({
  fetchPlanItems: jest.fn(),
}));

describe('plan service', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockItems = [
    {
      id: '1',
      userId: mockUserId,
      title: 'Task 1',
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: '2026-06-14T10:00:00.000Z',
      description: null,
      projectId: null,
      studyPlanId: null,
      estimatedMinutes: 30,
      completedAt: null,
      createdAt: '2026-06-14T08:00:00.000Z',
      updatedAt: '2026-06-14T08:00:00.000Z',
      tags: [],
      lane: undefined,
    },
    {
      id: '2',
      userId: mockUserId,
      title: 'Task 2',
      status: 'done' as const,
      priority: 'low' as const,
      dueDate: '2026-06-14T10:00:00.000Z',
      description: null,
      projectId: null,
      studyPlanId: null,
      estimatedMinutes: 15,
      completedAt: '2026-06-14T09:00:00.000Z',
      createdAt: '2026-06-14T08:00:00.000Z',
      updatedAt: '2026-06-14T09:00:00.000Z',
      tags: [],
      lane: undefined,
    },
    {
      id: '3',
      userId: mockUserId,
      title: 'Task 3',
      status: 'in_progress' as const,
      priority: 'medium' as const,
      dueDate: null,
      description: null,
      projectId: null,
      studyPlanId: null,
      estimatedMinutes: null,
      completedAt: null,
      createdAt: '2026-06-14T08:00:00.000Z',
      updatedAt: '2026-06-14T08:00:00.000Z',
      tags: [],
      lane: undefined,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodayItems', () => {
    it('filters out done items and items not due today', async () => {
      fetchPlanItems.mockResolvedValue(mockItems);

      const result = await getTodayItems(mockUserId);

      expect(result).toHaveLength(2);
      expect(result.every((i) => i.status !== 'done')).toBe(true);
      expect(fetchPlanItems).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('getWeekItems', () => {
    it('filters items within current week', async () => {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const itemsInWeek = [
        {
          ...mockItems[0],
          dueDate: new Date(weekStart.getTime() + 86400000).toISOString(), // +1 day
        },
      ];
      fetchPlanItems.mockResolvedValue(itemsInWeek);

      const result = await getWeekItems(mockUserId);

      expect(result).toHaveLength(1);
      expect(fetchPlanItems).toHaveBeenCalledWith(mockUserId);
    });

    it('includes items without dueDate', async () => {
      const items = [
        { ...mockItems[2], dueDate: null },
      ];
      fetchPlanItems.mockResolvedValue(items);

      const result = await getWeekItems(mockUserId);

      expect(result).toHaveLength(1);
    });
  });

  describe('calculateProjectProgress', () => {
    it('returns 0 for empty array', () => {
      expect(calculateProjectProgress([])).toBe(0);
    });

    it('calculates percentage correctly', () => {
      const items = [
        { ...mockItems[0], status: 'done' as const },
        { ...mockItems[1], status: 'done' as const },
        { ...mockItems[2], status: 'todo' as const },
      ];
      expect(calculateProjectProgress(items)).toBe(67); // 2/3 = 66.66 -> 67
    });

    it('returns 100 when all done', () => {
      const items = [
        { ...mockItems[0], status: 'done' as const },
        { ...mockItems[1], status: 'done' as const },
      ];
      expect(calculateProjectProgress(items)).toBe(100);
    });
  });

  describe('getPriorityColor', () => {
    it('returns a color for each priority', () => {
      expect(getPriorityColor('urgent')).toBeTruthy();
      expect(getPriorityColor('high')).toBeTruthy();
      expect(getPriorityColor('medium')).toBeTruthy();
      expect(getPriorityColor('low')).toBeTruthy();
    });

    it('defaults to a color for unknown', () => {
      expect(getPriorityColor('invalid_type' as never)).toBeTruthy();
    });
  });

  describe('getStatusLabel', () => {
    it('returns correct labels', () => {
      expect(getStatusLabel('todo')).toBe('To do');
      expect(getStatusLabel('in_progress')).toBe('In progress');
      expect(getStatusLabel('done')).toBe('Done');
      expect(getStatusLabel('blocked')).toBe('Blocked');
    });

    it('defaults to To do for unknown', () => {
      expect(getStatusLabel('invalid_type' as never)).toBe('To do');
    });
  });
});