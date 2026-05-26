import type { z } from 'zod';

import type {
  LaneFitSchema,
  UnlockDecisionSchema,
  UnlockDecisionTypeSchema,
  UnlockEvidenceSchema,
  UnlockExplainerInputSchema,
  UnlockReasonCodeSchema,
} from './schemas';

export type UnlockDecisionType = z.infer<typeof UnlockDecisionTypeSchema>;
export type LaneFit = z.infer<typeof LaneFitSchema>;
export type UnlockEvidence = z.infer<typeof UnlockEvidenceSchema>;
export type UnlockDecision = z.infer<typeof UnlockDecisionSchema>;
export type UnlockExplainerInput = z.infer<typeof UnlockExplainerInputSchema>;
export type UnlockReasonCode = z.infer<typeof UnlockReasonCodeSchema>;
