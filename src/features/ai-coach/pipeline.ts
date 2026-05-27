import { z } from "zod";
import { getSupabaseClient } from "../../config/supabase";
import { eventBus } from "../../events";
import { getProgressionService } from "../../progression/ProgressionService";
import { getSessionRepository } from "../../session/repository/SessionRepository";
import { getCoachPersonas, getOrCreateCoachState } from "./persona-manager";
import { scheduleReminder } from "./reminder-scheduler";
import * as repository from "./repository";
import { processBehaviorSignal as processBehaviorSignalBase } from "./session-analyzer";
import {
  CoachMessageSchema,
  ComebackPlanSchema,
  GenerateMessageInputSchema,
  ActivateComebackInputSchema,
  type CoachMessage,
  type EvaluateInterventionsInput,
  type GenerateMessageInput,
  type InterventionExecution,
  type TriggerType,
} from "./schemas";
const AIMessagePayloadSchema = z
  .object({
    message: z.string().min(1).max(1000),
    tone: z.string().min(1).max(50),
    urgency: z.enum(["low", "medium", "high", "critical"]),
    actionLabel: z.string().min(1).max(60).optional(),
    action: z
      .enum([
        "START_SESSION",
        "VIEW_PROGRESS",
        "VIEW_SETTINGS",
        "START_COMEBACK",
        "VIEW_BOSS",
        "VIEW_CHALLENGES",
        "VIEW_SQUAD",
        "VIEW_SHOP",
        "OPEN_COACH",
        "OPEN_CONTENT_STUDY",
        "NONE",
      ])
      .optional(),
  })
  .strict();
