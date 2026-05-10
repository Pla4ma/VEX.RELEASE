/**
 * Monthly Focus Report Schemas
 *
 * Type definitions and schemas for the monthly focus report system.
 */

import { z } from 'zod';

export const MonthlyReportSectionSchema = z.enum([
  'SCORE_OVERVIEW',
  'SESSION_ANALYSIS',
  'STREAK_HIGHLIGHTS',
  'BEST_PERFORMANCE',
  'WEEKLY_PATTERNS',
  'AI_INSIGHTS',
  'NEXT_TARGETS',
]);

export type MonthlyReportSection = z.infer<typeof MonthlyReportSectionSchema>;

export const MonthlyFocusReportSchema = z.object({
  id: z.string(),
  userId: z.string(),
  year: z.number(),
  month: z.number(),
  generatedAt: z.number(),

  // Score metrics
  startingScore: z.number(),
  endingScore: z.number(),
  scoreDelta: z.number(),
  grade: z.enum(['A+', 'A', 'B', 'C', 'D', 'F']),

  // Session metrics
  sessionCount: z.number(),
  totalFocusedMinutes: z.number(),
  averageSessionLength: z.number(),
  bestGrade: z.enum(['A+', 'A', 'B', 'C', 'D', 'F']),

  // Performance insights
  bestFocusWindow: z.object({
    dayOfWeek: z.string(),
    timeRange: z.string(),
    averagePurity: z.number(),
  }),
  strongestPattern: z.string(),
  weakestPattern: z.string(),

  // AI Coach insights (premium only)
  aiInsight: z.string().optional(),
  nextMonthTarget: z.string(),

  // Premium status
  isPremium: z.boolean(),
  unlockedSections: z.array(MonthlyReportSectionSchema),
});

export type MonthlyFocusReport = z.infer<typeof MonthlyFocusReportSchema>;

export const MonthlyReportPreviewSchema = z.object({
  month: z.string(),
  scoreDelta: z.number(),
  sessionCount: z.number(),
  hasPremiumInsights: z.boolean(),
});

export type MonthlyReportPreview = z.infer<typeof MonthlyReportPreviewSchema>;

// Session data type for analysis
export interface SessionData {
  id: string;
  user_id: string;
  completed_at: string;
  duration_minutes: number;
  grade: string;
  focus_purity_score: number;
  status: string;
}

// Session analysis result type
export interface SessionAnalysis {
  sessionCount: number;
  totalFocusedMinutes: number;
  averageSessionLength: number;
  bestGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  bestFocusWindow: {
    dayOfWeek: string;
    timeRange: string;
    averagePurity: number;
  };
  strongestPattern: string;
  weakestPattern: string;
}
