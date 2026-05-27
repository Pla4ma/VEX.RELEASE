import {
  MessageQualityAnalysisSchema,
  MessageQualityElements,
  type MessageQualityAnalysis,
} from "./message-quality-schema";
import {
  calculateQualityConfidence,
  detectGenericPatterns,
  detectQualityElements,
  determineSuggestedAction,
} from "./message-quality-scoring";
import { v4 } from "../../utils/uuid";

export {
  MessageQualityAnalysisSchema,
  MessageQualityElements,
  MessageQualityElementValues,
  type MessageQualityAnalysis,
  type MessageQualityElement,
} from "./message-quality-schema";
export {
  APPROVED_MESSAGE_EXAMPLES,
  REJECTED_MESSAGE_EXAMPLES,
} from "./message-quality-examples";

export function validateMessageQuality(
  messageId: string,
  content: string,
  category: string,
): MessageQualityAnalysis {
  const normalizedContent =
    content.length > 1000 ? content.slice(0, 1000) : content;
  const genericAnalysis = detectGenericPatterns(normalizedContent);
  const qualityElements = detectQualityElements(normalizedContent);
  const passesQualityGate =
    !genericAnalysis.isGeneric && qualityElements.length >= 2;
  const confidence = calculateQualityConfidence(
    genericAnalysis.isGeneric,
    qualityElements.length,
    normalizedContent.length,
  );
  const suggestedAction = determineSuggestedAction(
    genericAnalysis.isGeneric,
    qualityElements.length,
    confidence,
  );

  return MessageQualityAnalysisSchema.parse({
    messageId,
    content: normalizedContent,
    category,
    qualityElements,
    isGeneric: genericAnalysis.isGeneric,
    genericReasons: genericAnalysis.reasons,
    passesQualityGate,
    confidence,
    suggestedAction,
  });
}

export function createMockQualityAnalysis(
  overrides: Partial<MessageQualityAnalysis> = {},
): MessageQualityAnalysis {
  return MessageQualityAnalysisSchema.parse({
    messageId: generateMockUUID(),
    content:
      "Your strongest sessions this week started after 8 PM. Try a 25-minute Recovery session tonight.",
    category: "STREAK_RISK",
    qualityElements: [
      MessageQualityElements.REASON,
      MessageQualityElements.CONFIDENCE_LEVEL,
      MessageQualityElements.OBSERVED_BEHAVIOR,
    ],
    isGeneric: false,
    genericReasons: [],
    passesQualityGate: true,
    confidence: 0.85,
    suggestedAction: "approve",
    ...overrides,
  });
}

export function batchValidateMessages(
  messages: Array<{ id: string; content: string; category: string }>,
): MessageQualityAnalysis[] {
  return messages.map((message) =>
    validateMessageQuality(message.id, message.content, message.category),
  );
}

function generateMockUUID(): string {
  return v4();
}
