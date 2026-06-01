import { getSupabaseClient } from '../../config/supabase';
import { getProgressionService } from '../../progression/ProgressionService';
import { getSessionRepository } from '../../session/repository/SessionRepository';
import { getCoachPersonas, getOrCreateCoachState } from './persona-manager';
import { scheduleReminder } from './reminder-scheduler';
import * as repository from './repository';
import { processBehaviorSignal as processBehaviorSignalBase } from './session-analyzer';
import {
  CoachMessageSchema,
  type CoachMessage,
  type EvaluateInterventionsInput,
  type GenerateMessageInput,
  type InterventionExecution,
  type TriggerType,
} from './schemas';
import { AIMessagePayloadSchema } from './pipeline-schemas';
import type { GenerateMessageArgs, EvaluateArgs } from './pipeline-schemas';
import {
  normalizeGenerateMessageArgs,
  normalizeEvaluateArgs,
  createFallbackMessage,
  extractStructuredMessage,
  mapUrgencyToPriority,
  createExecution,
  readNumber,
  readBoolean,
} from './pipeline-helpers';
import { activateComeback } from './pipeline-comeback';
import { sanitizeLLMContext } from './llm-input-sanitizer';

export { activateComeback } from './pipeline-comeback';

export async function generateMessage(
  input: GenerateMessageInput,
): Promise<CoachMessage | null>;
export async function generateMessage(
  userId: string,
  trigger: TriggerType | 'COMEBACK' | 'SESSION_COMPLETE',
  context: Record<string, unknown>,
): Promise<CoachMessage | null>;
export async function generateMessage(
  inputOrUserId: GenerateMessageArgs,
  trigger?: TriggerType | 'COMEBACK' | 'SESSION_COMPLETE',
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
    'ai-coach',
    {
      body: {
        requestType: 'GENERATE_COACH_MESSAGE',
        userId: input.userId,
        personaId: state.personaId,
        metadata: { timestamp: Date.now() },
        context: sanitizeLLMContext({
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
        }),
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
        status: input.preferredDelivery === 'PUSH' ? 'SCHEDULED' : 'SENT',
        createdAt: Date.now(),
        scheduledFor: null,
        deliveredAt: input.preferredDelivery === 'PUSH' ? null : Date.now(),
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
  trigger: TriggerType | 'COMEBACK' | 'SESSION_COMPLETE',
  context: Record<string, unknown>,
): Promise<InterventionExecution[]>;
export async function evaluateInterventions(
  inputOrUserId: EvaluateArgs,
  trigger?: TriggerType | 'COMEBACK' | 'SESSION_COMPLETE',
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
  if (input.trigger === 'STREAK_AT_RISK' && streak > 3) {
    const message = await generateMessage(input.userId, input.trigger, {
      ...input.context,
      urgency: 'critical',
    });
    if (message) {
      await scheduleReminder({
        userId: input.userId,
        reminderType: 'STREAK_WARNING',
        scheduledFor: Date.now() + 2 * 60 * 60 * 1000,
        priority: 9,
      });
      executions.push(createExecution(input.userId, input.trigger, message.id));
    }
  }
  if (input.trigger === 'SESSION_COMPLETE' && isFirstToday) {
    const message = await generateMessage(input.userId, input.trigger, {
      ...input.context,
      celebration: true,
    });
    if (message) {
      executions.push(createExecution(input.userId, input.trigger, message.id));
    }
  }
  if (input.trigger === 'COMEBACK_WINDOW_OPEN' && daysSinceLastSession > 3) {
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

export async function detectStreakRisk(
  _userId: string,
  hoursSinceLastSession: number,
  currentStreak: number,
): Promise<boolean> {
  return hoursSinceLastSession > 20 && currentStreak > 0;
}

export const processBehaviorSignal = processBehaviorSignalBase;
