import { z } from 'zod';
import { UpsertCurrentFocusScoreInputSchema } from './repository-focus-score.schemas';

export const SessionScoreWriteSchema = z.object({
  userId: z.string().uuid(), sessionId: z.string().uuid(),
  score: UpsertCurrentFocusScoreInputSchema, occurredAt: z.string().datetime(),
}).strict();
export type SessionScoreWrite = z.infer<typeof SessionScoreWriteSchema>;

export const SessionScoreWriteResultSchema = z.object({
  duplicate: z.boolean(), conflict: z.boolean(),
}).strict();
export type SessionScoreWriteResult = z.infer<typeof SessionScoreWriteResultSchema>;
