import { captureSilentFailure } from '../../utils/silent-failure';
import { generateCoachMessage } from '../../shared/ai/edge-function-service';
import {
  MessageQualityElements,
  type MessageQualityAnalysis,
} from '../../../src/features/ai-coach/message-quality-gate';
import type { GenerateMessageInput } from './schemas';

export function readNumericContext(
  context: Record<string, unknown>,
  ...keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = context[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
}

export async function generateAIBackedMessage(
  input: GenerateMessageInput,
): Promise<string | null> {
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
  } catch (error) {
    captureSilentFailure(error, { feature: 'ai-coach', operation: 'ui-fallback', type: 'ui' });
    return null;
  }
  return null;
}

export function generateQualityFallback(
  input: GenerateMessageInput,
  analysis: MessageQualityAnalysis,
): string {
  const streak = readNumericContext(input.context, 'currentStreak', 'streakDays') ?? 3;
  const hoursSince = readNumericContext(input.context, 'hoursSinceLastSession') ?? 12;
  const elements = analysis.qualityElements;
  let fallback = '';

  if (!elements.includes(MessageQualityElements.OBSERVED_BEHAVIOR)) {
    fallback += `Your ${streak}-day streak data shows you've been consistent. `;
  }
  if (!elements.includes(MessageQualityElements.SPECIFIC_RECOMMENDATION)) {
    fallback += 'Based on your patterns, a 25-minute focus session now would be optimal. ';
  }
  if (!elements.includes(MessageQualityElements.TIMING_SUGGESTION)) {
    fallback +=
      hoursSince > 24
        ? 'Tonight is the best time to act based on your history. '
        : 'Your focus data suggests right now is your optimal window. ';
  }
  if (!elements.includes(MessageQualityElements.REASON)) {
    fallback += 'This will help protect your streak and maintain your momentum. ';
  }
  if (!elements.includes(MessageQualityElements.NEXT_ACTION)) {
    fallback += 'Start a session now to see immediate progress. ';
  }
  if (!elements.includes(MessageQualityElements.CONFIDENCE_LEVEL)) {
    fallback +=
      "Based on your session history, there's a 85% chance this will improve your performance.";
  }
  return fallback.trim();
}
