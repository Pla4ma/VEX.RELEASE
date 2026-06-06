import { type InterventionRule, type TriggerType } from '../schemas';
import { CircuitBreaker, RateLimiter, withRetry } from '../utils/retry';
import * as repository from '../repository';
import { generateMessage } from './message-generator';
import { DEFAULT_ENGINE_CONFIG } from './intervention-engine-types';
import {
  inferCategoryFromTrigger,
  muteUserNotifications,
} from './intervention-engine-helpers';

export class InterventionEngineState {
  private activeExecutions: Map<string, Promise<void>> = new Map();
  private ruleCache: Map<string, InterventionRule[]> = new Map();
  private cacheTimestamp = 0;
  private readonly cacheTTLMs = 5 * 60 * 1000;
  private circuitBreaker = new CircuitBreaker(
    { failureThreshold: 5, resetTimeoutMs: 30000, halfOpenMaxCalls: 3 },
    'intervention-engine',
  );
  private rateLimiter = new RateLimiter(10, 60000);

  async acquireExecutionSlot(_executionId: string): Promise<boolean> {
    if (
      this.activeExecutions.size >=
      DEFAULT_ENGINE_CONFIG.maxConcurrentExecutions
    ) {
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

export const engineState = new InterventionEngineState();

export async function fetchRulesWithCache(
  triggerType: TriggerType,
): Promise<InterventionRule[]> {
  const cached = engineState.getCachedRules(triggerType);
  if (cached) {
    return cached;
  }
  const rules = await withRetry(
    () => repository.fetchInterventionRulesByTrigger(triggerType),
    { maxAttempts: 3 },
    'fetch-intervention-rules',
  );
  const enabledRules = rules.filter((rule) => rule.enabled);
  engineState.setCachedRules(triggerType, enabledRules);
  return enabledRules;
}

export async function executeAction(
  userId: string,
  rule: InterventionRule,
  context: Record<string, unknown>,
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
          () =>
            repository.createCoachMessage({
              ...message,
              status: action.delayMinutes > 0 ? 'SCHEDULED' : 'SENT',
              scheduledFor:
                action.delayMinutes > 0
                  ? Date.now() + action.delayMinutes * 60 * 1000
                  : null,
            }),
          { maxAttempts: 3 },
          'create-message',
        );
        return { messageId: savedMessage.id };
      }
      return { messageId: null };
    }
    case 'MUTE_NOTIFICATIONS':
      await muteUserNotifications(userId, 24);
      return { messageId: null };
    default:
      return { messageId: null };
  }
}
