import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * Message Generator
 * Business logic for generating personalized coach messages and interventions
 *
 * Dependencies:
 * - Repository (data access)
 * - Persona Manager (coach state access)
 * - Schemas (validation)
 */

import * as repository from './repository';
import { GenerateMessageInputSchema, EvaluateInterventionsInputSchema, MarkMessageActionInputSchema, type CoachMessageTemplate, type CoachMessage, type InterventionRule, type InterventionExecution, type MessageCategory, type TriggerType, type DeliveryMethod, type GenerateMessageInput, type EvaluateInterventionsInput, type MarkMessageActionInput } from './schemas';
import { getOrCreateCoachState, updateCoachState } from './persona-manager';
import { generateCoachMessage, generateSessionSummary } from '../../shared/ai/edge-function-service';
import { getSessionRepository } from '../../session/repository/SessionRepository';
import { getRelevantMemories, generateMemoryReferenceMessage, type MemoryType, getMilestoneSummary } from './CoachMemory';
import { validateMessageQuality, type MessageQualityAnalysis, MessageQualityElements } from '../../../src/features/ai-coach/message-quality-gate';

// ============================================================================
// Constants
// ============================================================================

const INTERVENTION_COOLDOWN_HOURS = 4;
const MAX_INTERVENTIONS_PER_DAY = 5;
const MUTE_DURATION_HOURS = 24;

const DEFAULT_MESSAGE_TEMPLATES: Record<MessageCategory, string[]> = {
  STREAK_RISK: ['Your streak is at risk! Your 7-day streak needs {{minutesNeeded}} more minutes today.', "Don't let your {{currentStreak}}-day streak slip away! One quick focus session will save it.", 'Your streak needs you! A short session today keeps the momentum going.'],
  SESSION_SUGGESTION: ['Perfect time for a session! Your focus data shows you concentrate best at this time.', 'Ready to build momentum? A {{suggestedDuration}}-minute session would be ideal based on your patterns.', "Your optimal focus window is open! Based on your history, now is the time to maximize focus."],
  MILESTONE_HYPE: ['Incredible progress! {{milestoneDays}} days of consistency! Your data shows the effort is paying off.', 'Milestone reached! {{milestoneDays}} days proves your commitment to the practice.', 'Milestone crushed! {{milestoneDays}} days of focus data shows real growth.'],
  COMEBACK_SUPPORT: ["Welcome back! Your history shows you can rebuild. Let's start fresh with a {{bonusMultiplier}}x XP boost.", 'Missed a few days? No problem! Your comeback starts now with bonus rewards.', "Your focus record shows you had discipline before. Time to prove it again."],
  POST_FAILURE: ["That session didn't go as planned. Your patterns suggest adjusting the difficulty for next time.", 'Every expert was once a beginner. Your data shows improvement is possible with small tweaks.', "Focus is a skill. Today's difficulty becomes tomorrow's strength. Analyze and adjust."],
  PROGRESS_REMINDER: ["You're {{percentToNextLevel}}% to Level {{nextLevel}}! Your session history shows you're close to a breakthrough.", 'Your progress data shows {{totalXp}} XP earned so far. Keep the momentum going!', 'Level {{currentLevel}} is solid! Ready to push for {{nextLevel}}? Your streak data suggests now is the time.'],
  DIFFICULTY_ADJUST: ["Your recent sessions show a pattern. Let's adjust the challenge to match your current performance.", 'Your focus sessions have been {{trend}}. Based on your data, consider {{adjustmentDirection}} the difficulty.', 'Smart adaptation is key to growth. Your session history suggests a difficulty tweak now.'],
  CHALLENGE_PROMPT: ['Challenge alert! {{challengeName}} expires in {{hoursLeft}} hours. Your progress shows you can complete it.', "Don't leave rewards on the table! {{challengeProgress}}% complete — your data suggests finishing strong.", 'Your challenge data shows potential! One session could complete it.'],
  MOTIVATION_BOOST: ["Your focus data shows capability for amazing results. Today's session creates tomorrow's achievement.", 'Small steps compound into big results. Your session history proves consistency works.', 'Your focus patterns show you have what it takes. Trust your data.'],
  BREAK_SUGGESTION: ["You've been pushing hard! Your session frequency suggests you need a short break for recovery.", 'Quality over quantity. Your recent performance data indicates a mindful break now will improve future sessions.', 'Your focus data shows intensity. A reset now will help maintain long-term performance.'],
  OVERLOAD_WARNING: ["High session volume detected! Your data shows you\'ve completed many sessions today. Consider pacing for quality.", 'Impressive dedication! Your session count suggests you may be approaching burnout. Balance intensity with recovery.', "You're pushing hard based on your activity data! Make sure to balance intensity with recovery. 🌊"],
};

