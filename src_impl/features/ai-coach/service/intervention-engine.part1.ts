import { type CoachState, type InterventionCondition, type InterventionExecution, type InterventionRule, type MessageCategory, type TriggerType } from "../schemas";
import * as repository from "../repository";
import { CircuitBreaker, RateLimiter, withRetry } from "../utils/retry";
import { generateMessage } from "./message-generator";


export async function evaluateInterventions(userId: string, trigger: TriggerType, context: Record<string, unknown>): Promise<InterventionExecution[]> {
  const executions: InterventionExecution[] = [];

  try {
    await engineState.getCircuitBreaker().execute(async () => {
      await engineState.getRateLimiter().acquire();
      const [coachState, todaysExecutions] = await Promise.all([fetchCoachStateWithRetry(userId), fetchTodaysExecutionsWithRetry(userId)]);

      if (todaysExecutions.length >= DEFAULT_ENGINE_CONFIG.maxInterventionsPerDay) {
        throw new DailyLimitExceededError(`Daily intervention limit (${DEFAULT_ENGINE_CONFIG.maxInterventionsPerDay}) exceeded`);
      }
      if (isGloballyMuted(coachState)) {
        throw new InterventionSuppressedError('User has muted all interventions');
      }

      const rules = await fetchRulesWithCache(trigger);
      const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

      for (const rule of sortedRules) {
        if (await isInCooldown(userId, rule)) {
          continue;
        }
        const ruleExecutionsToday = todaysExecutions.filter((execution) => execution.ruleId === rule.id).length;
        if (ruleExecutionsToday >= rule.maxPerDay) {
          continue;
        }
        if (!evaluateConditions(rule.conditions, context)) {
          continue;
        }

        const execution = await executeIntervention(userId, rule, context, coachState);
        executions.push(execution);
        if (rule.priority < DEFAULT_ENGINE_CONFIG.priorityThreshold) {
          await deferExecution(execution);
        }
        if (executions.length + todaysExecutions.length >= DEFAULT_ENGINE_CONFIG.maxInterventionsPerDay) {
          break;
        }
      }
    });
  } catch (error) {
    if (error instanceof DailyLimitExceededError || error instanceof InterventionSuppressedError) {
      return executions;
    }
    logInterventionError(userId, trigger, error);
    throw error;
  }

  return executions;
}

export class InterventionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InterventionError';
  }
}

export class DailyLimitExceededError extends InterventionError {
  constructor(message: string) {
    super(message);
    this.name = 'DailyLimitExceededError';
  }
}

export class InterventionSuppressedError extends InterventionError {
  constructor(message: string) {
    super(message);
    this.name = 'InterventionSuppressedError';
  }
}

export class ExecutionSlotUnavailableError extends InterventionError {
  constructor(message: string) {
    super(message);
    this.name = 'ExecutionSlotUnavailableError';
  }
}