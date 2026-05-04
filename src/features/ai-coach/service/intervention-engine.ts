import {
  type CoachState,
  type InterventionCondition,
  type InterventionExecution,
  type InterventionRule,
  type MessageCategory,
  type TriggerType,
} from '../schemas';
import * as repository from '../repository';
import { CircuitBreaker, RateLimiter, withRetry } from '../utils/retry';
import { generateMessage } from './message-generator';

interface EngineConfig {
  maxConcurrentExecutions: number;
  defaultCooldownHours: number;
  maxInterventionsPerDay: number;
  enableRuleChaining: boolean;
  priorityThreshold: number;
}

const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  maxConcurrentExecutions: 3,
  defaultCooldownHours: 4,
  maxInterventionsPerDay: 5,
  enableRuleChaining: true,
  priorityThreshold: 7,
};

class InterventionEngineState {
  private activeExecutions: Map<string, Promise<void>> = new Map();
  private ruleCache: Map<string, InterventionRule[]> = new Map();
  private cacheTimestamp = 0;
  private readonly cacheTTLMs = 5 * 60 * 1000;
  private circuitBreaker = new CircuitBreaker(
    { failureThreshold: 5, resetTimeoutMs: 30000, halfOpenMaxCalls: 3 },
    'intervention-engine',
  );
  private rateLimiter = new RateLimiter(10, 60000);

  async acquireExecutionSlot(executionId: string): Promise<boolean> {
    if (this.activeExecutions.size >= DEFAULT_ENGINE_CONFIG.maxConcurrentExecutions) {
      return false;
    }
    return true;
  }

  releaseExecutionSlot(executionId: string): void {
    this.activeExecutions.delete(executionId);
  }

  getCachedRules(triggerType: string): InterventionRule[] | null {
    if (Date.now() - this.cacheTimestamp > this.cacheTTLMs) {
      this.ruleCache.clear();
      return null;
    }
    return this.ruleCache.get(triggerType) || null;
  }

  setCachedRules(triggerType: string, rules: InterventionRule[]): void {
    this.ruleCache.set(triggerType, rules);
    this.cacheTimestamp = Date.now();
  }

  getCircuitBreaker(): CircuitBreaker {
    return this.circuitBreaker;
  }

  getRateLimiter(): RateLimiter {
    return this.rateLimiter;
  }
}

const engineState = new InterventionEngineState();

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

      if (todaysExecutions.length >= DEFAULT_ENGINE_CONFIG.maxInterventionsPerDay) {
        throw new DailyLimitExceededError(
          `Daily intervention limit (${DEFAULT_ENGINE_CONFIG.maxInterventionsPerDay}) exceeded`,
        );
      }
      if (isGloballyMuted(coachState)) {
        throw new InterventionSuppressedError('User has muted all interventions');
      }

      const rules = await fetchRulesWithCache(trigger);
      const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

      for (const rule of sortedRules) {
        if (await isInCooldown(userId, rule)) {continue;}
        const ruleExecutionsToday = todaysExecutions.filter((execution) => execution.ruleId === rule.id).length;
        if (ruleExecutionsToday >= rule.maxPerDay) {continue;}
        if (!evaluateConditions(rule.conditions, context)) {continue;}

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

function evaluateConditions(conditions: InterventionCondition[], context: Record<string, unknown>): boolean {
  if (conditions.length === 0) {return true;}
  return conditions.every((condition) => evaluateSingleCondition(condition, context));
}

function evaluateSingleCondition(condition: InterventionCondition, context: Record<string, unknown>): boolean {
  const { field, operator, value } = condition;
  const contextValue = getNestedValue(context, field);
  switch (operator) {
    case 'eq': return contextValue === value;
    case 'gt': return Number(contextValue) > Number(value);
    case 'lt': return Number(contextValue) < Number(value);
    case 'gte': return Number(contextValue) >= Number(value);
    case 'lte': return Number(contextValue) <= Number(value);
    case 'in': return Array.isArray(value) && value.includes(contextValue);
    default: return false;
  }
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object') {
      return Object.entries(current).find(([entryKey]) => entryKey === key)?.[1];
    }
    return undefined;
  }, obj);
}

