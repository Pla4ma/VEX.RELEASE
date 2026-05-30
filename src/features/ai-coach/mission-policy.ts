import { validateCoachInput, type CoachInputContract } from "./input-contract";
import { validateMessageQuality } from "./message-quality-gate";
import {
  createDailyMissionFromSuggestion,
  determineCoachPriority,
  extractActionFromMessage,
  extractSuggestionTitle,
  generateContextualMessage,
  generateUUID,
  trackCoachSuggestionAccepted,
  trackCoachSuggestionConversionFailed,
} from "./ai-helpers";
import { CoachSuggestionSchema, type CoachSuggestion } from "./suggestion-schemas";

export async function generateMissionSuggestion(
  userId: string,
  inputContract: CoachInputContract,
): Promise<CoachSuggestion | null> {
  const validatedInput = validateCoachInput(inputContract);
  const priority = determineCoachPriority(validatedInput);
  if (priority === "low") {
    return null;
  }

  const messageContent = await generateContextualMessage(
    validatedInput,
    priority,
  );
  const qualityAnalysis = validateMessageQuality(
    "mission-suggestion",
    messageContent,
    "SESSION_SUGGESTION",
  );
  if (!qualityAnalysis.passesQualityGate) {
    return null;
  }

  return CoachSuggestionSchema.parse({
    id: generateUUID(),
    type: "DAILY_MISSION",
    title: extractSuggestionTitle(messageContent),
    description: messageContent,
    priority,
    suggestedAction: extractActionFromMessage(messageContent),
    confidence: qualityAnalysis.confidence,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    createdAt: Date.now(),
    canBecomeMission: true,
  });
}

export async function convertSuggestionToMission(
  userId: string,
  suggestion: CoachSuggestion,
): Promise<{ missionId: string; success: boolean }> {
  if (!suggestion.canBecomeMission) {
    return { missionId: "", success: false };
  }

  try {
    const missionId = await createDailyMissionFromSuggestion(
      userId,
      suggestion,
    );
    trackCoachSuggestionAccepted(userId, suggestion.id, "mission_created");
    return { missionId, success: true };
  } catch (error) {
    trackCoachSuggestionConversionFailed(userId, suggestion.id, error);
    return { missionId: "", success: false };
  }
}
