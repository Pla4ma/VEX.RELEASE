import { captureSilentFailure } from "../../utils/silent-failure";
import * as repository from "./repository";
import { GenerateMessageInputSchema, EvaluateInterventionsInputSchema, MarkMessageActionInputSchema, type CoachMessageTemplate, type CoachMessage, type InterventionRule, type InterventionExecution, type MessageCategory, type TriggerType, type DeliveryMethod, type GenerateMessageInput, type EvaluateInterventionsInput, type MarkMessageActionInput } from "./schemas";
import { getOrCreateCoachState, updateCoachState } from "./persona-manager";
import { generateCoachMessage, generateSessionSummary } from "../../shared/ai/edge-function-service";
import { getSessionRepository } from "../../session/repository/SessionRepository";
import { getRelevantMemories, generateMemoryReferenceMessage, type MemoryType, getMilestoneSummary } from "./CoachMemory";
import { validateMessageQuality, type MessageQualityAnalysis, MessageQualityElements } from "../../../src/features/ai-coach/message-quality-gate";


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
    const qualityAnalysis = validateMessageQuality('ai-msg', aiContent, validated.category);
    if (qualityAnalysis.passesQualityGate) {
      return createMessageFromTemplate(validated, state.personaId, aiContent);
    }
    const fallback = generateQualityFallback(validated, qualityAnalysis);
    return createMessageFromTemplate(validated, state.personaId, fallback);
  }

  // Fetch templates
  const templates = await repository.fetchMessageTemplates(state.personaId, validated.category);

  // Filter by conditions
  const matchingTemplates = templates.filter((template) => checkConditions(template.conditions, validated.context));

  if (matchingTemplates.length === 0) {
    // Use default templates if no matches
    const defaultContent = getDefaultTemplate(validated.category, validated.context);
    if (!defaultContent) {
      return null;
    }

    const qualityAnalysis = validateMessageQuality('default-msg', defaultContent, validated.category);
    if (!qualityAnalysis.passesQualityGate) {
      const fallback = generateQualityFallback(validated, qualityAnalysis);
      return createMessageFromTemplate(validated, state.personaId, fallback);
    }

    return createMessageFromTemplate(validated, state.personaId, defaultContent);
  }

  // Select best template (highest priority, then random for same priority)
  const bestTemplate = matchingTemplates[0];
  const content = selectVariation(bestTemplate);

  const templateQualityAnalysis = validateMessageQuality('template-msg', content, validated.category);
  if (!templateQualityAnalysis.passesQualityGate) {
    const fallback = generateQualityFallback(validated, templateQualityAnalysis);
    return createMessageFromTemplate(validated, state.personaId, fallback);
  }

  return createMessageFromTemplate(validated, state.personaId, content, bestTemplate.priority);
}