async function executeIntervention(
  userId: string,
  rule: InterventionRule,
  context: Record<string, unknown>,
  coachState: CoachState,
): Promise<InterventionExecution> {
  const executionId = generateExecutionId();
  if (!(await engineState.acquireExecutionSlot(executionId))) {
    throw new ExecutionSlotUnavailableError('Max concurrent executions reached');
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
    await withRetry(() => repository.createInterventionExecution(execution), { maxAttempts: 3 }, 'persist-execution');
    const result = await executeAction(userId, rule, context, coachState);
    execution.status = 'EXECUTED';
    execution.executedAt = Date.now();
    execution.messageId = result.messageId;
    await withRetry(() => repository.updateInterventionExecution(execution.id, execution.status, execution.result ?? undefined), { maxAttempts: 3 }, 'update-execution');
    await updateInterventionCount(userId);
  } catch (error) {
    execution.status = 'FAILED';
    await repository.updateInterventionExecution(execution.id, execution.status, execution.result ?? undefined);
    throw error;
  } finally {
    engineState.releaseExecutionSlot(executionId);
  }

  return execution;
}

async function executeAction(
  userId: string,
  rule: InterventionRule,
  context: Record<string, unknown>,
  coachState: CoachState,
): Promise<{ messageId: string | null }> {
  const { action } = rule;
  switch (action.type) {
    case 'SEND_MESSAGE':
    case 'SEND_PUSH':
    case 'SHOW_MODAL':
    case 'SHOW_BANNER': {
      const message = await generateMessage({
        userId,
        category: inferCategoryFromTrigger(rule.trigger.type),
        context,
        preferredDelivery: action.deliveryMethod,
      });
      if (message) {
        const savedMessage = await withRetry(
          () => repository.createCoachMessage({
            ...message,
            status: action.delayMinutes > 0 ? 'SCHEDULED' : 'SENT',
            scheduledFor: action.delayMinutes > 0 ? Date.now() + action.delayMinutes * 60 * 1000 : null,
          }),
          { maxAttempts: 3 },
          'create-message',
        );
        return { messageId: savedMessage.id };
      }
      return { messageId: null };
    }
    case 'SUGGEST_SESSION':
      return { messageId: null };
    case 'ADJUST_DIFFICULTY':
      return { messageId: null };
    case 'SCHEDULE_REMINDER':
      return { messageId: null };
    case 'ACTIVATE_COMEBACK':
      return { messageId: null };
    case 'MUTE_NOTIFICATIONS':
      await muteUserNotifications(userId, 24);
      return { messageId: null };
    default:
      return { messageId: null };
  }
}

async function fetchCoachStateWithRetry(userId: string): Promise<CoachState> {
  const state = await withRetry(() => repository.fetchCoachState(userId), { maxAttempts: 3 }, 'fetch-coach-state');
  if (!state) {
    throw new InterventionError(`No coach state found for user ${userId}`);
  }
  return state;
}

async function fetchTodaysExecutionsWithRetry(userId: string): Promise<InterventionExecution[]> {
  return withRetry(
    () => repository.fetchTodaysInterventionExecutions(userId),
    { maxAttempts: 3 },
    'fetch-todays-executions',
  );
}

async function fetchRulesWithCache(triggerType: TriggerType): Promise<InterventionRule[]> {
  const cached = engineState.getCachedRules(triggerType);
  if (cached) {return cached;}
  const rules = await withRetry(
    () => repository.fetchInterventionRulesByTrigger(triggerType),
    { maxAttempts: 3 },
    'fetch-intervention-rules',
  );
  const enabledRules = rules.filter((rule) => rule.enabled);
  engineState.setCachedRules(triggerType, enabledRules);
  return enabledRules;
}

async function isInCooldown(userId: string, rule: InterventionRule): Promise<boolean> {
  return withRetry(
    () => repository.wasRuleTriggeredRecently(
      userId,
      rule.id,
      rule.cooldownHours || DEFAULT_ENGINE_CONFIG.defaultCooldownHours,
    ),
    { maxAttempts: 2 },
    'check-cooldown',
  );
}

function isGloballyMuted(coachState: CoachState): boolean {
  if (coachState.muteUntil && coachState.muteUntil > Date.now()) {
    return true;
  }
  if (coachState.reduceNotifications) {
    return false;
  }
  return false;
}

async function deferExecution(execution: InterventionExecution): Promise<void> {}

async function updateInterventionCount(userId: string): Promise<void> {
  const state = await fetchCoachStateWithRetry(userId);
  await repository.upsertCoachState({
    ...state,
    interventionsToday: state.interventionsToday + 1,
    lastInterventionAt: Date.now(),
  });
}

async function muteUserNotifications(userId: string, hours: number): Promise<void> {
  const state = await fetchCoachStateWithRetry(userId);
  await repository.upsertCoachState({
    ...state,
    muteUntil: Date.now() + hours * 60 * 60 * 1000,
    reduceNotifications: true,
  });
}

function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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
  return mapping[triggerType] || 'MOTIVATION_BOOST';
}

function logInterventionError(userId: string, trigger: string, error: unknown): void {}

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
