import { validateCoachInput } from '../input/input-contract';
import { validateMessageQuality } from '../message/message-quality-gate';
import { buildInputContractFromStreakData } from '../input/input-builders';
import {
  extractActionFromMessage,
  generateStreakProtectionMessage,
  generateUUID,
} from '../ai-helpers';
import { CoachSuggestionSchema, type CoachSuggestion } from '../recommendation/suggestion-schemas';

export async function handleStreakRiskIntegration(
  userId: string,
  streakData: {
    currentStreak: number;
    hoursSinceLastSession: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  },
): Promise<CoachSuggestion | null> {
  if (streakData.riskLevel === 'low') {
    return null;
  }

  const inputContract = await buildInputContractFromStreakData(
    userId,
    streakData,
  );
  const validatedInput = validateCoachInput(inputContract);
  const messageContent = await generateStreakProtectionMessage(
    validatedInput,
    streakData,
  );
  const qualityAnalysis = validateMessageQuality(
    'streak-protection',
    messageContent,
    'STREAK_RISK',
  );
  if (!qualityAnalysis.passesQualityGate) {
    return null;
  }

  return CoachSuggestionSchema.parse({
    id: generateUUID(),
    type: 'STREAK_PROTECTION',
    title: 'Protect Your Streak!',
    description: messageContent,
    priority: streakData.riskLevel === 'critical' ? 'critical' : 'high',
    suggestedAction: extractActionFromMessage(messageContent),
    confidence: qualityAnalysis.confidence,
    expiresAt:
      Date.now() +
      (streakData.hoursSinceLastSession < 12 ? 2 : 6) * 60 * 60 * 1000,
    createdAt: Date.now(),
    canBecomeMission: true,
  });
}