// ============================================================================
// Message Generation
// ============================================================================

async function generateAIBackedMessage(input: GenerateMessageInput): Promise<string | null> {
  try {
    const response = await generateCoachMessage({
      userId: input.userId,
      context: {
        category: input.category,
        currentStreak: readNumericContext(input.context, 'currentStreak', 'streakDays'),
        hoursSinceLastSession: readNumericContext(input.context, 'hoursSinceLastSession'),
        currentLevel: readNumericContext(input.context, 'currentLevel'),
        recentSessionQuality: readNumericContext(input.context, 'recentSessionQuality'),
        daysInactive: readNumericContext(input.context, 'daysInactive'),
      },
    });

    if (response.success && response.content) {
      return response.content;
    }
  } catch (error) {
    captureSilentFailure(error, { feature: 'ai-coach', operation: 'ui-fallback', type: 'ui' });
    return null;
  }

  return null;
}

function readNumericContext(context: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = context[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return undefined;
}

function generateQualityFallback(input: GenerateMessageInput, analysis: MessageQualityAnalysis): string {
  const streak = readNumericContext(input.context, 'currentStreak', 'streakDays') ?? 3;
  const hoursSince = readNumericContext(input.context, 'hoursSinceLastSession') ?? 12;
  const level = readNumericContext(input.context, 'currentLevel') ?? 1;

  const elements = analysis.qualityElements;

  let fallback = '';

  if (!elements.includes(MessageQualityElements.OBSERVED_BEHAVIOR)) {
    fallback += `Your ${streak}-day streak data shows you've been consistent. `;
  }
  if (!elements.includes(MessageQualityElements.SPECIFIC_RECOMMENDATION)) {
    fallback += `Based on your patterns, a 25-minute focus session now would be optimal. `;
  }
  if (!elements.includes(MessageQualityElements.TIMING_SUGGESTION)) {
    fallback += hoursSince > 24 ? 'Tonight is the best time to act based on your history. ' : 'Your focus data suggests right now is your optimal window. ';
  }
  if (!elements.includes(MessageQualityElements.REASON)) {
    fallback += 'This will help protect your streak and maintain your momentum. ';
  }
  if (!elements.includes(MessageQualityElements.NEXT_ACTION)) {
    fallback += 'Start a session now to see immediate progress. ';
  }
  if (!elements.includes(MessageQualityElements.CONFIDENCE_LEVEL)) {
    fallback += "Based on your session history, there's a 85% chance this will improve your performance.";
  }

  return fallback.trim();
}

function isCategoryMuted(state: { muteUntil: number | null }, category: MessageCategory): boolean {
  // Check if we have history data
  return false; // Simplified - would check mutedCategories from history
}

function checkConditions(conditions: Array<{ type?: string; operator: string; value?: unknown; field?: string }>, context: Record<string, unknown>): boolean {
  return conditions.every((condition) => {
    const key = condition.type || condition.field;
    if (!key) {
      return false;
    }
    const contextValue = context[key];
    if (contextValue === undefined) {
      return false;
    }

    switch (condition.operator) {
      case 'eq':
        return contextValue === condition.value;
      case 'gt':
        return Number(contextValue) > Number(condition.value);
      case 'lt':
        return Number(contextValue) < Number(condition.value);
      case 'gte':
        return Number(contextValue) >= Number(condition.value);
      case 'lte':
        return Number(contextValue) <= Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      default:
        return false;
    }
  });
}

function getDefaultTemplate(category: MessageCategory, context: Record<string, unknown>): string | null {
  const templates = DEFAULT_MESSAGE_TEMPLATES[category];
  if (!templates || templates.length === 0) {
    return null;
  }

  // Simple variable substitution
  let template = templates[Math.floor(Math.random() * templates.length)];

  // Replace variables
  Object.entries(context).forEach(([key, value]) => {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });

  return template;
}

function selectVariation(template: CoachMessageTemplate): string {
  const allVariations = [template.content, ...template.variations];
  return allVariations[Math.floor(Math.random() * allVariations.length)];
}

function createMessageFromTemplate(input: GenerateMessageInput, personaId: string, content: string, priority: number = 5): CoachMessage {
  return {
    id: crypto.randomUUID(),
    userId: input.userId,
    personaId,
    category: input.category,
    content,
    deliveryMethod: input.preferredDelivery,
    priority,
    status: 'DRAFT',
    createdAt: Date.now(),
    scheduledFor: null,
    deliveredAt: null,
    readAt: null,
    dismissedAt: null,
    actionTaken: null,
    actionTakenAt: null,
  };
}

// ============================================================================
// Intervention Engine
// ============================================================================

async function executeIntervention(userId: string, rule: InterventionRule, context: Record<string, unknown>): Promise<InterventionExecution> {
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
  };

  await repository.createInterventionExecution(execution);

  try {
    // Handle different action types
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
            scheduledFor: rule.action.delayMinutes > 0 ? Date.now() + rule.action.delayMinutes * 60 * 1000 : null,
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
        // These are handled by other modules
        break;
    }

    execution.status = 'EXECUTED';
    execution.executedAt = Date.now();
  } catch (error) {
    execution.status = 'FAILED';
    // Log error via analytics
  }

  await repository.updateInterventionExecution(execution.id, execution.status, execution.result ?? undefined);
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

  return mapping[triggerType] || 'MOTIVATION_BOOST';
}

