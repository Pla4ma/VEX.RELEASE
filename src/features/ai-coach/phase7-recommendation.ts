import { validateCoachInput, type CoachInputContract } from "./input-contract";
import { validateMessageQuality } from "./message-quality-gate";
import {
  analyzeSessionPatterns,
  generateRecommendationMessage,
  generateUUID,
} from "./phase7-helpers";
import { CoachSuggestionSchema, type CoachSuggestion } from "./phase7-schemas";

export async function generateSessionRecommendation(
  userId: string,
  inputContract: CoachInputContract,
): Promise<CoachSuggestion | null> {
  const validatedInput = validateCoachInput({
    ...inputContract,
    recentSessionGrades: inputContract.recentSessionGrades.map((session) => ({
      ...session,
      sessionId: normalizeUUID(session.sessionId),
    })),
  });
  const recommendation = await analyzeSessionPatterns(validatedInput);
  if (!recommendation) {
    return null;
  }

  const messageContent = await generateRecommendationMessage(recommendation);
  const qualityAnalysis = validateMessageQuality(
    "session-recommendation",
    messageContent,
    "SESSION_SUGGESTION",
  );
  if (!qualityAnalysis.passesQualityGate) {
    return null;
  }

  return CoachSuggestionSchema.parse({
    id: generateUUID(),
    type: "SESSION_RECOMMENDATION",
    title: `${recommendation.duration}min ${recommendation.difficulty} Session`,
    description: messageContent,
    priority: recommendation.priority,
    suggestedAction: `Start ${recommendation.duration}min ${recommendation.difficulty} session`,
    confidence: qualityAnalysis.confidence,
    expiresAt: Date.now() + 6 * 60 * 60 * 1000,
    createdAt: Date.now(),
    canBecomeMission: false,
  });
}

function normalizeUUID(value: string): string {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
    ? value
    : generateUUID();
}
