import {
  type CoachMessage,
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
import type { GenerationConfig } from "./message-generator-types";
import { DEFAULT_GENERATION_CONFIG, getSafeDefault } from "./message-generator-types";
import {
  fetchTemplatesWithCache,
  selectBestTemplate,
  generateFromTemplate,
  generateFromDefaults,
  generateFromPersonalityTemplate,
  calculatePriority,
} from "./message-generator-helpers";

// ─── Main Generator ───

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

// ─── Validation ───

function validateContent(
  content: string,
  config: GenerationConfig,
): { valid: boolean; errors: string[] } {
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

// ─── Mute Logic ───

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

// ─── Utilities ───

function generateMessageId(): string {
  return v4();
}

function logGenerationError(
  userId: string,
  category: MessageCategory,
  error: unknown,
): void {}