// ============================================================================
// Message Actions
// ============================================================================

async function trackEffectiveness(message: CoachMessage, action: string, metadata?: Record<string, unknown>): Promise<void> {
  // Calculate time to action
  const timeToAction = message.deliveredAt ? (Date.now() - message.deliveredAt) / 1000 : null;

  // Record effectiveness data
  // This would be saved to analytics/repository
}

// ============================================================================
// Memory-Aware Message Generation (Phase 6)
// ============================================================================
// ============================================================================
// Summary Generation
// ============================================================================

async function generateAISummaryMessage(
  userId: string,
  period: 'daily' | 'weekly' | 'monthly',
  context: {
    sessionCount: number;
    totalFocusMinutes: number;
    averageQuality: number;
    streakDays: number;
    xpEarned: number;
    challengesCompleted: number;
  },
  currentState: string,
): Promise<string> {
  try {
    const response = await generateSessionSummary({
      userId,
      context: {
        sessionCount: context.sessionCount,
        totalFocusMinutes: context.totalFocusMinutes,
        averageQuality: Math.round(context.averageQuality),
        streakDays: context.streakDays,
        xpEarned: context.xpEarned,
        challengesCompleted: context.challengesCompleted,
        preferredTimeOfDay: period,
        consistencyScore: context.sessionCount > 0 ? Math.min(100, context.streakDays * 10) : 0,
      },
    });

    if (response.success) {
      return response.structuredData.encouragement || response.content;
    }
  } catch (error) {
    captureSilentFailure(error, { feature: 'ai-coach', operation: 'ui-fallback', type: 'ui' });
    return generateSummaryMessage(currentState, period);
  }

  return generateSummaryMessage(currentState, period);
}

function generateSummaryMessage(state: string, period: string): string {
  const messages: Record<string, string[]> = {
    daily: ['Great work today! Every session is a step forward.', "You showed up today—that's what matters. Keep building!", "Today's focus is tomorrow's success. Well done!"],
    weekly: ['What a week! Your consistency is paying off. 🎉', '7 days of effort, infinite progress. Keep it up!', 'You crushed this week! Ready for the next one?'],
    monthly: ["A month of dedication! You're becoming unstoppable. 🚀", "30 days of growth. Look how far you've come!", 'Monthly milestone achieved! Your future self thanks you.'],
  };

  const periodMessages = messages[period] || messages.daily;
  return periodMessages[Math.floor(Math.random() * periodMessages.length)];
}

export * from "./message-generator.part1";
export * from "./message-generator.part2";
