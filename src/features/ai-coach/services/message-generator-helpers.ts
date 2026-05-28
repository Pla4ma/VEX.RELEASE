import type {
  MessageCategory,
  CoachMessageTemplate,
} from "../schemas";
import * as repository from "../repository";
import { withRetry } from "../utils/retry";
import type {
  GenerationConfig,
  TemplateLibrary,
} from "./message-generator-types";
import { getSafeDefault, DEFAULT_TEMPLATES } from "./message-generator-types";

// ─── Template Cache ───

const CACHE_TTL_MS = 5 * 60 * 1000;

const templateCache: TemplateLibrary = {
  templates: new Map(),
  lastUpdated: 0,
  version: "1.0.0",
};

export async function fetchTemplatesWithCache(
  personaId: string,
  category: MessageCategory,
): Promise<CoachMessageTemplate[]> {
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

// ─── Template Selection ───

export function selectBestTemplate(
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

export function checkTemplateConditions(
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

// ─── Content Generation ───

export function generateFromTemplate(
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

export function generateFromDefaults(
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

export function generateFromPersonalityTemplate(
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

export function substituteVariables(
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

export function sanitizeContent(content: string): string {
  return content.replace(/[<>]/g, "").trim();
}

// ─── Priority ───

export function calculatePriority(
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
