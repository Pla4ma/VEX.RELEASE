import { z } from 'zod';

// ============================================================================
// Adaptive Difficulty Suggestion Schemas (BONUS PHASE)
// ============================================================================

export const SessionDifficultySchema = z.enum([
  'CASUAL',
  'FOCUSED',
  'INTENSE',
]);

export const DifficultySuggestionStatsSchema = z.object({
  sessionsAnalyzed: z.number().int().min(0),
  averageGrade: z.number().min(1).max(5),
  averagePurity: z.number().min(0).max(100),
});

export const DifficultySuggestionSchema = z.object({
  suggestion: SessionDifficultySchema.nullable(),
  reason: z.string().min(1).max(500),
  confidence: z.enum(['low', 'medium', 'high']),
  stats: DifficultySuggestionStatsSchema,
});

export const DifficultyPreferenceSchema = z.object({
  userId: z.string().uuid(),
  currentDifficulty: SessionDifficultySchema,
  suggestedDifficulty: SessionDifficultySchema.nullable(),
  lastSuggestionAt: z.number().int().optional(),
  suggestionDismissedAt: z.number().int().optional(),
  timesShown: z.number().int().min(0).default(0),
  timesAccepted: z.number().int().min(0).default(0),
});

export type SessionDifficulty = z.infer<typeof SessionDifficultySchema>;
export type DifficultySuggestion = z.infer<typeof DifficultySuggestionSchema>;
export type DifficultyPreference = z.infer<typeof DifficultyPreferenceSchema>;
