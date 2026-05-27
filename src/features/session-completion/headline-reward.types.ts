import type { z } from "zod";
import {
  HeadlineRewardConsequencesSchema,
  HeadlineRewardSchema,
  HeadlineRewardTypeSchema,
} from "./headline-reward.schemas";

export type HeadlineRewardType = z.infer<typeof HeadlineRewardTypeSchema>;
export type HeadlineReward = z.infer<typeof HeadlineRewardSchema>;
export type HeadlineRewardConsequences = z.infer<
  typeof HeadlineRewardConsequencesSchema
>;
