import type { z } from 'zod';
import {
  JourneyDaySchema,
  JourneyHomeMessageSchema,
  JourneyMomentSchema,
  JourneyNudgePolicySchema,
  JourneyPhaseSchema,
  JourneyPremiumMomentSchema,
  JourneyReturnReasonSchema,
  JourneySessionSuggestionSchema,
  JourneyStateInputSchema,
  JourneyStateSchema,
  LaneCopyMapSchema,
  RetentionJourneyCopySchema,
} from './schemas';

export type JourneyDay = z.infer<typeof JourneyDaySchema>;
export type JourneyPhase = z.infer<typeof JourneyPhaseSchema>;
export type JourneyState = z.infer<typeof JourneyStateSchema>;
export type JourneyStateInput = z.infer<typeof JourneyStateInputSchema>;
export type JourneyHomeMessage = z.infer<typeof JourneyHomeMessageSchema>;
export type JourneySessionSuggestion = z.infer<
  typeof JourneySessionSuggestionSchema
>;
export type JourneyMoment = z.infer<typeof JourneyMomentSchema>;
export type JourneyReturnReason = z.infer<typeof JourneyReturnReasonSchema>;
export type JourneyPremiumMoment = z.infer<typeof JourneyPremiumMomentSchema>;
export type JourneyNudgePolicy = z.infer<typeof JourneyNudgePolicySchema>;
export type LaneCopyMap = z.infer<typeof LaneCopyMapSchema>;
export type RetentionJourneyCopy = z.infer<typeof RetentionJourneyCopySchema>;
