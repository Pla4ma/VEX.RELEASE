import {
  type CoachState,
  type InterventionCondition,
  type InterventionExecution,
  type InterventionRule,
  type MessageCategory,
  type TriggerType,
} from '../schemas';
import * as repository from '../repository';
import { withRetry } from '../utils/retry';
import {
  DEFAULT_ENGINE_CONFIG,
  InterventionError,
} from './intervention-engine-types';
import { v4 } from '../../../utils/uuid';

// ─── Condition Evaluation ───

export function evaluateConditions(
  conditions: InterventionCondition[],
  context: Record<string, unknown>,
): boolean {
  if (conditions.length === 0) {
    return true;
  }
  return conditions.every((condition) =>
    evaluateSingleCondition(condition, context),
  );
}

function evaluateSingleCondition(
  condition: InterventionCondition,
  context: Record<string, unknown>,
): boolean {
  const { field, operator, value } = condition;
  const contextValue = getNestedValue(context, field);
  switch (operator) {
    case 'eq':
      return contextValue === value;
    case 'gt':
      return Number(contextValue) > Number(value);
    case 'lt':
      return Number(contextValue) < Number(value);
    case 'gte':
      return Number(contextValue) >= Number(value);
    case 'lte':
      return Number(contextValue) <= Number(value);
    case 'in':
      return Array.isArray(value) && value.includes(contextValue);
    default:
      return false;
  }
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object') {
      return Object.entries(current).find(
        ([entryKey]) => entryKey === key,
      )?.[1];
    }
    return undefined;
  }, obj);
}

// ─── State Queries ───

export function isGloballyMuted(coachState: CoachState): boolean {
  if (coachState.muteUntil && coachState.muteUntil > Date.now()) {
    return true;
  }
  if (coachState.reduceNotifications) {
    return false;
  }
  return false;
}

export async function fetchCoachStateWithRetry(
  userId: string,
): Promise<CoachState> {
  const state = await withRetry(
    () => repository.fetchCoachState(userId),
    { maxAttempts: 3 },
    'fetch-coach-state',
  );
  if (!state) {
    throw new InterventionError(`No coach state found for user ${userId}`);
  }
  return state;
}

export async function fetchTodaysExecutionsWithRetry(
  userId: string,
): Promise<InterventionExecution[]> {
  return withRetry(
    () => repository.fetchTodaysInterventionExecutions(userId),
    { maxAttempts: 3 },
    'fetch-todays-executions',
  );
}

export async function isInCooldown(
  userId: string,
  rule: InterventionRule,
): Promise<boolean> {
  return withRetry(
    () =>
      repository.wasRuleTriggeredRecently(
        userId,
        rule.id,
        rule.cooldownHours || DEFAULT_ENGINE_CONFIG.defaultCooldownHours,
      ),
    { maxAttempts: 2 },
    'check-cooldown',
  );
}

// ─── State Mutations ───

export async function deferExecution(
  _execution: InterventionExecution,
): Promise<void> {}

export async function updateInterventionCount(userId: string): Promise<void> {
  const state = await fetchCoachStateWithRetry(userId);
  await repository.upsertCoachState({
    ...state,
    interventionsToday: state.interventionsToday + 1,
    lastInterventionAt: Date.now(),
  });
}

export async function muteUserNotifications(
  userId: string,
  hours: number,
): Promise<void> {
  const state = await fetchCoachStateWithRetry(userId);
  await repository.upsertCoachState({
    ...state,
    muteUntil: Date.now() + hours * 60 * 60 * 1000,
    reduceNotifications: true,
  });
}

// ─── Utilities ───

export function generateExecutionId(): string {
  return `exec_${Date.now()}_${v4().replace(/-/g, '').slice(0, 11)}`;
}

export function inferCategoryFromTrigger(
  triggerType: TriggerType,
): MessageCategory {
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

export function logInterventionError(
  _userId: string,
  _trigger: string,
  _error: unknown,
): void {}
