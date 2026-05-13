import { z } from "zod";


export const StorySessionRowSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  user_id: z.string().uuid(),
  story_data: z.string(), // JSON serialized SessionStory
  viewed: z.boolean().default(false),
  viewed_at: z.number().nullable().default(null),
  completion_rate: z.number().min(0).max(100).default(0),
  created_at: z.number(),
});

export const StoryAnalyticsEventSchema = z.object({
  storyId: z.string().uuid(),
  userId: z.string().uuid(),
  eventType: z.enum(['STORY_STARTED', 'BEAT_VIEWED', 'STORY_COMPLETED', 'STORY_SHARED', 'STORY_SKIPPED', 'BEAT_REPLAYED']),
  beatType: StoryBeatTypeSchema.optional(),
  timestamp: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

export const STORY_BEAT_DURATIONS = {
  QUICK: 1500, // 1.5s - for minor moments
  STANDARD: 2500, // 2.5s - default
  DRAMATIC: 4000, // 4s - for big moments
  CELEBRATION: 6000, // 6s - for milestones/defeats
} as const;

export const STORY_PRIORITIES = {
  OPENING: 0,
  PERFECTION_MOMENT: 100,
  BOSS_DEFEAT: 95,
  MILESTONE_REACHED: 90,
  COMEBACK_TRIUMPH: 85,
  STREAK_MOMENT: 80,
  BOSS_BATTLE: 70,
  FOCUS_JOURNEY: 60,
  ACHIEVEMENT_UNLOCK: 50,
  PROGRESSION_CLIFFHANGER: 40,
  CLOSING_REFLECTION: 10,
} as const;