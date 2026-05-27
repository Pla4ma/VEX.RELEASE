import { z } from "zod";

/** Active rewards only track XP/progress/streak. Coins/gems/chest logic archived. */
export const RewardTypeSchema = z.enum(["XP"]);

export const RewardTriggerSchema = z.enum([
  "SESSION",
  "STREAK",
  "ACHIEVEMENT",
  "COMEBACK",
  "SESSION_COMPLETE",
  "CHALLENGE_COMPLETE",
]);

export type RewardType = z.infer<typeof RewardTypeSchema>;
export type RewardTrigger = z.infer<typeof RewardTriggerSchema>;
