import { z } from 'zod';

import { SessionModeSchema } from '../modes';
import {
  SessionConfigSchema,
  SessionStateSchema,
  SessionStatusSchema,
  SessionSummarySchema,
  type SessionHistoryEntry,
  type SessionState,
  type SessionSummary,
} from $1../types/schemas$1;

const SessionHistoryEntrySchema = z
  .object({
    sessionId: z.string().min(1),
    userId: z.string().min(1),
    status: SessionStatusSchema,
    config: SessionConfigSchema,
    summary: SessionSummarySchema.optional(),
    startedAt: z.number().min(0),
    endedAt: z.number().min(0).optional(),
    createdAt: z.number().min(0),
    completedAt: z.number().min(0).nullable().optional(),
    duration: z.number().min(0).optional(),
    mode: SessionModeSchema.optional(),
    name: z.string().optional(),
    finalScore: z.number().min(0).optional(),
    effectiveDuration: z.number().min(0).optional(),
    streakMaintained: z.boolean().optional(),
    xpEarned: z.number().min(0).optional(),
    coinsEarned: z.number().min(0).optional(),
    completionPercentage: z.number().min(0).optional(),
    focusQuality: z.number().min(0).optional(),
  })
  .passthrough();

function parseUnknownJson(json: string): unknown {
  return JSON.parse(json);
}

export function parseSessionStateJson(json: string): SessionState {
  return SessionStateSchema.parse(parseUnknownJson(json));
}

export function parseSessionHistoryJson(
  json: string,
  limit: number,
): SessionHistoryEntry[] {
  return SessionHistoryEntrySchema.array()
    .parse(parseUnknownJson(json))
    .slice(0, limit);
}

export function parseSessionSummaryMapJson(
  json: string,
): Record<string, SessionSummary> {
  return z.record(SessionSummarySchema).parse(parseUnknownJson(json));
}

export function parseSyncQueueJson(json: string): string[] {
  return z.array(z.string().min(1)).parse(parseUnknownJson(json));
}
