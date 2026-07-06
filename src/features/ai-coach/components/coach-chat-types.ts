import { z } from 'zod';
import type { CoachUserState } from '../types';

export const CoachMessageInputSchema = z.object({
  id: z.string(),
  sender: z.string().optional(),
  content: z.string(),
  createdAt: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export interface ChatMessage {
  id: string;
  type: 'user' | 'coach' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    hasAction?: boolean;
    actionLabel?: string;
    actionData?: Record<string, unknown>;
    state?: CoachUserState;
  };
}

export interface CoachRecommendation {
  duration: number;
  difficulty: string;
  reasoning: string;
}
