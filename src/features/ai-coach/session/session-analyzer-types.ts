import { z } from 'zod';

// ─── Domain types ───────────────────────────────────────────────
export type KeyConcept = { term: string; definition?: string };
export type Summary = { overview: string; keyPoints?: string[] };
export type GenerationRecord = {
  lastStudiedAt: number | null;
  keyConcepts: KeyConcept[];
  summary: Summary;
};

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
