import * as Sentry from "@sentry/react-native";
import { z } from "zod";

export class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown,
  ) {
    super(`Repository error in ${operation}: ${originalError}`);
    this.name = "RepositoryError";
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        Sentry.captureException(error, {
          tags: { repository: "focus-identity", operation: operationName },
          extra: { attempt, maxRetries },
        });
        throw new RepositoryError(operationName, error);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw new RepositoryError(operationName, lastError);
}

export const FocusProfileRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  current_score: z.number().min(300).max(850),
  previous_score: z.number(),
  percentile_rank: z.number().min(0).max(100),
  band_label: z.string(),
  band_title: z.string(),
  identity_statement: z.string(),
  streak_in_current_band: z.number(),
  total_calculations: z.number(),
  first_score_date: z.string(),
  is_in_recovery: z.boolean(),
  recovery_start_date: z.string().nullable(),
  recovery_progress: z.number(),
  pre_lapse_score: z.number().nullable(),
  top_strength: z.string(),
  top_weakness: z.string(),
  recommended_actions: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ScoreHistoryRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  date: z.string(),
  score: z.number(),
  reason: z.string(),
  created_at: z.string(),
});
