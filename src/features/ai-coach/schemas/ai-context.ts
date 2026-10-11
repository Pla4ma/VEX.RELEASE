import { z } from 'zod';

export const CoachConversationTurnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(500),
}).strict();

export type CoachConversationTurn = z.infer<typeof CoachConversationTurnSchema>;
