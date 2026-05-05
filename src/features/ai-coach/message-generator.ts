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
import {
  GenerateMessageInputSchema,
  EvaluateInterventionsInputSchema,
  MarkMessageActionInputSchema,
  type CoachMessageTemplate,
  type CoachMessage,
  type InterventionRule,
  type InterventionExecution,
  type MessageCategory,
  type TriggerType,
  type DeliveryMethod,
  type GenerateMessageInput,
  type EvaluateInterventionsInput,
  type MarkMessageActionInput,
} from './schemas';
import { getOrCreateCoachState, updateCoachState } from './persona-manager';
import {
  generateCoachMessage,
  generateSessionSummary,
} from '../../shared/ai/edge-function-service';
import { getSessionRepository } from '../../session/repository/SessionRepository';
import {
  getRelevantMemories,
  generateMemoryReferenceMessage,
  type MemoryType,
  getMilestoneSummary,
} from './CoachMemory';

// ============================================================================
// Constants
// ============================================================================

const INTERVENTION_COOLDOWN_HOURS = 4;
const MAX_INTERVENTIONS_PER_DAY = 5;
const MUTE_DURATION_HOURS = 24;

const DEFAULT_MESSAGE_TEMPLATES: Record<MessageCategory, string[]> = {
  STREAK_RISK: [
    'Your streak is at risk! 🔥 Just {{minutesNeeded}} more minutes to keep it alive.',
    "Don't let your {{currentStreak}}-day streak slip away! One quick session will save it.",
    'Your streak needs you! ⚡ A short focus session today keeps the momentum going.',
  ],
  SESSION_SUGGESTION: [
    'Perfect time for a session! 🎯 You usually focus best at this time.',
    'Ready to build momentum? A {{suggestedDuration}}-minute session would be ideal now.',
    "Your optimal focus window is open! Let's make the most of it.",
  ],
  MILESTONE_HYPE: [
    "Incredible! 🎉 {{milestoneDays}} days strong! You're unstoppable!",
    'LEGENDARY! 🔥 {{milestoneDays}} days of pure dedication!',
    'Milestone crushed! 🏆 {{milestoneDays}} days proves your commitment!',
  ],
  COMEBACK_SUPPORT: [
    "Welcome back! 💪 Every master was once a beginner. Let's rebuild together.",
    'Missed a few days? No problem! Your comeback starts now with {{bonusMultiplier}}x XP!',
    "The streak may have broken, but your spirit didn't! Ready to rise again?",
  ],
  POST_FAILURE: [
    "That session didn't go as planned. That's okay—growth comes from challenges! 🌱",
    'Every expert was once a beginner who kept trying. Next time will be better! 💪',
    "Focus is a skill. Today's difficulty is tomorrow's strength. Keep going!",
  ],
  PROGRESS_REMINDER: [
    "You're {{percentToNextLevel}}% to Level {{nextLevel}}! One more session could push you over! 🎯",
    'Your progress is adding up! {{totalXp}} XP earned so far. Keep the momentum!',
    'Level {{currentLevel}} looks good on you! Ready to push for {{nextLevel}}?',
  ],
  DIFFICULTY_ADJUST: [
    "Noticing a pattern? 🧠 Let's adjust the challenge to match your current flow.",
    'Your focus sessions have been {{trend}}. Want to {{adjustmentDirection}} the difficulty?',
    'Smart adaptation is key to growth. A difficulty tweak might be perfect now.',
  ],
  CHALLENGE_PROMPT: [
    'Challenge alert! 🎮 {{challengeName}} expires in {{hoursLeft}} hours. Ready to crush it?',
    "Don't leave rewards on the table! {{challengeProgress}}% done—finish strong!",
    'Your challenge is calling! One session could complete it. 💎',
  ],
  MOTIVATION_BOOST: [
    "You're capable of amazing things. Today's focus is tomorrow's achievement. ✨",
    'Small steps, big results. Every session compounds into greatness! 📈',
    'Your future self will thank you for the focus you put in today. 🙏',
  ],
  BREAK_SUGGESTION: [
    "You've been crushing it! 🧘 A short break will recharge you for even better focus.",
    'Quality over quantity. A mindful break now means sharper focus later.',
    'Your brain deserves a reset. Step away, breathe, then come back stronger.',
  ],
  OVERLOAD_WARNING: [
    "Whoa, that's a lot of sessions today! 🔥 Remember to rest—burnout helps no one.",
    'Impressive dedication, but your focus quality may drop. Consider pacing yourself.',
    "You're pushing hard! Make sure to balance intensity with recovery. 🌊",
  ],
};

