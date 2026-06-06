import { z } from 'zod';
import type {
  GenerateMessageInput,
  EvaluateInterventionsInput,
  TriggerType,
} from '../schemas';

export const AIMessagePayloadSchema = z
  .object({
    message: z.string().min(1).max(1000),
    tone: z.string().min(1).max(50),
    urgency: z.enum(['low', 'medium', 'high', 'critical']),
    actionLabel: z.string().min(1).max(60).optional(),
    action: z
      .enum([
        'START_SESSION',
        'VIEW_PROGRESS',
        'VIEW_SETTINGS',
        'START_COMEBACK',
        'VIEW_BOSS',
        'VIEW_CHALLENGES',
        'VIEW_SQUAD',
        'VIEW_SHOP',
        'OPEN_COACH',
        'OPEN_CONTENT_STUDY',
        'NONE',
      ])
      .optional(),
  })
  .strict();

export type GenerateMessageArgs = GenerateMessageInput | string;
export type EvaluateArgs = EvaluateInterventionsInput | string;
export type NormalizedInterventionInput = {
  userId: string;
  trigger: TriggerType | 'SESSION_COMPLETE';
  context: Record<string, unknown>;
};
