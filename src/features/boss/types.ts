import { z } from "zod";

/**
 * Personal Blocker — an adaptive friction pattern VEX detects.
 * Replaces the old PersonalBoss concept. Boss = legacy gamification (archived).
 * Blocker = intelligence: VEX notices what consistently gets in the way.
 */
export const PersonalBlockerBlockSchema = z.object({
  id: z.string(),
  label: z.string(),
  triggerAfterSessions: z.number().int().min(0),
  motivationStyle: z.enum(["calm", "study", "game_like", "intense"]).optional(),
});

export type PersonalBlockerBlock = z.infer<typeof PersonalBlockerBlockSchema>;

// Legacy alias — preserved for internal migration, not user-facing
/** @deprecated Use PersonalBlockerBlock */
export type PersonalBossBlock = PersonalBlockerBlock;
/** @deprecated Use PersonalBlockerBlockSchema */
export const PersonalBossBlockSchema = PersonalBlockerBlockSchema;

export type BlockerVisibility = "hidden" | "teaser" | "subtle" | "visible";
/** @deprecated Use BlockerVisibility */
export type BossVisibility = BlockerVisibility;

/**
 * Completion impact signal — no economy (no coins/gems).
 * VEX records what blocker was encountered and whether the user pushed through.
 */
export interface BlockerCompletionSignal {
  blockerId: string;
  progressSaved: number;
  resolved: boolean;
}

/** @deprecated Use BlockerCompletionSignal */
export type PersonalBossCompletionSignal = {
  bossId: string;
  xpAwarded: number;
  defeated: boolean;
};
