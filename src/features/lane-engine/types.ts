import type { z } from "zod";

import {
  LaneSchema,
  LaneConfirmationSchema,
  LaneEvidenceSchema,
  LaneMechanicPolicySchema,
  LaneMechanicSchema,
  LaneProfileSchema,
  LaneReconsiderationInputSchema,
  LaneTraitsSchema,
  MergeLaneProfilesInputSchema,
  ResolveBehaviorLaneInputSchema,
  ResolveInitialLaneInputSchema,
} from "./schemas";

import { type CompletionEvidenceInput } from "./schemas";

export const LANES = LaneSchema.options;

export type Lane = z.infer<typeof LaneSchema>;
export type LaneConfirmation = z.infer<typeof LaneConfirmationSchema>;
export type LaneEvidence = z.infer<typeof LaneEvidenceSchema>;
export type LaneMechanic = z.infer<typeof LaneMechanicSchema>;
export type LaneMechanicPolicy = z.infer<typeof LaneMechanicPolicySchema>;
export type LaneProfile = z.infer<typeof LaneProfileSchema>;
export type LaneTraits = z.infer<typeof LaneTraitsSchema>;
export type LaneReconsiderationInput = z.infer<
  typeof LaneReconsiderationInputSchema
>;
export type MergeLaneProfilesInput = z.infer<
  typeof MergeLaneProfilesInputSchema
>;
export type ResolveBehaviorLaneInput = z.infer<
  typeof ResolveBehaviorLaneInputSchema
>;
export type ResolveInitialLaneInput = z.infer<
  typeof ResolveInitialLaneInputSchema
>;
export type { CompletionEvidenceInput };
