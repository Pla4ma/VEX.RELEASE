import { z } from 'zod';

// ─── Schemas ────────────────────────────────────────────────────
export const KeyConceptSchema = z.object({
  term: z.string(),
  definition: z.string().optional(),
});
export type KeyConcept = z.infer<typeof KeyConceptSchema>;

export const SummarySchema = z.object({
  overview: z.string(),
  keyPoints: z.array(z.string()).optional(),
});
export type Summary = z.infer<typeof SummarySchema>;

export const GenerationRecordSchema = z.object({
  lastStudiedAt: z.number().nullable(),
  keyConcepts: z.array(KeyConceptSchema),
  summary: SummarySchema,
});
export type GenerationRecord = z.infer<typeof GenerationRecordSchema>;

// ─── Constants ──────────────────────────────────────────────────
export const HIGH_CONFIDENCE_THRESHOLD_DATA_POINTS = 20;

export const RISK_LEVEL_THRESHOLDS = {
  NONE: 0,
  LOW: 18,
  MEDIUM: 22,
  HIGH: 30,
  CRITICAL: 40,
} as const;

// ─── Schemas ────────────────────────────────────────────────────
export const SessionNotesSchema = z
  .object({
    generationId: z.string().optional(),
    focusAreas: z.array(z.string()).optional(),
  })
  .passthrough();
