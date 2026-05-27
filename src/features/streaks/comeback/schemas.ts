/**
 * Comeback Quest Schemas
 *
 * Type definitions and schemas for the comeback quest system.
 */

import { z } from "zod";

export const ComebackQuestStageSchema = z.enum([
  "QUEST_1",
  "QUEST_2",
  "QUEST_3",
  "COMPLETE",
]);
export type ComebackQuestStage = z.infer<typeof ComebackQuestStageSchema>;

export const ComebackQuestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  stage: ComebackQuestStageSchema,
  daysAbsent: z.number(),
  streakBeforeBreak: z.number(),
  quest1Completed: z.boolean().default(false),
  quest2Completed: z.boolean().default(false),
  quest3Completed: z.boolean().default(false),
  allQuestsCompleted: z.boolean().default(false),
  rewardsClaimed: z.boolean().default(false),
  phoenixBadgeEarned: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type ComebackQuest = z.infer<typeof ComebackQuestSchema>;

export const ComebackQuestProgressSchema = z.object({
  currentStage: ComebackQuestStageSchema,
  quest1: z.object({
    required: z.object({ duration: z.number(), grade: z.string().optional() }),
    completed: z.boolean(),
  }),
  quest2: z.object({
    required: z.object({ duration: z.number(), grade: z.string() }),
    completed: z.boolean(),
  }),
  quest3: z.object({
    required: z.object({ duration: z.number(), grade: z.string() }),
    completed: z.boolean(),
  }),
  overallProgress: z.number(), // 0-100
  rewards: z.object({
    streakRestored: z.boolean(),
    phoenixBadge: z.boolean(),
    coins: z.number(),
    xpBonus: z.number(),
  }),
});

export type ComebackQuestProgress = z.infer<typeof ComebackQuestProgressSchema>;
