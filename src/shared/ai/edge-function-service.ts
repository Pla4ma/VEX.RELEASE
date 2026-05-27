import {
  type AIRequest,
  type AIResponse,
  type GenerateCoachMessageRequest,
  type GenerateCoachMessageResponse,
  type GenerateComebackPromptRequest,
  type GenerateComebackPromptResponse,
  type GenerateSessionSummaryRequest,
  type GenerateSessionSummaryResponse,
  type GenerateStreakRiskNudgeRequest,
  type GenerateStreakRiskNudgeResponse,
  type GenerateWeeklyReflectionRequest,
  type GenerateWeeklyReflectionResponse,
} from "./ai-types";
import {
  buildCoachMessageRequest,
  buildComebackPromptRequest,
  buildSessionSummaryRequest,
  buildStreakRiskNudgeRequest,
  buildWeeklyReflectionRequest,
  type AIAPIClient,
} from "./ai-client-contracts";
import {
  REQUEST_TYPE_TO_CATEGORY,
  invokeAIWithFallback,
} from "./edge-function-invoke";

type CoachExtraContext = {
  sessionDurationMinutes?: number;
  purityScore?: number;
  subjectHint?: string;
};

type SummaryExtraContext = CoachExtraContext;

export async function sendAIRequest(request: AIRequest): Promise<AIResponse> {
  const fallbackCategory =
    REQUEST_TYPE_TO_CATEGORY[request.requestType] ?? "coach_message";
  const { response } = await invokeAIWithFallback(
    request.requestType,
    request.userId,
    request,
    fallbackCategory,
    "default",
    request.context as Record<string, unknown>,
  );
  return response;
}

export async function generateCoachMessage(
  request: Omit<GenerateCoachMessageRequest, "requestType"> & {
    context: GenerateCoachMessageRequest["context"] & CoachExtraContext;
  },
): Promise<GenerateCoachMessageResponse> {
  const validated = buildCoachMessageRequest(request);
  const body = {
    ...validated,
    context: { ...validated.context, ...pickCoachExtras(request.context) },
  };
  const category = validated.context.category ?? "MOTIVATION_BOOST";
  const { response } = await invokeAIWithFallback(
    validated.requestType,
    validated.userId,
    body,
    "coach_message",
    category,
    validated.context as Record<string, unknown>,
  );
  return response as GenerateCoachMessageResponse;
}

export async function generateSessionSummary(
  request: Omit<GenerateSessionSummaryRequest, "requestType"> & {
    context: GenerateSessionSummaryRequest["context"] & SummaryExtraContext;
  },
): Promise<GenerateSessionSummaryResponse> {
  const validated = buildSessionSummaryRequest(request);
  const body = {
    ...validated,
    context: { ...validated.context, ...pickSummaryExtras(request.context) },
  };
  const { response } = await invokeAIWithFallback(
    validated.requestType,
    validated.userId,
    body,
    "session_summary",
    "default",
    validated.context as Record<string, unknown>,
  );
  return response as GenerateSessionSummaryResponse;
}

export async function generateComebackPrompt(
  request: Omit<GenerateComebackPromptRequest, "requestType">,
): Promise<GenerateComebackPromptResponse> {
  const validated = buildComebackPromptRequest(request);
  const comebackDay = String(
    (validated.context as Record<string, unknown>).comebackDay ?? "1",
  );
  const { response } = await invokeAIWithFallback(
    validated.requestType,
    validated.userId,
    validated,
    "comeback_prompt",
    `day${comebackDay}`,
    validated.context as Record<string, unknown>,
  );
  return response as GenerateComebackPromptResponse;
}

export async function generateStreakRiskNudge(
  request: Omit<GenerateStreakRiskNudgeRequest, "requestType">,
): Promise<GenerateStreakRiskNudgeResponse> {
  const validated = buildStreakRiskNudgeRequest(request);
  const riskLevel = String(
    (validated.context as Record<string, unknown>).riskLevel ?? "medium",
  );
  const { response } = await invokeAIWithFallback(
    validated.requestType,
    validated.userId,
    validated,
    "streak_nudge",
    riskLevel,
    validated.context as Record<string, unknown>,
  );
  return response as GenerateStreakRiskNudgeResponse;
}

export async function generateWeeklyReflection(
  request: Omit<GenerateWeeklyReflectionRequest, "requestType">,
): Promise<GenerateWeeklyReflectionResponse> {
  const validated = buildWeeklyReflectionRequest(request);
  const { response } = await invokeAIWithFallback(
    validated.requestType,
    validated.userId,
    validated,
    "weekly_reflection",
    "default",
    validated.context as Record<string, unknown>,
  );
  return response as GenerateWeeklyReflectionResponse;
}

function pickCoachExtras(context: CoachExtraContext): CoachExtraContext {
  return {
    ...(typeof context.sessionDurationMinutes === "number"
      ? { sessionDurationMinutes: context.sessionDurationMinutes }
      : {}),
    ...(typeof context.purityScore === "number"
      ? { purityScore: context.purityScore }
      : {}),
    ...(typeof context.subjectHint === "string"
      ? { subjectHint: context.subjectHint }
      : {}),
  };
}

function pickSummaryExtras(context: SummaryExtraContext): SummaryExtraContext {
  return pickCoachExtras(context);
}

export const edgeAIClient: AIAPIClient = {
  sendRequest: sendAIRequest,
  generateCoachMessage,
  generateSessionSummary,
  generateComebackPrompt,
  generateStreakRiskNudge,
  generateWeeklyReflection,
};
