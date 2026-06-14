import { z } from 'zod';
import {
  PlanItemSchema,
  PlanProjectSchema,
  PlanStudyPlanSchema,
  WeeklyScheduleSchema,
  PlanItemPrioritySchema,
  PlanItemStatusSchema,
  PlanViewStateSchema,
} from './schemas';

export type PlanItem = z.infer<typeof PlanItemSchema>;
export type PlanProject = z.infer<typeof PlanProjectSchema>;
export type PlanStudyPlan = z.infer<typeof PlanStudyPlanSchema>;
export type WeeklySchedule = z.infer<typeof WeeklyScheduleSchema>;
export type PlanItemStatus = z.infer<typeof PlanItemStatusSchema>;
export type PlanItemPriority = z.infer<typeof PlanItemPrioritySchema>;
export type PlanViewState = z.infer<typeof PlanViewStateSchema>;
