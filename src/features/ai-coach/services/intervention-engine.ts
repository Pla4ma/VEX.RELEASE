import {
  type CoachState, type InterventionExecution,
  type InterventionRule, type TriggerType,
} from '../schemas';
import * as repository from '../repository';
import { withRetry } from '../utils/retry';
import {
  DEFAULT_ENGINE_CONFIG,
  DailyLimitExceededError,
  InterventionSuppressedError,
  ExecutionSlotUnavailableError,
} from './intervention-engine-types';
import {
  engineState, fetchRulesWithCache, executeAction,
} from './intervention-engine-state';
import {
  evaluateConditions, generateExecutionId,
  logInterventionError, fetchCoachStateWithRetry,
  fetchTodaysExecutionsWithRetry, isInCooldown, isGloballyMuted,
  updateInterventionCount, deferExecution,
} from './intervention-engine-helpers';

export async function evaluateInterventions(
  userId: string,
  trigger: TriggerType,
  context: Record<string, unknown>,
): Promise<InterventionExecution[]> {
  const executions: InterventionExecution[] = [];
  try {
    await engineState.getCircuitBreaker().execute(async () => {
      await engineState.getRateLimiter().acquire();
      const [coachState, todaysExecutions] = await Promise.all([
        fetchCoachStateWithRetry(userId),
        fetchTodaysExecutionsWithRetry(userId),
      ]);
      if (
        todaysExecutions.length >= DEFAULT_ENGINE_CONFIG.maxInterventionsPerDay
      ) {
        throw new DailyLimitExceededError(
          `Daily intervention limit (${DEFAULT_ENGINE_CONFIG.maxInterventionsPerDay}) exceeded`,
        );
      }
      if (isGloballyMuted(coachState)) {
        throw new InterventionSuppressedError(
          'User has muted all interventions',
        );
      }
      const rules = await fetchRulesWithCache(trigger);
      const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);
      for (const rule of sortedRules) {
        if (await isInCooldown(userId, rule)) {
          continue;
        }
        const ruleExecutionsToday = todaysExecutions.filter(
          (execution) => execution.ruleId === rule.id,
        ).length;
        if (ruleExecutionsToday >= rule.maxPerDay) {
          continue;
        }
        if (!evaluateConditions(rule.conditions, context)) {
          continue;
        }
        const execution = await executeIntervention(
          userId, rule, context, coachState,
        );
        executions.push(execution);
        if (rule.priority < DEFAULT_ENGINE_CONFIG.priorityThreshold) {
          await deferExecution(execution);
        }
        if (
          executions.length + todaysExecutions.length >=
          DEFAULT_ENGINE_CONFIG.maxInterventionsPerDay
        ) {
          break;
        }
      }
    });
  } catch (error) {
    if (
      error instanceof DailyLimitExceededError ||
      error instanceof InterventionSuppressedError
    ) {
      return executions;
    }
    logInterventionError(userId, trigger, error);
    throw error;
  }
  return executions;
}

async function executeIntervention(
  userId: string,
  rule: InterventionRule,
  context: Record<string, unknown>,
  coachState: CoachState,
): Promise<InterventionExecution> {
  const executionId = generateExecutionId();
  if (!(await engineState.acquireExecutionSlot(executionId))) {
    throw new ExecutionSlotUnavailableError(
      'Max concurrent executions reached',
    );
  }
  const execution: InterventionExecution = {
    id: executionId,
    userId,
    ruleId: rule.id,
    triggerType: rule.trigger.type,
    status: 'PENDING',
    triggeredAt: Date.now(),
    executedAt: null,
    messageId: null,
    userResponse: null,
    effectiveness: null,
  };
  try {
    await withRetry(
      () => repository.createInterventionExecution(execution),
      { maxAttempts: 3 },
      'persist-execution',
    );
    const result = await executeAction(userId, rule, context);
    execution.status = 'EXECUTED';
    execution.executedAt = Date.now();
    execution.messageId = result.messageId;
    await withRetry(
      () =>
        repository.updateInterventionExecution(
          execution.id,
          execution.status,
          execution.result ?? undefined,
        ),
      { maxAttempts: 3 },
      'update-execution',
    );
    await updateInterventionCount(userId);
  } catch (error) {
    execution.status = 'FAILED';
    await repository.updateInterventionExecution(
      execution.id,
      execution.status,
      execution.result ?? undefined,
    );
    throw error;
  } finally {
    engineState.releaseExecutionSlot(executionId);
  }
  return execution;
}