type GenerateMessageArgs = GenerateMessageInput | string;
type EvaluateArgs = EvaluateInterventionsInput | string;
type NormalizedInterventionInput = {
  userId: string;
  trigger: TriggerType | "SESSION_COMPLETE";
  context: Record<string, unknown>;
};
export async function generateMessage(
  input: GenerateMessageInput,
): Promise<CoachMessage | null>;
export async function generateMessage(
  userId: string,
  trigger: TriggerType | "COMEBACK" | "SESSION_COMPLETE",
  context: Record<string, unknown>,
): Promise<CoachMessage | null>;
export async function generateMessage(
  inputOrUserId: GenerateMessageArgs,
  trigger?: TriggerType | "COMEBACK" | "SESSION_COMPLETE",
  context: Record<string, unknown> = {},
): Promise<CoachMessage | null> {
  const input = normalizeGenerateMessageArgs(inputOrUserId, trigger, context);
  const state = await getOrCreateCoachState(input.userId);
  if (state.muteUntil && state.muteUntil > Date.now()) {
    return null;
  }
  const personas = await getCoachPersonas();
  const persona = personas.find((entry) => entry.id === state.personaId);
  const progression = getProgressionService(input.userId).getState();
  const sessionRepository = getSessionRepository(input.userId);
  const stats = await sessionRepository.getSessionStats();
  const recentSummaries = (await sessionRepository.getAllSummaries())
    .slice(-3)
    .reverse();
  const { data, error } = await getSupabaseClient().functions.invoke(
    "ai-coach",
    {
      body: {
        requestType: "GENERATE_COACH_MESSAGE",
        userId: input.userId,
        personaId: state.personaId,
        metadata: { timestamp: Date.now() },
        context: {
          ...input.context,
          currentLevel: progression.currentLevel,
          currentStreak: stats.currentStreak,
          personaStyle: persona?.style,
          recentSessionOutcomes: recentSummaries.map((summary) => ({
            score: summary.finalScore,
            focusQuality: summary.focusQuality,
            durationMinutes: Math.max(
              1,
              Math.round(summary.actualDuration / 60),
            ),
          })),
        },
      },
    },
  );
  const structuredPayload = extractStructuredMessage(data);
  const parsedPayload = AIMessagePayloadSchema.safeParse(structuredPayload);
  const message = parsedPayload.success
    ? CoachMessageSchema.parse({
        id: crypto.randomUUID(),
        userId: input.userId,
        personaId: state.personaId,
        category: input.category,
        content: parsedPayload.data.message,
        deliveryMethod: input.preferredDelivery,
        priority: mapUrgencyToPriority(parsedPayload.data.urgency),
        status: input.preferredDelivery === "PUSH" ? "SCHEDULED" : "SENT",
        createdAt: Date.now(),
        scheduledFor: null,
        deliveredAt: input.preferredDelivery === "PUSH" ? null : Date.now(),
        readAt: null,
        dismissedAt: null,
        actionTaken: parsedPayload.data.actionLabel ?? null,
        actionTakenAt: null,
      })
    : createFallbackMessage(input, state.personaId);
  if (error) {
    return repository.createCoachMessage(
      createFallbackMessage(input, state.personaId),
    );
  }
  return repository.createCoachMessage(message);
}
export async function evaluateInterventions(
  input: EvaluateInterventionsInput,
): Promise<InterventionExecution[]>;
export async function evaluateInterventions(
  userId: string,
  trigger: TriggerType | "COMEBACK" | "SESSION_COMPLETE",
  context: Record<string, unknown>,
): Promise<InterventionExecution[]>;
export async function evaluateInterventions(
  inputOrUserId: EvaluateArgs,
  trigger?: TriggerType | "COMEBACK" | "SESSION_COMPLETE",
  context: Record<string, unknown> = {},
): Promise<InterventionExecution[]> {
  const input = normalizeEvaluateArgs(inputOrUserId, trigger, context);
  const streak =
    readNumber(input.context.streak) ??
    readNumber(input.context.currentStreak) ??
    0;
  const daysSinceLastSession =
    readNumber(input.context.daysSinceLastSession) ?? 0;
  const isFirstToday = readBoolean(input.context.isFirstToday) ?? false;
  const executions: InterventionExecution[] = [];
  if (input.trigger === "STREAK_AT_RISK" && streak > 3) {
    const message = await generateMessage(input.userId, input.trigger, {
      ...input.context,
      urgency: "critical",
    });
    if (message) {
      await scheduleReminder({
        userId: input.userId,
        reminderType: "STREAK_WARNING",
        scheduledFor: Date.now() + 2 * 60 * 60 * 1000,
        priority: 9,
      });
      executions.push(createExecution(input.userId, input.trigger, message.id));
    }
  }
  if (input.trigger === "SESSION_COMPLETE" && isFirstToday) {
    const message = await generateMessage(input.userId, input.trigger, {
      ...input.context,
      celebration: true,
    });
    if (message) {
      executions.push(createExecution(input.userId, input.trigger, message.id));
    }
  }
  if (input.trigger === "COMEBACK_WINDOW_OPEN" && daysSinceLastSession > 3) {
    const plan = await activateComeback(input.userId);
    const message = await generateMessage(input.userId, input.trigger, {
      ...input.context,
      comebackPlanId: plan.id,
    });
    executions.push(
      createExecution(input.userId, input.trigger, message?.id ?? null),
    );
  }
  return executions;
}
export async function activateComeback(
  input:
    | string
    | { userId: string; previousStreak?: number; daysInactive?: number },
) {
  const normalized =
    typeof input === "string"
      ? { userId: input, previousStreak: 0, daysInactive: 4 }
      : ActivateComebackInputSchema.partial({
          previousStreak: true,
          daysInactive: true,
        }).parse({ previousStreak: 0, daysInactive: 4, ...input });
  const existing = await repository.fetchActiveComebackPlan(normalized.userId);
  if (existing && existing.status === "ACTIVE") {
    return existing;
  }
  const now = Date.now();
  const plan = ComebackPlanSchema.parse({
    id: crypto.randomUUID(),
    userId: normalized.userId,
    previousStreak: normalized.previousStreak,
    daysInactive: normalized.daysInactive,
    status: "ACTIVE",
    startedAt: now,
    expiresAt: now + 48 * 60 * 60 * 1000,
    sessionsCompleted: 0,
    targetSessions: 3,
    bonusMultiplier: 2,
    messages: [],
  });
  const savedPlan = await repository.upsertComebackPlan(plan);
  eventBus.publish("coach:comeback_activated", {
    userId: normalized.userId,
    planId: savedPlan.id,
    targetSessions: savedPlan.targetSessions,
    bonusMultiplier: savedPlan.bonusMultiplier,
    expiresAt: savedPlan.expiresAt,
  });
  return savedPlan;
}
export async function detectStreakRisk(
  _userId: string,
  hoursSinceLastSession: number,
  currentStreak: number,
): Promise<boolean> {
  return hoursSinceLastSession > 20 && currentStreak > 0;
}
export const processBehaviorSignal = processBehaviorSignalBase;
function normalizeGenerateMessageArgs(
  inputOrUserId: GenerateMessageArgs,
  trigger?: TriggerType | "COMEBACK" | "SESSION_COMPLETE",
  context: Record<string, unknown> = {},
): GenerateMessageInput {
  if (typeof inputOrUserId !== "string") {
    return GenerateMessageInputSchema.parse(inputOrUserId);
  }
  const userId = inputOrUserId;
  const normalizedTrigger =
    trigger === "COMEBACK" ? "COMEBACK_WINDOW_OPEN" : trigger;
  return GenerateMessageInputSchema.parse({
    userId,
    category:
      normalizedTrigger === "STREAK_AT_RISK"
        ? "STREAK_RISK"
        : normalizedTrigger === "COMEBACK_WINDOW_OPEN"
          ? "COMEBACK_SUPPORT"
          : normalizedTrigger === "SESSION_COMPLETE"
            ? "MILESTONE_HYPE"
            : "MOTIVATION_BOOST",
    context: { ...context, trigger: normalizedTrigger },
    preferredDelivery: normalizedTrigger === "STREAK_AT_RISK" ? "PUSH" : "BOTH",
  });
}
function normalizeEvaluateArgs(
  inputOrUserId: EvaluateArgs,
  trigger?: TriggerType | "COMEBACK" | "SESSION_COMPLETE",
  context: Record<string, unknown> = {},
): NormalizedInterventionInput {
  if (typeof inputOrUserId !== "string") {
    return {
      userId: inputOrUserId.userId,
      trigger: inputOrUserId.trigger,
      context: inputOrUserId.context,
    };
  }
  const userId = inputOrUserId;
  const normalizedTrigger =
    trigger === "COMEBACK"
      ? "COMEBACK_WINDOW_OPEN"
      : (trigger ?? "NO_SESSION_24H");
  return { userId, trigger: normalizedTrigger, context };
}
function createFallbackMessage(
  input: GenerateMessageInput,
  personaId: string,
): CoachMessage {
  return CoachMessageSchema.parse({
    id: crypto.randomUUID(),
    userId: input.userId,
    personaId,
    category: input.category,
    content:
      "You are closer than you think. One focused session keeps your momentum alive.",
    deliveryMethod: input.preferredDelivery,
    priority: 5,
    status: "SENT",
    createdAt: Date.now(),
    scheduledFor: null,
    deliveredAt: Date.now(),
    readAt: null,
    dismissedAt: null,
    actionTaken: null,
    actionTakenAt: null,
  });
}
function extractStructuredMessage(data: unknown): unknown {
  if (
    typeof data !== "object" ||
    data === null ||
    !("structuredData" in data)
  ) {
    return null;
  }
  return data.structuredData;
}
function mapUrgencyToPriority(
  urgency: z.infer<typeof AIMessagePayloadSchema>["urgency"],
): number {
  return { low: 3, medium: 5, high: 8, critical: 10 }[urgency];
}
function createExecution(
  userId: string,
  trigger: TriggerType | "SESSION_COMPLETE",
  messageId: string | null,
): InterventionExecution {
  const triggerType =
    trigger === "SESSION_COMPLETE" ? "MILESTONE_REACHED" : trigger;
  return {
    id: crypto.randomUUID(),
    userId,
    ruleId: `${trigger.toLowerCase()}-pipeline`,
    triggerType,
    status: "EXECUTED",
    triggeredAt: Date.now(),
    executedAt: Date.now(),
    messageId,
    userResponse: null,
    effectiveness: null,
  };
}
function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}
function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}
