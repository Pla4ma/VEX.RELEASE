import { z } from 'zod';

export const Day0ModeSchema = z.enum(['focus', 'create', 'study', 'quest']);

export const Day0AgentInputSchema = z.object({
  mode: Day0ModeSchema,
  intent: z.string().trim().min(1).max(180),
});

export const Day0PlanStepSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(280),
  estimatedMinutes: z.number().int().min(1).max(45),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  tags: z.array(z.string().min(1).max(24)).min(1).max(4),
});

export const Day0AgentPlanSchema = z.object({
  mode: Day0ModeSchema,
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(240),
  steps: z.array(Day0PlanStepSchema).min(3).max(3),
});

export type Day0Mode = z.infer<typeof Day0ModeSchema>;
export type Day0AgentInput = z.infer<typeof Day0AgentInputSchema>;
export type Day0AgentPlan = z.infer<typeof Day0AgentPlanSchema>;
export type Day0PlanStep = z.infer<typeof Day0PlanStepSchema>;
