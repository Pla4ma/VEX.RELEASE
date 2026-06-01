import * as repository from './repository';
import {
  GenerateMessageInputSchema,
  MarkMessageActionInputSchema,
  type CoachMessage,
  type CoachMessageTemplate,
  type GenerateMessageInput,
  type MarkMessageActionInput,
} from './schemas';
import { getOrCreateCoachState } from './persona-manager';
import { validateMessageQuality } from './message-quality-gate';
import {
  generateAIBackedMessage,
  generateQualityFallback,
} from './message-ai-backend';
import { getDefaultTemplate } from './default-message-templates';
export { generateMemoryAwareMessage } from './memory-message-templates';

export { evaluateInterventions } from './intervention-evaluator';
export { generatePerformanceSummary } from './performance-summary';

export async function generateMessage(
  input: GenerateMessageInput,
): Promise<CoachMessage | null> {
  const validated = GenerateMessageInputSchema.parse(input);
  const state = await getOrCreateCoachState(validated.userId);

  if (isCategoryMuted(state, validated.category)) {
    return null;
  }
  if (state.muteUntil && state.muteUntil > Date.now()) {
    return null;
  }

  const aiContent = await generateAIBackedMessage(validated);

  if (aiContent) {
    const qualityAnalysis = validateMessageQuality(
      'ai-msg',
      aiContent,
      validated.category,
    );
    if (qualityAnalysis.passesQualityGate) {
      return createMessageFromTemplate(validated, state.personaId, aiContent);
    }
    const fallback = generateQualityFallback(validated, qualityAnalysis);
    return createMessageFromTemplate(validated, state.personaId, fallback);
  }

  const templates = await repository.fetchMessageTemplates(
    state.personaId,
    validated.category,
  );
  const matchingTemplates = templates.filter((template) =>
    checkConditions(template.conditions, validated.context),
  );

  const bestTemplate = matchingTemplates[0];
  if (bestTemplate) {
    const content = selectVariation(bestTemplate);
    const templateQualityAnalysis = validateMessageQuality(
      'template-msg',
      content,
      validated.category,
    );
    if (!templateQualityAnalysis.passesQualityGate) {
      const fallback = generateQualityFallback(
        validated,
        templateQualityAnalysis,
      );
      return createMessageFromTemplate(validated, state.personaId, fallback);
    }
    return createMessageFromTemplate(
      validated,
      state.personaId,
      content,
      bestTemplate.priority,
    );
  }

  const defaultContent = getDefaultTemplate(
    validated.category,
    validated.context,
  );
  if (!defaultContent) {
    return null;
  }
  const defaultQualityAnalysis = validateMessageQuality(
    'default-msg',
    defaultContent,
    validated.category,
  );
  if (!defaultQualityAnalysis.passesQualityGate) {
    const fallback = generateQualityFallback(validated, defaultQualityAnalysis);
    return createMessageFromTemplate(validated, state.personaId, fallback);
  }
  return createMessageFromTemplate(validated, state.personaId, defaultContent);
}

function isCategoryMuted(
  _state: { muteUntil: number | null },
  _category: string,
): boolean {
  return false;
}

export function checkConditions(
  conditions: Array<{
    type?: string;
    operator: string;
    value?: unknown;
    field?: string;
  }>,
  context: Record<string, unknown>,
): boolean {
  return conditions.every((condition) => {
    const key = condition.type ?? condition.field;
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
        return (
          Array.isArray(condition.value) &&
          condition.value.includes(contextValue)
        );
      default:
        return false;
    }
  });
}

function selectVariation(template: CoachMessageTemplate): string {
  const allVariations = [template.content, ...template.variations];
  const result =
    allVariations[Math.floor(Math.random() * allVariations.length)];
  return result ?? template.content;
}

function createMessageFromTemplate(
  input: GenerateMessageInput,
  personaId: string,
  content: string,
  priority: number = 5,
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

export async function markMessageAction(
  input: MarkMessageActionInput,
): Promise<CoachMessage> {
  const validated = MarkMessageActionInputSchema.parse(input);
  const message = await repository.markMessageAction(
    validated.messageId,
    validated.action,
    Date.now(),
  );
  await trackEffectiveness(message, validated.action, validated.metadata);
  return message;
}

async function trackEffectiveness(
  message: CoachMessage,
  _action: string,
  _metadata?: Record<string, unknown>,
): Promise<void> {
  message;
}
