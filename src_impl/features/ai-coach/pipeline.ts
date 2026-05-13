import { z } from 'zod';

import { getSupabaseClient } from '../../config/supabase';
import { eventBus } from '../../events';
import { getProgressionService } from '../../progression/ProgressionService';
import { getSessionRepository } from '../../session/repository/SessionRepository';
import { getCoachPersonas, getOrCreateCoachState } from './persona-manager';
import { scheduleReminder } from './reminder-scheduler';
import * as repository from './repository';
import { processBehaviorSignal as processBehaviorSignalBase } from './session-analyzer';
import { CoachMessageSchema, ComebackPlanSchema, GenerateMessageInputSchema, ActivateComebackInputSchema, type CoachMessage, type EvaluateInterventionsInput, type GenerateMessageInput, type InterventionExecution, type TriggerType } from './schemas';

const AIMessagePayloadSchema = z
  .object({
    message: z.string().min(1).max(1000),
    tone: z.string().min(1).max(50),
    urgency: z.enum(['low', 'medium', 'high', 'critical']),
    actionLabel: z.string().min(1).max(60).optional(),
    actionRoute: z.string().min(1).max(120).optional(),
  })
  .strict();

type GenerateMessageArgs = GenerateMessageInput | string;

type EvaluateArgs = EvaluateInterventionsInput | string;

type NormalizedInterventionInput = {
  userId: string;
  trigger: TriggerType | 'SESSION_COMPLETE';
  context: Record<string, unknown>;
};

function normalizeGenerateMessageArgs(inputOrUserId: GenerateMessageArgs, trigger?: TriggerType | 'COMEBACK' | 'SESSION_COMPLETE', context: Record<string, unknown> = {}): GenerateMessageInput {
  if (typeof inputOrUserId !== 'string') {
    return GenerateMessageInputSchema.parse(inputOrUserId);
  }

  const userId = inputOrUserId;
  const normalizedTrigger = trigger === 'COMEBACK' ? 'COMEBACK_WINDOW_OPEN' : trigger;
  return GenerateMessageInputSchema.parse({
    userId,
    category: normalizedTrigger === 'STREAK_AT_RISK' ? 'STREAK_RISK' : normalizedTrigger === 'COMEBACK_WINDOW_OPEN' ? 'COMEBACK_SUPPORT' : normalizedTrigger === 'SESSION_COMPLETE' ? 'MILESTONE_HYPE' : 'MOTIVATION_BOOST',
    context: { ...context, trigger: normalizedTrigger },
    preferredDelivery: normalizedTrigger === 'STREAK_AT_RISK' ? 'PUSH' : 'BOTH',
  });
}

function normalizeEvaluateArgs(inputOrUserId: EvaluateArgs, trigger?: TriggerType | 'COMEBACK' | 'SESSION_COMPLETE', context: Record<string, unknown> = {}): NormalizedInterventionInput {
  if (typeof inputOrUserId !== 'string') {
    return {
      userId: inputOrUserId.userId,
      trigger: inputOrUserId.trigger,
      context: inputOrUserId.context,
    };
  }

  const userId = inputOrUserId;
  const normalizedTrigger = trigger === 'COMEBACK' ? 'COMEBACK_WINDOW_OPEN' : (trigger ?? 'NO_SESSION_24H');
  return { userId, trigger: normalizedTrigger, context };
}

function createFallbackMessage(input: GenerateMessageInput, personaId: string): CoachMessage {
  return CoachMessageSchema.parse({
    id: crypto.randomUUID(),
    userId: input.userId,
    personaId,
    category: input.category,
    content: 'You are closer than you think. One focused session keeps your momentum alive.',
    deliveryMethod: input.preferredDelivery,
    priority: 5,
    status: 'SENT',
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
  if (typeof data !== 'object' || data === null || !('structuredData' in data)) {
    return null;
  }
  return data.structuredData;
}

function mapUrgencyToPriority(urgency: z.infer<typeof AIMessagePayloadSchema>['urgency']): number {
  return { low: 3, medium: 5, high: 8, critical: 10 }[urgency];
}

function createExecution(userId: string, trigger: TriggerType | 'SESSION_COMPLETE', messageId: string | null): InterventionExecution {
  const triggerType = trigger === 'SESSION_COMPLETE' ? 'MILESTONE_REACHED' : trigger;
  return {
    id: crypto.randomUUID(),
    userId,
    ruleId: `${trigger.toLowerCase()}-pipeline`,
    triggerType,
    status: 'EXECUTED',
    triggeredAt: Date.now(),
    executedAt: Date.now(),
    messageId,
    userResponse: null,
    effectiveness: null,
  };
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

export * from "./pipeline.types";
export * from "./pipeline.part1";
