/**
 * Rivals Schemas
 *
 * Zod schemas for rival system validation.
 * @phase 4A
 */

import { z } from 'zod';

/**
 * Rival profile schema
 */
export const RivalProfileSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  level: z.number().int().min(1),
  sessionsPerWeek: z.number().int().min(0),
  avgSessionDuration: z.number().int().min(0), // in minutes
});

/**
 * Weekly score schema
 */
export const WeeklyScoreSchema = z.object({
  mine: z.number().int().min(0),    // my focus minutes this week
  theirs: z.number().int().min(0),  // rival's focus minutes
  lastUpdated: z.number(), // timestamp
});

/**
 * Rival relationship schema (from Supabase)
 */
export const RivalRelationshipSchema = z.object({
  id: z.string().uuid(),
  challengerId: z.string().uuid(),
  challengedId: z.string().uuid(),
  weekStart: z.number(), // timestamp
  challengerScore: z.number().int().min(0),
  challengedScore: z.number().int().min(0),
  winnerId: z.string().uuid().optional(),
  createdAt: z.number(),
});

/**
 * Current rival state schema
 */
export const CurrentRivalSchema = z.object({
  profile: RivalProfileSchema,
  weeklyScore: WeeklyScoreSchema,
  relationshipId: z.string().uuid(),
  weekStart: z.number(),
  daysRemaining: z.number().int().min(0).max(7),
  isGhost: z.boolean().optional(),
});

/**
 * Rival matching criteria schema
 */
export const RivalMatchCriteriaSchema = z.object({
  myLevel: z.number().int().min(1),
  mySessionsPerWeek: z.number().int().min(0),
  myAvgSessionDuration: z.number().int().min(0),
  levelTolerance: z.number().int().default(3),
  sessionTolerance: z.number().int().default(2),
  durationTolerance: z.number().int().default(10), // minutes
});

/**
 * Rival match result schema
 */
export const RivalMatchResultSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1),
  level: z.number().int().min(1),
  sessionsPerWeek: z.number().int().min(0),
  avgSessionDuration: z.number().int().min(0),
  matchScore: z.number().min(0).max(1), // 0-1 similarity score
});

/**
 * Rival history entry schema
 */
export const RivalHistoryEntrySchema = z.object({
  weekStart: z.number(),
  weekEnd: z.number(),
  myScore: z.number().int(),
  theirScore: z.number().int(),
  result: z.enum(['WIN', 'LOSS', 'DRAW']),
  rivalName: z.string(),
});

// Export inferred types
export type RivalProfile = z.infer<typeof RivalProfileSchema>;
export type WeeklyScore = z.infer<typeof WeeklyScoreSchema>;
export type RivalRelationship = z.infer<typeof RivalRelationshipSchema>;
export type CurrentRival = z.infer<typeof CurrentRivalSchema>;
export type RivalMatchCriteria = z.infer<typeof RivalMatchCriteriaSchema>;
export type RivalMatchResult = z.infer<typeof RivalMatchResultSchema>;
export type RivalHistoryEntry = z.infer<typeof RivalHistoryEntrySchema>;
