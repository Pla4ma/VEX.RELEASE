import { z } from "zod";

export const TomorrowPreviewTypeSchema = z.enum([
  "STREAK_MILESTONE",
  "BOSS_NEAR_DEATH",
  "RIVAL_GAP",
  "POWER_HOUR",
  "CHALLENGE_RESET",
  "GENERIC",
]);

export const TomorrowPreviewDataSchema = z.object({
  actionPrompt: z.string().optional(),
  emoji: z.string().min(1).max(4),
  headline: z.string().min(1).max(100),
  metadata: z.record(z.unknown()).optional(),
  priority: z.number().int().min(1).max(6),
  subtext: z.string().min(1).max(200),
  type: TomorrowPreviewTypeSchema,
});

export type TomorrowPreviewType = z.infer<typeof TomorrowPreviewTypeSchema>;
export type TomorrowPreviewData = z.infer<typeof TomorrowPreviewDataSchema>;

export type ComputeTomorrowPreviewInput = {
  userId: string;
  currentStreakDays: number;
  streakWillContinue: boolean;
  bossData?: {
    bossName: string;
    healthPercent: number;
    canDefeatTomorrow: boolean;
  } | null;
  rivalData?: {
    rivalName: string;
    myMinutes: number;
    theirMinutes: number;
    gapMinutes: number;
  } | null;
  powerHourData?: {
    day: string;
    time: string;
  } | null;
  challengeData?: {
    xpAvailable: number;
    incompleteChallenges: number;
  } | null;
};
