import type { z } from "zod";
import type { Lane as CanonicalLane } from "./types";
import {
  LaneAnimationPolicySchema,
  LaneCopyToneSchema,
  LaneDensitySchema,
  LanePresentationPolicySchema,
} from "./presentation-schemas";

export type Lane = CanonicalLane;
export type LaneAnimationPolicy = z.infer<typeof LaneAnimationPolicySchema>;
export type LaneCopyTone = z.infer<typeof LaneCopyToneSchema>;
export type LaneDensity = z.infer<typeof LaneDensitySchema>;
export type LanePresentationPolicy = z.infer<
  typeof LanePresentationPolicySchema
>;
