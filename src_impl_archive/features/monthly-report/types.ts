import type { z } from 'zod';
import type { MonthlyFocusReportInputSchema, MonthlyFocusReportSummarySchema } from './schemas';

export type MonthlyFocusReportInput = z.infer<typeof MonthlyFocusReportInputSchema>;
export type MonthlyFocusReportSummary = z.infer<typeof MonthlyFocusReportSummarySchema>;
