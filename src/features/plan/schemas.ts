import { z } from 'zod';

export const PlanItemStatusSchema = z.enum(['todo', 'in_progress', 'done', 'blocked']);
export const PlanItemPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export type PlanItemStatus = z.infer<typeof PlanItemStatusSchema>;
export type PlanItemPriority = z.infer<typeof PlanItemPrioritySchema>;

export const PlanItemSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: PlanItemStatusSchema.default('todo'),
  priority: PlanItemPrioritySchema.default('medium'),
  projectId: z.string().uuid().nullable().optional(),
  studyPlanId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  estimatedMinutes: z.number().min(1).max(480).nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tags: z.array(z.string()).default([]),
  lane: z.string().optional(),
});

export const PlanProjectSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed', 'archived']).default('active'),
  progress: z.number().min(0).max(100).default(0),
  itemCount: z.number().default(0),
  completedItemCount: z.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lane: z.string().optional(),
});

export const PlanStudyPlanSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'paused', 'completed']).default('active'),
  progress: z.number().min(0).max(100).default(0),
  targetDate: z.string().datetime().nullable().optional(),
  itemCount: z.number().default(0),
  completedItemCount: z.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lane: z.string().optional(),
});

export const WeeklyScheduleSchema = z.object({
  userId: z.string().uuid(),
  weekStart: z.string().datetime(),
  items: z.array(PlanItemSchema).default([]),
  focusMinutesGoal: z.number().default(300),
  sessionCountGoal: z.number().default(5),
  studyMinutesGoal: z.number().default(120),
});

export const PlanViewStateSchema = z.object({
  activeTab: z.enum(['today', 'week', 'projects', 'study']).default('today'),
  selectedProjectId: z.string().uuid().nullable().optional(),
  selectedStudyPlanId: z.string().uuid().nullable().optional(),
  filter: z.enum(['all', 'todo', 'in_progress', 'done']).default('all'),
});
