import { z } from "zod";

export const StakesSessionRecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  session_id: z.string().uuid(),
  difficulty: z.enum(["CASUAL", "FOCUSED", "DEEP_WORK"]),
  xp_multiplier: z.number(),
  max_pauses: z.number(),
  gem_wager: z.number(),
  completed: z.boolean(),
  xp_earned: z.number(),
  gems_won: z.number(),
  gems_lost: z.number(),
  pauses_used: z.number(),
  quality_score: z.number(),
  win_streak: z.number(),
  created_at: z.number(),
  completed_at: z.number().nullable(),
});

export const UserStakesPreferenceSchema = z.object({
  user_id: z.string().uuid(),
  default_difficulty: z
    .enum(["CASUAL", "FOCUSED", "DEEP_WORK"])
    .default("FOCUSED"),
  total_deep_work_completed: z.number().default(0),
  total_gems_wagered: z.number().default(0),
  total_gems_won: z.number().default(0),
  current_win_streak: z.number().default(0),
  best_win_streak: z.number().default(0),
  updated_at: z.number(),
});

export type StakesSessionRecord = z.infer<typeof StakesSessionRecordSchema>;
export type UserStakesPreference = z.infer<typeof UserStakesPreferenceSchema>;
