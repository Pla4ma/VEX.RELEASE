import {
  type CoachMessage,
  type CoachMessageTemplate,
  type MessageCategory,
  type DeliveryMethod,
  type CoachState,
  CoachMessageSchema,
} from "../schemas";
import * as repository from "../repository";
import { withRetry } from "../utils/retry";
import { v4 } from "../../../utils/uuid";
import {
  getPersonalityTemplates,
  type CoachStyle,
} from "./personality-templates";
interface GenerationConfig {
  maxTemplateAttempts: number;
  variableValidationEnabled: boolean;
  contentSanitizationEnabled: boolean;
  maxContentLength: number;
  minContentLength: number;
}
const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  maxTemplateAttempts: 3,
  variableValidationEnabled: true,
  contentSanitizationEnabled: true,
  maxContentLength: 1000,
  minContentLength: 10,
};
interface TemplateLibrary {
  templates: Map<MessageCategory, CoachMessageTemplate[]>;
  lastUpdated: number;
  version: string;
}
const templateCache: TemplateLibrary = {
  templates: new Map(),
  lastUpdated: 0,
  version: "1.0.0",
};
const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_TEMPLATES: Record<MessageCategory, string[]> = {
  STREAK_RISK: [
    "🔥 Your {{currentStreak}}-day streak is at risk! {{hoursRemaining}} hours left to save it with a quick {{suggestedDuration}}-minute session.",
    "Don't let your streak slip! ⚡ Just {{suggestedDuration}} minutes today keeps your {{currentStreak}}-day streak alive.",
    "Streak emergency! 🚨 {{hoursRemaining}} hours remaining. One short session saves everything you've built!",
  ],
  SESSION_SUGGESTION: [
    "🎯 Perfect time for focus! Based on your patterns, a {{suggestedDuration}}-minute {{difficulty}} session would be ideal right now.",
    "Your optimal focus window is open! You've crushed {{similarPastSessions}} sessions like this before.",
    "Ready to build momentum? {{encouragement}} A quick {{suggestedDuration}}-minute session fits perfectly in your schedule.",
  ],
  MILESTONE_HYPE: [
    "🎉 INCREDIBLE! {{milestoneDays}} days of pure dedication! You're in the top {{percentile}}% of focused performers!",
    "LEGENDARY STATUS! 🔥 {{milestoneDays}} days strong! Your consistency is absolutely inspiring!",
    "MILESTONE CRUSHED! 🏆 {{milestoneDays}} days proves your unstoppable commitment to growth!",
  ],
  COMEBACK_SUPPORT: [
    "💪 Welcome back! Every master was once a beginner who returned. Your comeback starts now with {{bonusMultiplier}}x XP!",
    "The streak may have paused, but your journey continues! 🌱 Day {{comebackDay}} of your comeback - you've got this!",
    "Stronger than before! 🔥 Your previous {{previousStreak}}-day streak shows you have what it takes. Let's rebuild!",
  ],
  POST_FAILURE: [
    "That session was tough, but here's what matters: you showed up. 🌱 Growth happens in challenges.",
    "Every expert faced setbacks. Yours just made you more resilient. 💪 Ready when you are!",
    "Focus is a skill, and skills develop through practice - including the challenging sessions. 🎯",
  ],
  PROGRESS_REMINDER: [
    "You're {{percentToNextLevel}}% to Level {{nextLevel}}! 🎯 One more quality session could push you over the edge!",
    "Your progress is adding up beautifully! {{totalXp}} XP earned. Keep this momentum! 📈",
    "Level {{currentLevel}} looks great on you! Ready to unlock Level {{nextLevel}}? You're closer than you think!",
  ],
  DIFFICULTY_ADJUST: [
    "Noticing your recent sessions? 🧠 Let's {{adjustmentDirection}} the challenge to match your current flow state.",
    "Smart adaptation is key to growth. Your patterns suggest a {{adjustmentDirection}} would optimize your focus.",
    "You've been {{performanceTrend}}. A difficulty {{adjustmentDirection}} might be exactly what you need right now.",
  ],
  CHALLENGE_PROMPT: [
    "🎮 Challenge alert! {{challengeName}} expires in {{hoursLeft}} hours. You're {{progressPercent}}% there - finish strong!",
    "Don't leave rewards on the table! {{challengeProgress}}% done - one focused session could complete it! 💎",
    "Your challenge is calling! 📢 {{hoursLeft}} hours left. You've got the skills - time to use them!",
  ],
  MOTIVATION_BOOST: [
    "You're capable of incredible focus. Today's session is tomorrow's achievement. ✨ Believe in your progress!",
    "Small steps compound into extraordinary results. Every session you're building something great! 📈",
    "Your future self is watching and thanking you for showing up today. 🙏 Keep building those habits!",
  ],
  BREAK_SUGGESTION: [
    "You've been crushing it! 🧘 Your focus quality may benefit from a short reset. Step away, breathe, return stronger.",
    "Quality over quantity champion! A mindful break now means sharper focus when you return. 🌊",
    "Your brain has been working hard. Give it 5 minutes of rest - you'll come back even stronger! 💪",
  ],
  OVERLOAD_WARNING: [
    "Whoa, that's {{sessionCount}} sessions today! 🔥 Impressive dedication, but remember: sustainable progress beats burnout.",
    "You're pushing hard today! 🎯 Consider pacing - your best work comes from consistent energy, not depletion.",
    "Amazing commitment, but your focus quality may drop. 🌊 Balance intensity with recovery for long-term growth.",
  ],
};
export async function generateMessage(params: {
  userId: string;
  category: MessageCategory;
  context: Record<string, unknown>;
  preferredDelivery: DeliveryMethod;
  config?: Partial<GenerationConfig>;
}): Promise<CoachMessage | null> {
  const config = { ...DEFAULT_GENERATION_CONFIG, ...params.config };
  try {
    const coachState = await withRetry(
      () => repository.fetchCoachState(params.userId),
      { maxAttempts: 2 },
      "fetch-coach-state",
    );
    if (await isCategoryMuted(params.category, coachState, params.userId)) {
      return null;
    }
    if (isGloballyMuted(coachState)) {
      return null;
    }
    const templates = await fetchTemplatesWithCache(
      coachState?.personaId || "00000000-0000-4000-a000-000000000001",
      params.category,
    );
    const personalityStyle = (coachState?.personaId as CoachStyle) || "FRIEND";
    const personalityTemplates = getPersonalityTemplates(
      personalityStyle,
      params.category,
    );
    const selectedTemplate = selectBestTemplate(
      templates,
      params.context,
      config.maxTemplateAttempts,
    );
    let content: string;
    if (personalityTemplates.length > 0) {
      content = generateFromPersonalityTemplate(
        personalityTemplates,
        params.context,
        config,
      );
    } else if (selectedTemplate) {
      content = generateFromTemplate(selectedTemplate, params.context, config);
    } else {
      content = generateFromDefaults(params.category, params.context);
    }
    const validation = validateContent(content, config);
    if (!validation.valid) {
      content = getSafeDefault(params.category);
    }
    const message: CoachMessage = {
      id: generateMessageId(),
      userId: params.userId,
      personaId:
        coachState?.personaId || "00000000-0000-4000-a000-000000000001",
      category: params.category,
      content,
      deliveryMethod: params.preferredDelivery,
      priority: calculatePriority(params.category, params.context),
      status: "DRAFT",
      createdAt: Date.now(),
      scheduledFor: null,
      deliveredAt: null,
      readAt: null,
      dismissedAt: null,
      actionTaken: null,
      actionTakenAt: null,
    };
    return CoachMessageSchema.parse(message);
  } catch (error) {
    logGenerationError(params.userId, params.category, error);
    return null;
  }
}
async function fetchTemplatesWithCache(
  personaId: string,
  category: MessageCategory,
): Promise<CoachMessageTemplate[]> {
  const cacheKey = `${personaId}_${category}`;
  const now = Date.now();
  if (
    templateCache.templates.has(category) &&
    now - templateCache.lastUpdated < CACHE_TTL_MS
  ) {
    return templateCache.templates.get(category) || [];
  }
  const templates = await withRetry(
    () => repository.fetchMessageTemplates(personaId, category),
    { maxAttempts: 2 },
    "fetch-templates",
  );
  templateCache.templates.set(category, templates);
  templateCache.lastUpdated = now;
  return templates;
}
function selectBestTemplate(
  templates: CoachMessageTemplate[],
  context: Record<string, unknown>,
  maxAttempts: number,
): CoachMessageTemplate | null {
  if (templates.length === 0) {
    return null;
  }
  const sorted = [...templates].sort((a, b) => b.priority - a.priority);
  for (let i = 0; i < Math.min(maxAttempts, sorted.length); i++) {
    const template = sorted[i]!;
    if (checkTemplateConditions(template, context)) {
      return template;
    }
  }
  return sorted[0]!;
}
function checkTemplateConditions(
  template: CoachMessageTemplate,
  context: Record<string, unknown>,
): boolean {
  if (!template.conditions || template.conditions.length === 0) {
    return true;
  }
  return template.conditions.every((condition) => {
    const contextValue = context[condition.type];
    if (contextValue === undefined) {
      return false;
    }
    switch (condition.operator) {
      case "eq":
        return contextValue === condition.value;
      case "gt":
        return Number(contextValue) > Number(condition.value);
      case "lt":
        return Number(contextValue) < Number(condition.value);
      case "gte":
        return Number(contextValue) >= Number(condition.value);
      case "lte":
        return Number(contextValue) <= Number(condition.value);
      case "in":
        return (
          Array.isArray(condition.value) &&
          condition.value.includes(contextValue)
        );
      default:
        return false;
    }
  });
}
function generateFromTemplate(
  template: CoachMessageTemplate,
  context: Record<string, unknown>,
  config: GenerationConfig,
): string {
  const allVariations = [template.content, ...(template.variations || [])];
  const selectedContent =
    allVariations[Math.floor(Math.random() * allVariations.length)]!;
  let content = substituteVariables(selectedContent, context);
  if (config.contentSanitizationEnabled) {
    content = sanitizeContent(content);
  }
  return content;
}
function generateFromDefaults(
  category: MessageCategory,
  context: Record<string, unknown>,
): string {
  const templates = DEFAULT_TEMPLATES[category];
  if (!templates || templates.length === 0) {
    return getSafeDefault(category);
  }
  const template = templates[Math.floor(Math.random() * templates.length)]!;
  return substituteVariables(template, context);
}
function generateFromPersonalityTemplate(
  templates: string[],
  context: Record<string, unknown>,
  config: GenerationConfig,
): string {
  if (!templates || templates.length === 0) {
    return getSafeDefault("SESSION_SUGGESTION");
  }
  const selectedTemplate =
    templates[Math.floor(Math.random() * templates.length)]!;
  let content = substituteVariables(selectedTemplate, context);
  if (config.contentSanitizationEnabled) {
    content = sanitizeContent(content);
  }
  return content;
}
function substituteVariables(
  template: string,
  context: Record<string, unknown>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = context[key];
    if (value === undefined || value === null) {
      return match;
    }
    return String(value);
  });
}
function sanitizeContent(content: string): string {
  return content.replace(/[<>]/g, "").trim();
}
interface ValidationResult {
  valid: boolean;
  errors: string[];
}
function validateContent(
  content: string,
  config: GenerationConfig,
): ValidationResult {
  const errors: string[] = [];
  if (content.length < config.minContentLength) {
    errors.push(
      `Content too short: ${content.length} < ${config.minContentLength}`,
    );
  }
  if (content.length > config.maxContentLength) {
    errors.push(
      `Content too long: ${content.length} > ${config.maxContentLength}`,
    );
  }
  const forbiddenPatterns = [
    /\b(hate|stupid|idiot|kill)\b/i,
    /<script/i,
    /javascript:/i,
  ];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      errors.push("Content contains forbidden patterns");
      break;
    }
  }
  if (/\{\{\w+\}\}/.test(content)) {
    errors.push("Content contains unsubstituted variables");
  }
  return { valid: errors.length === 0, errors };
}
function calculatePriority(
  category: MessageCategory,
  context: Record<string, unknown>,
): number {
  const basePriorities: Record<MessageCategory, number> = {
    STREAK_RISK: 10,
    SESSION_SUGGESTION: 7,
    MILESTONE_HYPE: 9,
    COMEBACK_SUPPORT: 8,
    POST_FAILURE: 6,
    PROGRESS_REMINDER: 5,
    DIFFICULTY_ADJUST: 4,
    CHALLENGE_PROMPT: 7,
    MOTIVATION_BOOST: 3,
    BREAK_SUGGESTION: 4,
    OVERLOAD_WARNING: 6,
  };
  let priority = basePriorities[category] || 5;
  if (context.urgency === "high") {
    priority += 2;
  }
  if (context.urgency === "critical") {
    priority += 3;
  }
  if (context.riskLevel === "CRITICAL") {
    priority += 2;
  }
  return Math.min(10, priority);
}
async function isCategoryMuted(
  category: MessageCategory,
  coachState: CoachState | null,
  userId: string,
): Promise<boolean> {
  if (!coachState) {
    return false;
  }
  if (coachState.muteUntil && coachState.muteUntil > Date.now()) {
    return true;
  }
  const history = await withRetry(
    () => repository.fetchCoachHistory(userId, 100),
    { maxAttempts: 2 },
    "fetch-history",
  );
  return history.mutedCategories.includes(category);
}
function isGloballyMuted(coachState: CoachState | null): boolean {
  if (!coachState) {
    return false;
  }
  return !!(coachState.muteUntil && coachState.muteUntil > Date.now());
}
function generateMessageId(): string {
  return v4();
}
function getSafeDefault(category: MessageCategory): string {
  const safeDefaults: Record<MessageCategory, string> = {
    STREAK_RISK: "🔥 Your streak is at risk! Quick session needed to save it.",
    SESSION_SUGGESTION: "🎯 Perfect time for a focus session!",
    MILESTONE_HYPE: "🎉 Amazing progress! Keep it up!",
    COMEBACK_SUPPORT: "💪 You're doing great! Every session counts.",
    POST_FAILURE: "That was tough, but you showed up. That's what matters!",
    PROGRESS_REMINDER: "You're making great progress! Keep going!",
    DIFFICULTY_ADJUST: "Let's adjust to find your optimal challenge level.",
    CHALLENGE_PROMPT: "🎮 Don't miss out on that challenge reward!",
    MOTIVATION_BOOST: "You've got this! Believe in your progress!",
    BREAK_SUGGESTION: "🧘 Take a moment to recharge. You've earned it!",
    OVERLOAD_WARNING:
      "🔥 Impressive dedication! Consider pacing for sustainability.",
  };
  return safeDefaults[category] || "Keep up the great work!";
}
function logGenerationError(
  userId: string,
  category: MessageCategory,
  error: unknown,
): void {}