// ============================================================================
// Message Generation
// ============================================================================

/**
 * Generate a personalized coach message
 */
export async function generateMessage(input: GenerateMessageInput): Promise<CoachMessage | null> {
  const validated = GenerateMessageInputSchema.parse(input);
  const state = await getOrCreateCoachState(validated.userId);

  // Check if user has muted this category
  if (isCategoryMuted(state, validated.category)) {
    return null;
  }

  // Check global mute
  if (state.muteUntil && state.muteUntil > Date.now()) {
    return null;
  }

  const aiContent = await generateAIBackedMessage(validated);
  if (aiContent) {
    return createMessageFromTemplate(validated, state.personaId, aiContent);
  }

  // Fetch templates
  const templates = await repository.fetchMessageTemplates(state.personaId, validated.category);

  // Filter by conditions
  const matchingTemplates = templates.filter(template =>
    checkConditions(template.conditions, validated.context)
  );

  if (matchingTemplates.length === 0) {
    // Use default templates if no matches
    const defaultContent = getDefaultTemplate(validated.category, validated.context);
    if (!defaultContent) {return null;}

    return createMessageFromTemplate(validated, state.personaId, defaultContent);
  }

  // Select best template (highest priority, then random for same priority)
  const bestTemplate = matchingTemplates[0];
  const content = selectVariation(bestTemplate);

  return createMessageFromTemplate(validated, state.personaId, content, bestTemplate.priority);
}

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
  } catch (error) { captureSilentFailure(error, { feature: 'ai-coach', operation: 'ui-fallback', type: 'ui' });
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

function isCategoryMuted(state: { muteUntil: number | null }, category: MessageCategory): boolean {
  // Check if we have history data
  return false; // Simplified - would check mutedCategories from history
}

function checkConditions(
  conditions: Array<{ type?: string; operator: string; value?: unknown; field?: string }>,
  context: Record<string, unknown>
): boolean {
  return conditions.every(condition => {
    const key = condition.type || condition.field;
    if (!key) {return false;}
    const contextValue = context[key];
    if (contextValue === undefined) {return false;}

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

function getDefaultTemplate(
  category: MessageCategory,
  context: Record<string, unknown>
): string | null {
  const templates = DEFAULT_MESSAGE_TEMPLATES[category];
  if (!templates || templates.length === 0) {return null;}

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

function createMessageFromTemplate(
  input: GenerateMessageInput,
  personaId: string,
  content: string,
  priority: number = 5
): CoachMessage {
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

/**
 * Evaluate and execute interventions based on trigger
 */
export async function evaluateInterventions(
  input: EvaluateInterventionsInput
): Promise<InterventionExecution[]> {
  const validated = EvaluateInterventionsInputSchema.parse(input);
  const state = await getOrCreateCoachState(validated.userId);

  // Check intervention limits
  if (state.interventionsToday >= MAX_INTERVENTIONS_PER_DAY) {
    return [];
  }

  // Check if globally muted
  if (state.muteUntil && state.muteUntil > Date.now()) {
    return [];
  }

  // Fetch applicable rules
  const rules = await repository.fetchInterventionRulesByTrigger(validated.trigger);

  const executions: InterventionExecution[] = [];

  for (const rule of rules) {
    // Check conditions
    if (!checkConditions(rule.conditions, validated.context)) {
      continue;
    }

    // Check cooldown
    const recentlyTriggered = await repository.wasRuleTriggeredRecently(
      validated.userId,
      rule.id,
      rule.cooldownHours
    );

    if (recentlyTriggered) {
      continue;
    }

    // Check daily limit for this rule type
    const todaysExecutions = await repository.fetchTodaysInterventionExecutions(validated.userId);
    const ruleExecutionsToday = todaysExecutions.filter(e => e.ruleId === rule.id).length;

    if (ruleExecutionsToday >= rule.maxPerDay) {
      continue;
    }

    // Execute intervention
    const execution = await executeIntervention(validated.userId, rule, validated.context);
    executions.push(execution);

    // Update intervention count
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
  context: Record<string, unknown>
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
            scheduledFor: rule.action.delayMinutes > 0
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

/**
 * Mark a message action taken
 */
export async function markMessageAction(input: MarkMessageActionInput): Promise<CoachMessage> {
  const validated = MarkMessageActionInputSchema.parse(input);

  const message = await repository.markMessageAction(
    validated.messageId,
    validated.action,
    Date.now()
  );

  // Track effectiveness
  await trackEffectiveness(message, validated.action, validated.metadata);

  return message;
}

async function trackEffectiveness(
  message: CoachMessage,
  action: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  // Calculate time to action
  const timeToAction = message.deliveredAt
    ? (Date.now() - message.deliveredAt) / 1000
    : null;

  // Record effectiveness data
  // This would be saved to analytics/repository
}

// ============================================================================
// Memory-Aware Message Generation (Phase 6)
// ============================================================================

/**
 * Generate memory-aware message content
 * References user milestones for personalized, relationship-building messages
 */
export async function generateMemoryAwareMessage(
  userId: string,
  category: MessageCategory,
  personaId: string,
  baseContext: Record<string, unknown>
): Promise<string | null> {
  const memories = await getRelevantMemories(userId, category, 2);
  const milestoneSummary = await getMilestoneSummary(userId);

  if (memories.length === 0 && milestoneSummary.totalMemories === 0) {
    return null; // No memories to reference
  }

  // Get persona style for template selection
  const state = await getOrCreateCoachState(userId);
  const persona = await repository.fetchCoachPersona(state.personaId);
  const personaStyle = persona?.style || 'MENTOR';

  // Build memory-aware message based on category and memories
  const memory = memories[0];
  const daysSince = memory
    ? Math.floor((Date.now() - memory.occurredAt) / (1000 * 60 * 60 * 24))
    : 0;

  // Template library with 20+ memory-aware messages
  const memoryTemplates: Record<string, Record<string, string[]>> = {
    MENTOR: {
      FIRST_S_GRADE: [
        `You hit your first S grade ${daysSince} days ago — that means ${memory?.metadata.duration || 'focused'} minutes of pure focus. You're capable of that excellence again.`,
        'Remember your first S grade? That wasn\'t luck — that was skill. You have it in you to do it again.',
        'Your first perfect session showed you what\'s possible. Time to show yourself again.',
      ],
      LONGEST_SESSION: [
        `Remember when you completed that ${memory?.metadata.duration}-minute session? That was a breakthrough. You have that capacity within you.`,
        `Your personal best of ${memory?.metadata.duration} minutes wasn't a fluke. That focus is still inside you.`,
        `${daysSince} days ago, you proved you can focus for ${memory?.metadata.duration} minutes. Your record is waiting to be broken.`,
      ],
      BEST_STREAK: [
        `Your ${memory?.metadata.streakDays}-day streak record still stands. You built that through consistency, not intensity. That's the path forward.`,
        `You once maintained a ${memory?.metadata.streakDays}-day streak. That discipline is still in you — time to reignite it.`,
        `The ${memory?.metadata.streakDays}-day streak you built wasn't about perfection — it was about showing up. Let's start again.`,
      ],
      FIRST_BOSS_DEFEATED: [
        `Your first boss victory against ${memory?.metadata.bossName} showed you what focused effort can accomplish. That same determination is available to you now.`,
        `Remember defeating ${memory?.metadata.bossName}? You have that power right now — it's just waiting to be used.`,
        `When you beat ${memory?.metadata.bossName}, you proved you can overcome big challenges. Another one awaits.`,
      ],
      FIRST_RIVAL_WIN: [
        `You beat ${memory?.metadata.rivalName} this week by ${memory?.metadata.margin} minutes. They don't know yet — keep the pressure on.`,
        `Your victory over ${memory?.metadata.rivalName} was earned. Hold your ground this week.`,
        `${memory?.metadata.rivalName} is watching their back now. Maintain your edge.`,
      ],
      SESSION_COUNT_MILESTONE: [
        `${milestoneSummary.totalMemories} sessions in. You're building a real habit — one session at a time.`,
        `You've completed ${milestoneSummary.totalMemories} sessions. That's not beginner luck — that's commitment.`,
        `Session ${milestoneSummary.totalMemories} awaits. Each one compounds into something bigger.`,
      ],
    },
    CHEERLEADER: {
      FIRST_S_GRADE: [
        `OMG! 🌟 You got your first S grade ${daysSince} days ago and you've been CRUSHING IT since! Keep that momentum!`,
        'Your first S grade was AMAZING! 🔥 That focus power is still inside you — use it!',
        'Remember that INCREDIBLE first S grade?! 🎉 You can absolutely do that again!',
      ],
      LONGEST_SESSION: [
        `That EPIC ${memory?.metadata.duration}-minute session?! 🔥 That was ${daysSince} days ago and you STILL got it!`,
        `Your ${memory?.metadata.duration}-minute LEGEND is still the record! 🏆 Time to beat it!`,
        `${memory?.metadata.duration} minutes of PURE FOCUS! 💪 You have that POWER right now!`,
      ],
      BEST_STREAK: [
        `Your ${memory?.metadata.streakDays}-day streak LEGEND is alive! 🏆 You built that through showing up every day!`,
        `${memory?.metadata.streakDays} days of AWESOME! 🎉 That champion spirit is still in you!`,
        `You maintained a ${memory?.metadata.streakDays}-day streak! 🔥 Time to start a new one!`,
      ],
      FIRST_BOSS_DEFEATED: [
        `Your first boss takedown of ${memory?.metadata.bossName}?! 👑 That was EPIC! You have that SAME POWER now!`,
        `Remember beating ${memory?.metadata.bossName}? 🎯 You were UNSTOPPABLE! Be that again!`,
        `${memory?.metadata.bossName} went DOWN! 💥 Another boss awaits your greatness!`,
      ],
      FIRST_RIVAL_WIN: [
        `You BEAT ${memory?.metadata.rivalName}! 🥇 They're still recovering from that LOSS!`,
        `${memory?.metadata.rivalName} didn't see you coming! 👀 Keep them guessing this week!`,
        `Your WIN over ${memory?.metadata.rivalName} was PERFECT! 🏆 Make it two in a row!`,
      ],
      SESSION_COUNT_MILESTONE: [
        `${milestoneSummary.totalMemories} sessions! 🎉 You're becoming a FOCUS MACHINE!`,
        `Look at you! ${milestoneSummary.totalMemories} sessions completed! 🌟 You're BUILDING something amazing!`,
        `Session ${milestoneSummary.totalMemories} coming up! 💪 You're on FIRE!`,
      ],
    },
    DRILL_SERGEANT: {
      FIRST_S_GRADE: [
        `You got your first S grade ${daysSince} days ago. What happened since? Complacency. You were capable of excellence then, and you're capable now. PROVE IT.`,
        'Your first S grade wasn\'t a gift. You earned it. Now earn another.',
        `${daysSince} days since your first perfect session. Pathetic. Get back to work.`,
      ],
      LONGEST_SESSION: [
        `${memory?.metadata.duration} minutes. That was your record. Set ${daysSince} days ago. Pathetic that you haven't beaten it. TODAY IS THE DAY.`,
        `Your ${memory?.metadata.duration}-minute session is still your best. Weak. Beat it now.`,
        `You've coasted for ${daysSince} days since your record. Enough. Break it today.`,
      ],
      BEST_STREAK: [
        `${memory?.metadata.streakDays} days. That was your best. You had discipline then. Where is it now? Find it. Or admit you're weak.`,
        `You once maintained ${memory?.metadata.streakDays} days. Now you make excuses. Stop.`,
        `Your ${memory?.metadata.streakDays}-day streak proves you CAN commit. So commit now.`,
      ],
      FIRST_BOSS_DEFEATED: [
        `${memory?.metadata.bossName} went down because you had FOCUS. Now you make excuses. Enough. Get back to work.`,
        `You beat ${memory?.metadata.bossName} through effort. Where's that effort now?`,
        'Your first boss victory meant something. Make the next one mean more.',
      ],
      FIRST_RIVAL_WIN: [
        `${memory?.metadata.rivalName} lost to you by ${memory?.metadata.margin} minutes. Make it ${String((Number(memory?.metadata.margin) || 0) * 2)} this week. Crush them.`,
        `You beat ${memory?.metadata.rivalName} once. Beat them again. And again.`,
        `${memory?.metadata.rivalName} is plotting revenge. Destroy their hopes.`,
      ],
      SESSION_COUNT_MILESTONE: [
        `${milestoneSummary.totalMemories} sessions. Barely a start. Most people quit at 10. Don't be most people.`,
        `Session ${milestoneSummary.totalMemories}. Big deal. Talk to me at 100.`,
        `${milestoneSummary.totalMemories} isn't a milestone — it's a warm-up. Move faster.`,
      ],
    },
  };

  // Select appropriate template set
  const styleTemplates = memoryTemplates[personaStyle] || memoryTemplates.MENTOR;
  const memoryType = (memory?.type || 'SESSION_COUNT_MILESTONE') as string;
  const templates = styleTemplates[memoryType] || styleTemplates.SESSION_COUNT_MILESTONE || [
    "You're building real momentum. Keep going.",
  ];

  // Select random template from available options
  return templates[Math.floor(Math.random() * templates.length)];
}

// ============================================================================
// Summary Generation
// ============================================================================

/**
 * Generate a performance summary for a user
 */
export async function generatePerformanceSummary(
  userId: string,
  period: 'daily' | 'weekly' | 'monthly'
): Promise<{
  period: string;
  sessionsCompleted: number;
  totalFocusTime: number;
  averageQuality: number;
  streakDays: number;
  xpEarned: number;
  coachMessage: string;
}> {
  const state = await getOrCreateCoachState(userId);
  const sessionRepository = getSessionRepository(userId);
  const stats = await sessionRepository.getSessionStats();
  const summaries = await sessionRepository.getAllSummaries();
  const averageQuality = summaries.length > 0
    ? summaries.reduce((sum, summary) => sum + summary.focusQuality, 0) / summaries.length
    : 0;
  const xpEarned = summaries.reduce((sum, item) => sum + (item.xpEarned ?? 0), 0);

  const summary = {
    period,
    sessionsCompleted: stats.completedSessions,
    totalFocusTime: stats.totalFocusTime,
    averageQuality,
    streakDays: stats.currentStreak,
    xpEarned,
    coachMessage: await generateAISummaryMessage(userId, period, {
      sessionCount: stats.completedSessions,
      totalFocusMinutes: Math.round(stats.totalFocusTime / 60),
      averageQuality,
      streakDays: stats.currentStreak,
      xpEarned,
      challengesCompleted: 0,
    }, state.currentState),
  };

  return summary;
}

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
  currentState: string
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
  } catch (error) { captureSilentFailure(error, { feature: 'ai-coach', operation: 'ui-fallback', type: 'ui' });
    return generateSummaryMessage(currentState, period);
  }

  return generateSummaryMessage(currentState, period);
}

function generateSummaryMessage(
  state: string,
  period: string
): string {
  const messages: Record<string, string[]> = {
    daily: [
      'Great work today! Every session is a step forward.',
      "You showed up today—that's what matters. Keep building!",
      "Today's focus is tomorrow's success. Well done!",
    ],
    weekly: [
      'What a week! Your consistency is paying off. 🎉',
      '7 days of effort, infinite progress. Keep it up!',
      'You crushed this week! Ready for the next one?',
    ],
    monthly: [
      "A month of dedication! You're becoming unstoppable. 🚀",
      "30 days of growth. Look how far you've come!",
      'Monthly milestone achieved! Your future self thanks you.',
    ],
  };

  const periodMessages = messages[period] || messages.daily;
  return periodMessages[Math.floor(Math.random() * periodMessages.length)];
}
