import { buildAgentDecision } from './agent-decision.ts';
import { readCoachPayload } from './coach-output.ts';
import { buildTextSuccess } from './response.ts';
import type { AIRequest } from './schemas.ts';

export function buildModelSuccessResponse(
  request: AIRequest,
  rawContent: string,
  model: string,
  startedAt: number,
  fallbackUsed: boolean,
  promptTokens = 0,
  responseTokens = 0,
) {
  if (request.requestType === 'GENERATE_AGENT_DECISION') {
    const result = buildAgentDecision(rawContent, request);
    return buildTextSuccess(
      request,
      result.decision.message,
      model,
      startedAt,
      fallbackUsed || result.usedDeterministicFallback,
      promptTokens,
      responseTokens,
      result.decision,
    );
  }

  if (request.requestType === 'GENERATE_COACH_MESSAGE') {
    const payload = readCoachPayload(rawContent);
    return buildTextSuccess(
      request,
      payload.message,
      model,
      startedAt,
      fallbackUsed,
      promptTokens,
      responseTokens,
      payload,
    );
  }

  return buildTextSuccess(
    request,
    rawContent,
    model,
    startedAt,
    fallbackUsed,
    promptTokens,
    responseTokens,
  );
}
