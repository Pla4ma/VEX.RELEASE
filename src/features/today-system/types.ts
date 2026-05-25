import type { z } from 'zod';
import {
  TodayActionSchema,
  TodaySectionSchema,
  TodaySystemInputSchema,
  TodaySystemSchema,
} from './schemas';

export type TodayAction = z.infer<typeof TodayActionSchema>;
export type TodaySystemInput = z.infer<typeof TodaySystemInputSchema>;
export type TodaySection = z.infer<typeof TodaySectionSchema>;
export type TodaySystem = z.infer<typeof TodaySystemSchema>;
