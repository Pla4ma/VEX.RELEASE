import { z } from 'zod';
import { PlanItemSchema, PlanProjectSchema, PlanStudyPlanSchema } from './schemas';
import type { PlanItem, PlanProject, PlanStudyPlan } from './types';

const PlanItemRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  priority: z.string().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  study_plan_id: z.string().uuid().nullable().optional(),
  due_date: z.string().nullable().optional(),
  estimated_minutes: z.number().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  tags: z.array(z.string()).nullable().optional(),
  lane: z.string().nullable().optional(),
});

const PlanProjectRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  progress: z.number().nullable().optional(),
  item_count: z.number().nullable().optional(),
  completed_item_count: z.number().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  lane: z.string().nullable().optional(),
});

const PlanStudyPlanRowSchema = PlanProjectRowSchema.extend({
  subject: z.string(),
  target_date: z.string().nullable().optional(),
});

export function mapPlanItem(input: unknown): PlanItem {
  const row = PlanItemRowSchema.parse(input);
  return PlanItemSchema.parse({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status ?? undefined,
    priority: row.priority ?? undefined,
    projectId: row.project_id ?? null,
    studyPlanId: row.study_plan_id ?? null,
    dueDate: row.due_date ?? null,
    estimatedMinutes: row.estimated_minutes ?? null,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: row.tags ?? [],
    lane: row.lane ?? undefined,
  });
}

export function mapPlanProject(input: unknown): PlanProject {
  const row = PlanProjectRowSchema.parse(input);
  return PlanProjectSchema.parse({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description ?? undefined,
    color: row.color ?? undefined,
    icon: row.icon ?? undefined,
    status: row.status ?? undefined,
    progress: row.progress ?? undefined,
    itemCount: row.item_count ?? undefined,
    completedItemCount: row.completed_item_count ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lane: row.lane ?? undefined,
  });
}

export function mapPlanStudyPlan(input: unknown): PlanStudyPlan {
  const row = PlanStudyPlanRowSchema.parse(input);
  return PlanStudyPlanSchema.parse({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    subject: row.subject,
    description: row.description ?? undefined,
    status: row.status ?? undefined,
    progress: row.progress ?? undefined,
    targetDate: row.target_date ?? null,
    itemCount: row.item_count ?? undefined,
    completedItemCount: row.completed_item_count ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lane: row.lane ?? undefined,
  });
}
