import {
  AICorePolicyResultSchema,
  AICoreProposedToolSchema,
  type AICorePolicyResult,
  type AICoreProposedTool,
} from './core-schemas';

export function validateProposedTool(
  value: unknown,
  allowedTools: readonly AICoreProposedTool['tool'][],
): AICorePolicyResult {
  const parsed = AICoreProposedToolSchema.safeParse(value);
  if (!parsed.success) {
    return AICorePolicyResultSchema.parse({
      allowed: false,
      blockedReasons: ['Tool proposal failed schema validation.'],
    });
  }
  const blockedReasons: string[] = [];
  if (!allowedTools.includes(parsed.data.tool)) {
    blockedReasons.push('Tool is not allowed for this context.');
  }
  if (!parsed.data.requiresUserConfirmation || parsed.data.canAutoExecute) {
    blockedReasons.push('Agent actions must require confirmation.');
  }
  return AICorePolicyResultSchema.parse({
    allowed: blockedReasons.length === 0,
    blockedReasons,
  });
}
