/**
 * Event & Challenge Schemas
 *
 * Zod schemas own all types — types are inferred, never hand-written.
 */

import { z } from "zod";

// ── Enums ────────────────────────────────────────────────────────────

export const EventTypeSchema = z.enum([
  "DAILY",
  "WEEKLY",
  "WEEKEND",
  "SEASONAL",
  "SPECIAL",
  "COMPETITION",
  "COMMUNITY",
]);

export const EventStatusSchema = z.enum([
  "UPCOMING",
  "ACTIVE",
  "ENDING_SOON",
  "ENDED",
]);

export const ChallengeTypeSchema = z.enum([
  "SESSION_COUNT",
  "SESSION_DURATION",
  "STREAK_DAYS",
  "XP_EARNED",
  "CURRENCY_EARNED",
  "SOCIAL_SHARES",
  "LEVEL_REACHED",
  "ACHIEVEMENT_UNLOCKED",
]);

export const ChallengeStatusSchema = z.enum([
  "LOCKED",
  "ACTIVE",
  "COMPLETED",
  "CLAIMED",
  "EXPIRED",
]);

// ── Inferred Types ───────────────────────────────────────────────────

export type EventType = z.infer<typeof EventTypeSchema>;
export type EventStatus = z.infer<typeof EventStatusSchema>;
export type ChallengeType = z.infer<typeof ChallengeTypeSchema>;
export type ChallengeStatus = z.infer<typeof ChallengeStatusSchema>;

// ── Object Schemas ───────────────────────────────────────────────────

export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: EventTypeSchema,
  status: EventStatusSchema,
  startAt: z.number(),
  endAt: z.number(),
  theme: z.string().optional(),
  icon: z.string().optional(),
  bannerImage: z.string().optional(),
  rewards: z
    .array(
      z.object({ type: z.string(), amount: z.number(), rarity: z.string() }),
    )
    .optional(),
  challenges: z.array(z.string()),
  leaderboardsEnabled: z.boolean().default(false),
  teamsEnabled: z.boolean().default(false),
  maxParticipants: z.number().optional(),
  currentParticipants: z.number().default(0),
  rules: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).default([]),
  seasonId: z.string().optional(),
});

export const ChallengeSchema = z.object({
  id: z.string(),
  eventId: z.string().optional(),
  title: z.string(),
  description: z.string(),
  type: ChallengeTypeSchema,
  status: ChallengeStatusSchema,
  requirement: z.object({
    target: z.number(),
    metric: z.string(),
    timeframe: z.string().optional(),
  }),
  progress: z.number().default(0),
  progressHistory: z
    .array(z.object({ timestamp: z.number(), value: z.number() }))
    .default([]),
  rewards: z.array(z.object({ type: z.string(), amount: z.number() })),
  startAt: z.number(),
  endAt: z.number(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]),
  prerequisites: z.array(z.string()).optional(),
  participants: z.array(z.string()).default([]),
  completedBy: z.array(z.string()).default([]),
  claimedBy: z.array(z.string()).default([]),
});

// ── Inferred Domain Types ────────────────────────────────────────────

export type Event = z.infer<typeof EventSchema>;
export type Challenge = z.infer<typeof ChallengeSchema>;

// ── Pure Helpers ─────────────────────────────────────────────────────

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function calculateEventStatus(
  startAt: number,
  endAt: number,
): EventStatus {
  const now = Date.now();
  if (now < startAt) {
    return "UPCOMING";
  }
  if (now > endAt) {
    return "ENDED";
  }
  if (endAt - now < ONE_DAY_MS) {
    return "ENDING_SOON";
  }
  return "ACTIVE";
}
