import { z } from 'zod';

export enum MessageQualityElements {
  Clarity = 'clarity',
  Personalization = 'personalization',
  Actionability = 'actionability',
  OBSERVED_BEHAVIOR = 'observed_behavior',
  SPECIFIC_RECOMMENDATION = 'specific_recommendation',
  TIMING_SUGGESTION = 'timing_suggestion',
  REASON = 'reason',
  NEXT_ACTION = 'next_action',
  CONFIDENCE_LEVEL = 'confidence_level',
}

export type MessageQualityAnalysis = {
  issues: string[];
  passesQualityGate: boolean;
  qualityElements: MessageQualityElements[];
  score: number;
};

const InputSchema = z.object({
  category: z.string().min(1),
  content: z.string().min(1),
  id: z.string().min(1),
});

export function validateMessageQuality(
  id: string,
  content: string,
  category: string,
): MessageQualityAnalysis {
  InputSchema.parse({ category, content, id });
  const issues: string[] = [];
  if (content.trim().length < 18) {
    issues.push('Message too short');
  }
  if (!/[.!?]$/.test(content.trim())) {
    issues.push('Missing sentence ending');
  }
  const score = Math.max(0, 100 - issues.length * 25);
  return {
    issues,
    passesQualityGate: score >= 60,
    qualityElements: [MessageQualityElements.Clarity, MessageQualityElements.Actionability],
    score,
  };
}
