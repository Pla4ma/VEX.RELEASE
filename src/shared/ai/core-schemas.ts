import { z } from 'zod';

export const AICoreToolSchema = z.enum([
  'create_session_plan',
  'suggest_streak_rescue',
  'summarize_study_content',
  'create_memory_candidate',
  'recommend_notification_time',
  'explain_progress_change',
]);

export const AICoreTraceSchema = z.object({
  traceId: z.string().min(1),
  userId: z.string().min(1),
  requestType: z.string().min(1),
  contextKeys: z.array(z.string()),
  parsedSchema: z.string().min(1),
  policyBlocks: z.array(z.string()),
  fallbackUsed: z.boolean(),
  createdAt: z.string().datetime(),
});

export const AICorePolicyResultSchema = z.object({
  allowed: z.boolean(),
  blockedReasons: z.array(z.string()),
});

export const AICoreProposedToolSchema = z.object({
  tool: AICoreToolSchema,
  payload: z.record(z.unknown()),
  requiresUserConfirmation: z.literal(true),
  canAutoExecute: z.literal(false),
});

export type AICoreTool = z.infer<typeof AICoreToolSchema>;
export type AICoreTrace = z.infer<typeof AICoreTraceSchema>;
export type AICorePolicyResult = z.infer<typeof AICorePolicyResultSchema>;
export type AICoreProposedTool = z.infer<typeof AICoreProposedToolSchema>;
