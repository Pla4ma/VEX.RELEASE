import { z } from 'zod';

export type ShareTarget = 'session' | 'achievement' | 'profile';

export interface ShareResult {
  success: boolean;
  url: string;
  error?: string;
}

export const SessionShareSummarySchema = z.object({
  sessionId: z.string().min(1),
  durationMinutes: z.number().positive(),
  focusScore: z.number().min(0).max(100),
  mode: z.string().min(1),
});

export type SessionShareSummary = z.infer<typeof SessionShareSummarySchema>;
