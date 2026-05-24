import { z } from 'zod';

import { SessionModeSchema } from '../../session/modes';
import {
  SessionConfigSchema,
  SessionStatusSchema,
  SessionSummarySchema,
} from '../../session/types';

export const SupabaseSessionRowSchema = z.object({
  id: z.string().min(1),
  user_id: z.string().min(1),
  status: z.string().min(1),
  duration: z.number().min(0),
  effective_duration: z.number().min(0).nullable(),
  quality_score: z.number().min(0).nullable(),
  mode: z.string().nullable(),
  difficulty: z.string().nullable(),
  metadata: z.unknown(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  ended_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const SessionHistoryMetadataSchema = z
  .object({
    name: z.string().min(1).optional(),
    summary: SessionSummarySchema.optional(),
    config: SessionConfigSchema.optional(),
    streakMaintained: z.boolean().optional(),
  })
  .passthrough();

export const SessionHistoryItemSchema = z.object({
  sessionId: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1),
  status: SessionStatusSchema,
  mode: SessionModeSchema,
  startedAtMs: z.number().min(0),
  completedAtMs: z.number().min(0).nullable(),
  plannedDurationSeconds: z.number().min(0),
  effectiveDurationSeconds: z.number().min(0),
  finalScore: z.number().min(0),
  grade: z.enum(['S', 'A', 'B', 'C', 'D', 'F']),
  streakMaintained: z.boolean(),
  summary: SessionSummarySchema.nullable(),
});

export const SessionHistoryStatsSchema = z.object({
  totalSessions: z.number().min(0),
  completedSessions: z.number().min(0),
  totalFocusSeconds: z.number().min(0),
  averageScore: z.number().min(0).nullable(),
});

export const SessionHistoryViewModelSchema = z.object({
  items: z.array(SessionHistoryItemSchema),
  stats: SessionHistoryStatsSchema,
});

export type SupabaseSessionRow = z.infer<typeof SupabaseSessionRowSchema>;
export type SessionHistoryItem = z.infer<typeof SessionHistoryItemSchema>;
export type SessionHistoryStats = z.infer<typeof SessionHistoryStatsSchema>;
export type SessionHistoryViewModel = z.infer<
  typeof SessionHistoryViewModelSchema
>;
