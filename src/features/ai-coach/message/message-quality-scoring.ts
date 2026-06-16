import {
  MessageQualityElementValues,
  type MessageQualityElement,
} from './message-quality-schema';
import { GENERIC_PATTERNS, QUALITY_PATTERNS } from './message-quality-patterns';

export function detectGenericPatterns(content: string): {
  isGeneric: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let isGeneric = false;
  const lowerContent = content.toLowerCase();
  const genericPhrases = [
    'keep going',
    'you are doing great',
    'try focusing more',
    'come back today',
    'good job',
    'nice work',
    'well done',
    'awesome',
    'fantastic',
    'you can do it',
    'believe in yourself',
    'stay strong',
    'keep it up',
  ];

  for (const phrase of genericPhrases) {
    const pattern = GENERIC_PATTERNS.find((candidate) =>
      candidate.source.includes(phrase.replace(/\s+/g, '\\s+')),
    );
    if (lowerContent.includes(phrase) || pattern?.test(content)) {
      reasons.push(`Generic pattern detected: ${phrase}`);
      if (reasons.length >= 3) {
        break;
      }
    }
  }

  if (content.length < 25) {
    isGeneric = true;
    reasons.push('Message too short (< 20 chars)');
  }
  if (
    !containsSpecificData(content) ||
    lowerContent.includes('try focusing more')
  ) {
    isGeneric = true;
    reasons.push('No specific user data referenced');
  }
  if (isAllEncouragement(content)) {
    isGeneric = true;
    reasons.push('Only generic encouragement, no specific guidance');
  }

  return { isGeneric, reasons };
}

export function detectQualityElements(
  content: string,
): MessageQualityElement[] {
  const elements: MessageQualityElement[] = [];
  for (const element of MessageQualityElementValues) {
    if (QUALITY_PATTERNS[element].some((pattern) => pattern.test(content))) {
      elements.push(element);
    }
  }
  return elements;
}

export function calculateQualityConfidence(
  isGeneric: boolean,
  qualityElementCount: number,
  contentLength: number,
): number {
  let confidence = 0.5;
  if (isGeneric) {
    confidence -= 0.4;
  }
  confidence += qualityElementCount * 0.15;
  if (contentLength >= 50 && contentLength <= 300) {
    confidence += 0.1;
  } else if (contentLength > 300) {
    confidence -= 0.05;
  }
  return Math.max(0, Math.min(1, confidence));
}

export function determineSuggestedAction(
  isGeneric: boolean,
  qualityElementCount: number,
  confidence: number,
): 'approve' | 'reject' | 'improve' {
  if (isGeneric && qualityElementCount < 2) {
    return 'reject';
  }
  if (confidence < 0.4 || qualityElementCount < 2) {
    return 'improve';
  }
  return 'approve';
}

function containsSpecificData(content: string): boolean {
  const hasNumbers = /\d+/.test(content);
  const hasTime =
    /\b(\d+:\d+|\d+ [ap]m|today|tonight|morning|afternoon|evening)\b/i.test(
      content,
    );
  const hasDifficulty = /\b(easy|normal|challenging|push)\b/i.test(content);
  const hasSessionType =
    /\b(recovery|focus|deep work|meditation|study)\b/i.test(content);
  return hasNumbers || hasTime || hasDifficulty || hasSessionType;
}

function isAllEncouragement(content: string): boolean {
  const encouragementWords = [
    'great',
    'amazing',
    'fantastic',
    'wonderful',
    'excellent',
    'good',
    'nice',
    'awesome',
    'incredible',
    'unstoppable',
    'keep',
    'going',
    'continue',
    'believe',
    'trust',
    'stay',
  ];
  const words = content.toLowerCase().split(/\s+/);
  const encouragementCount = words.filter((word) =>
    encouragementWords.some((encouragement) => word.includes(encouragement)),
  ).length;
  return (
    words.length > 0 &&
    encouragementCount / words.length > 0.7 &&
    !containsSpecificData(content)
  );
}
