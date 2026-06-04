import * as repository from './repository';
import { getOrCreateCoachState } from './persona-manager';
import type {
  EvaluateInterventionsInput,
  InterventionExecution,
  InterventionRule,
  MessageCategory,
  TriggerType,
} from './schemas';
import { EvaluateInterventionsInputSchema } from './schemas';
import { checkConditions } from './message-generator';
import { generateMessage } from './message-generator';

const MAX_INTERVENTIONS_PER_DAY = 5;

export async function evaluateInterventions(
  input: EvaluateInterventionsInput,
): Promise<InterventionExecution[]> {
  const validated = EvaluateInterventionsInputSchema.parse(input);
  const state = await getOrCreateCoachState(validated.userId);

  if (state.interventionsToday >= MAX_INTERVENTIONS_PER_DAY) {
    return [];
  }
  if (state.muteUntil && state.muteUntil > Date.now()) {
    return [];
  }

  const rules = await repository.fetchInterventionRulesByTrigger(
    validated.trigger,
  );
  const executions: InterventionExecution[] = [];

  for (const rule of rules) {
    if (!checkConditions(rule.conditions, validated.context)) {
      continue;
    }
    const recentlyTriggered = await repository.wasRuleTriggeredRecently(
      validated.userId,
      rule.id,
      rule.cooldownHours,
    );
    if (recentlyTriggered) {
      continue;
    }
    const todaysExecutions = await repository.fetchTodaysInterventionExecutions(
      validated.userId,
    );
    const ruleExecutionsToday = todaysExecutions.filter(
      (e) => e.ruleId === rule.id,
    ).length;
    if (ruleExecutionsToday >= rule.maxPerDay) {
      continue;
    }
    const execution = await executeIntervention(
      validated.userId,
      rule,
      validated.context,
    );
    executions.push(execution);
    await repository.upsertCoachState({
      ...state,
      lastInterventionAt: Date.now(),
      interventionsToday: state.interventionsToday + 1,
    });
  }

  return executions;
}

async function executeIntervention(
  userId: string,
  rule: InterventionRule,
  context: Record<string, unknown>,
): Promise<InterventionExecution> {
  const execution: InterventionExecution = {
    id: crypto.randomUUID(),
    userId,
    ruleId: rule.id,
    triggerType: rule.trigger.type,
    status: 'PENDING',
    triggeredAt: Date.now(),
    executedAt: null,
    messageId: null,
    userResponse: null,
    effectiveness: null,
    result: null,
  };

  await repository.createInterventionExecution(execution);

  try {
    switch (rule.action.type) {
      case 'SEND_MESSAGE':
      case 'SEND_PUSH':
      case 'SHOW_MODAL':
      case 'SHOW_BANNER': {
        const category = inferCategoryFromTrigger(rule.trigger.type);
        const message = await generateMessage({
          userId,
          category,
          context,
          preferredDelivery: rule.action.deliveryMethod,
        });
        if (message) {
          const savedMessage = await repository.createCoachMessage({
            ...message,
            status: rule.action.delayMinutes > 0 ? 'SCHEDULED' : 'SENT',
            scheduledFor:
              rule.action.delayMinutes > 0
                ? Date.now() + rule.action.delayMinutes * 60 * 1000
                : null,
          });
          execution.messageId = savedMessage.id;
        }
        break;
      }
      case 'SUGGEST_SESSION':
      case 'ADJUST_DIFFICULTY':
      case 'SCHEDULE_REMINDER':
      case 'ACTIVATE_COMEBACK':
      case 'MUTE_NOTIFICATIONS':
        break;
    }
    execution.status = 'EXECUTED';
    execution.executedAt = Date.now();
  } catch (error: unknown) {
    execution.status = 'FAILED';
  }

  await repository.updateInterventionExecution(
    execution.id,
    execution.status,
    execution.result ?? undefined,
  );
  return execution;
}

function inferCategoryFromTrigger(triggerType: TriggerType): MessageCategory {
  const mapping: Record<TriggerType, MessageCategory> = {
    STREAK_AT_RISK: 'STREAK_RISK',
    NO_SESSION_24H: 'MOTIVATION_BOOST',
    NO_SESSION_48H: 'STREAK_RISK',
    NO_SESSION_72H: 'COMEBACK_SUPPORT',
    SESSION_ABANDONED: 'POST_FAILURE',
    LOW_QUALITY_SESSION: 'POST_FAILURE',
    MILESTONE_REACHED: 'MILESTONE_HYPE',
    LEVEL_UP: 'MILESTONE_HYPE',
    BOSS_TIMEOUT_WARNING: 'CHALLENGE_PROMPT',
    CHALLENGE_EXPIRING: 'CHALLENGE_PROMPT',
    COMEBACK_WINDOW_OPEN: 'COMEBACK_SUPPORT',
    DIFFICULTY_MISMATCH: 'DIFFICULTY_ADJUST',
    OVERLOAD_DETECTED: 'OVERLOAD_WARNING',
    MUTED_USER_REMINDER: 'MOTIVATION_BOOST',
  };
  return mapping[triggerType];
}
