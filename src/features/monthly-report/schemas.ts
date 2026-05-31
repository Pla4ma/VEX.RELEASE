import { z } from 'zod';

export const MonthlyFocusReportInputSchema = z.object({
  userId: z.string().uuid(),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
});

export const MonthlyFocusReportSummarySchema = z.object({
  monthStartScore: z.number().min(300).max(850),
  monthEndScore: z.number().min(300).max(850),
  scoreDelta: z.number(),
  bestFocusWindow: z.string(),
  strongestPattern: z.string(),
  weakestPattern: z.string(),
  sessionCount: z.number().min(0),
  totalFocusedTime: z.number().min(0),
  bestGrade: z.enum(['S', 'A', 'B', 'C', 'D']),
  nextMonthTarget: z.number().min(300).max(850),
  aiCoachInsight: z.string().optional(),
});

export type MonthlyFocusReportInput = z.infer<
  typeof MonthlyFocusReportInputSchema
>;
export type MonthlyFocusReportSummary = z.infer<
  typeof MonthlyFocusReportSummarySchema
>;