export async function evaluateInterventions(input: EvaluateInterventionsInput): Promise<InterventionExecution[]> {
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
    const recentlyTriggered = await repository.wasRuleTriggeredRecently(validated.userId, rule.id, rule.cooldownHours);

    if (recentlyTriggered) {
      continue;
    }

    // Check daily limit for this rule type
    const todaysExecutions = await repository.fetchTodaysInterventionExecutions(validated.userId);
    const ruleExecutionsToday = todaysExecutions.filter((e) => e.ruleId === rule.id).length;

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

export async function markMessageAction(input: MarkMessageActionInput): Promise<CoachMessage> {
  const validated = MarkMessageActionInputSchema.parse(input);

  const message = await repository.markMessageAction(validated.messageId, validated.action, Date.now());

  // Track effectiveness
  await trackEffectiveness(message, validated.action, validated.metadata);

  return message;
}

export async function generateMemoryAwareMessage(userId: string, category: MessageCategory, personaId: string, baseContext: Record<string, unknown>): Promise<string | null> {
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
  const daysSince = memory ? Math.floor((Date.now() - memory.occurredAt) / (1000 * 60 * 60 * 24)) : 0;

  // Template library with 20+ memory-aware messages
  const memoryTemplates: Record<string, Record<string, string[]>> = {
    MENTOR: {
      FIRST_S_GRADE: [`You hit your first S grade ${daysSince} days ago — that means ${memory?.metadata.duration || 'focused'} minutes of pure focus. You're capable of that excellence again.`, "Remember your first S grade? That wasn't luck — that was skill. You have it in you to do it again.", "Your first perfect session showed you what's possible. Time to show yourself again."],
      LONGEST_SESSION: [`Remember when you completed that ${memory?.metadata.duration}-minute session? That was a breakthrough. You have that capacity within you.`, `Your personal best of ${memory?.metadata.duration} minutes wasn't a fluke. That focus is still inside you.`, `${daysSince} days ago, you proved you can focus for ${memory?.metadata.duration} minutes. Your record is waiting to be broken.`],
      BEST_STREAK: [`Your ${memory?.metadata.streakDays}-day streak record still stands. You built that through consistency, not intensity. That's the path forward.`, `You once maintained a ${memory?.metadata.streakDays}-day streak. That discipline is still in you — time to reignite it.`, `The ${memory?.metadata.streakDays}-day streak you built wasn't about perfection — it was about showing up. Let's start again.`],
      FIRST_BOSS_DEFEATED: [`Your first boss victory against ${memory?.metadata.bossName} showed you what focused effort can accomplish. That same determination is available to you now.`, `Remember defeating ${memory?.metadata.bossName}? You have that power right now — it's just waiting to be used.`, `When you beat ${memory?.metadata.bossName}, you proved you can overcome big challenges. Another one awaits.`],
      FIRST_RIVAL_WIN: [`You beat ${memory?.metadata.rivalName} this week by ${memory?.metadata.margin} minutes. They don't know yet — keep the pressure on.`, `Your victory over ${memory?.metadata.rivalName} was earned. Hold your ground this week.`, `${memory?.metadata.rivalName} is watching their back now. Maintain your edge.`],
      SESSION_COUNT_MILESTONE: [`${milestoneSummary.totalMemories} sessions in. You're building a real habit — one session at a time.`, `You've completed ${milestoneSummary.totalMemories} sessions. That's not beginner luck — that's commitment.`, `Session ${milestoneSummary.totalMemories} awaits. Each one compounds into something bigger.`],
    },
    CHEERLEADER: {
      FIRST_S_GRADE: [`OMG! 🌟 You got your first S grade ${daysSince} days ago and you've been CRUSHING IT since! Keep that momentum!`, 'Your first S grade was AMAZING! 🔥 That focus power is still inside you — use it!', 'Remember that INCREDIBLE first S grade?! 🎉 You can absolutely do that again!'],
      LONGEST_SESSION: [`That EPIC ${memory?.metadata.duration}-minute session?! 🔥 That was ${daysSince} days ago and you STILL got it!`, `Your ${memory?.metadata.duration}-minute LEGEND is still the record! 🏆 Time to beat it!`, `${memory?.metadata.duration} minutes of PURE FOCUS! 💪 You have that POWER right now!`],
      BEST_STREAK: [`Your ${memory?.metadata.streakDays}-day streak LEGEND is alive! 🏆 You built that through showing up every day!`, `${memory?.metadata.streakDays} days of AWESOME! 🎉 That champion spirit is still in you!`, `You maintained a ${memory?.metadata.streakDays}-day streak! 🔥 Time to start a new one!`],
      FIRST_BOSS_DEFEATED: [`Your first boss takedown of ${memory?.metadata.bossName}?! 👑 That was EPIC! You have that SAME POWER now!`, `Remember beating ${memory?.metadata.bossName}? 🎯 You were UNSTOPPABLE! Be that again!`, `${memory?.metadata.bossName} went DOWN! 💥 Another boss awaits your greatness!`],
      FIRST_RIVAL_WIN: [`You BEAT ${memory?.metadata.rivalName}! 🥇 They're still recovering from that LOSS!`, `${memory?.metadata.rivalName} didn't see you coming! 👀 Keep them guessing this week!`, `Your WIN over ${memory?.metadata.rivalName} was PERFECT! 🏆 Make it two in a row!`],
      SESSION_COUNT_MILESTONE: [`${milestoneSummary.totalMemories} sessions! 🎉 You're becoming a FOCUS MACHINE!`, `Look at you! ${milestoneSummary.totalMemories} sessions completed! 🌟 You're BUILDING something amazing!`, `Session ${milestoneSummary.totalMemories} coming up! 💪 You're on FIRE!`],
    },
    DRILL_SERGEANT: {
      FIRST_S_GRADE: [`You got your first S grade ${daysSince} days ago. What happened since? Complacency. You were capable of excellence then, and you're capable now. PROVE IT.`, "Your first S grade wasn't a gift. You earned it. Now earn another.", `${daysSince} days since your first perfect session. Pathetic. Get back to work.`],
      LONGEST_SESSION: [`${memory?.metadata.duration} minutes. That was your record. Set ${daysSince} days ago. Pathetic that you haven't beaten it. TODAY IS THE DAY.`, `Your ${memory?.metadata.duration}-minute session is still your best. Weak. Beat it now.`, `You've coasted for ${daysSince} days since your record. Enough. Break it today.`],
      BEST_STREAK: [`${memory?.metadata.streakDays} days. That was your best. You had discipline then. Where is it now? Find it. Or admit you're weak.`, `You once maintained ${memory?.metadata.streakDays} days. Now you make excuses. Stop.`, `Your ${memory?.metadata.streakDays}-day streak proves you CAN commit. So commit now.`],
      FIRST_BOSS_DEFEATED: [`${memory?.metadata.bossName} went down because you had FOCUS. Now you make excuses. Enough. Get back to work.`, `You beat ${memory?.metadata.bossName} through effort. Where's that effort now?`, 'Your first boss victory meant something. Make the next one mean more.'],
      FIRST_RIVAL_WIN: [`${memory?.metadata.rivalName} lost to you by ${memory?.metadata.margin} minutes. Make it ${String((Number(memory?.metadata.margin) || 0) * 2)} this week. Crush them.`, `You beat ${memory?.metadata.rivalName} once. Beat them again. And again.`, `${memory?.metadata.rivalName} is plotting revenge. Destroy their hopes.`],
      SESSION_COUNT_MILESTONE: [`${milestoneSummary.totalMemories} sessions. Barely a start. Most people quit at 10. Don't be most people.`, `Session ${milestoneSummary.totalMemories}. Big deal. Talk to me at 100.`, `${milestoneSummary.totalMemories} isn't a milestone — it's a warm-up. Move faster.`],
    },
  };

  // Select appropriate template set
  const styleTemplates = memoryTemplates[personaStyle] || memoryTemplates.MENTOR;
  const memoryType = (memory?.type || 'SESSION_COUNT_MILESTONE') as string;
  const templates = styleTemplates[memoryType] || styleTemplates.SESSION_COUNT_MILESTONE || ["You're building real momentum. Trust the process."];

  // Select random template from available options
  return templates[Math.floor(Math.random() * templates.length)];
}